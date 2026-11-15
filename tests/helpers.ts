import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { type ObservationBatch } from "@/engine/assistant/change";
import { type ProcessResult } from "@/engine/assistant/process";
import { runTrigger, type Trigger } from "@/engine/assistant/session";
import { type Federation, type FileMap } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { loadYaml } from "@/engine/kernel/yaml";
import { applyEdit, assemble, extract, type ModelVersion } from "@/engine/modelset";
import { Repository, readDir, readModels } from "@/server/repository";
import { settle } from "@/server/settle";

export const SCENARIO = path.resolve(__dirname, "..", "scenarios", "building");
export const HIDDEN_COUNT = "room2-hidden-count";

export function readYaml<T = Dict>(...parts: string[]): T {
  return loadYaml<T>(fs.readFileSync(path.join(...parts), "utf8"));
}

/** The models of the scenario, optionally with a variant laid over them. */
export function scenarioModels(variant?: string): ModelVersion[] {
  const models = readModels(path.join(SCENARIO, "models"));
  if (variant) {
    for (const over of readModels(path.join(SCENARIO, "variants", variant))) {
      const target = models.find((m) => m.model === over.model);
      if (target) Object.assign(target.files, over.files);
    }
  }
  return models;
}

export function baseline(variant?: string): Federation {
  return assemble(scenarioModels(variant));
}

export function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "fmddt-"));
}

/** A repository holding the first version of every model of the scenario (A0). */
export function newRepo(variant?: string): Repository {
  const repo = new Repository(path.join(tempDir(), "repo"));
  repo.init(scenarioModels(variant));
  return repo;
}

export const a1Batch = () => readYaml<ObservationBatch>(SCENARIO, "a1", "observations.yaml");

export function run(repo: Repository, focus: string, trigger: Trigger): ProcessResult {
  const result = runTrigger(repo.versions(), focus, trigger);
  if (!result) throw new Error(`nothing to process for ${focus}`);
  return result;
}

/** A1, first decision: Room 1 accepts the evolution the assistant proposes. */
export function afterRoom1Evolves(variant?: string): Repository {
  const repo = newRepo(variant);
  settle(repo, "room1", { kind: "observations", batch: a1Batch() }, { decision: "accept" });
  return repo;
}

/** A1, second decision: Building derives the occupancy from the count. */
export function afterA1(variant?: string): Repository {
  const repo = afterRoom1Evolves(variant);
  settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "a" });
  return repo;
}

/** The working copy of Building with the A2 edit applied, as files. */
export function a2Edit(repo: Repository): FileMap {
  const edited = applyEdit(repo.federation(), "building", readDir(path.join(SCENARIO, "a2", "edit", "building")));
  return extract(edited, "building");
}

export const a2Trigger = (repo: Repository): Trigger => ({ kind: "edit", files: a2Edit(repo) });

export function runA2(repo: Repository): ProcessResult {
  return run(repo, "building", a2Trigger(repo));
}

/** A2 committed: a change request towards Room 2 is pending. */
export function afterA2(variant?: string): Repository {
  const repo = afterA1(variant);
  settle(repo, "building", a2Trigger(repo), { decision: "accept", option: "a" });
  return repo;
}

/** The variant played to the end: Room 2 models its count, Building binds it. */
export function afterBind(): Repository {
  const repo = afterA2(HIDDEN_COUNT);
  settle(repo, "room2", { kind: "request", correspondence: "c-r2-count" }, { decision: "accept" });
  settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "a" });
  return repo;
}

/** Plain data, as it would be read back from a YAML file. */
export function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
