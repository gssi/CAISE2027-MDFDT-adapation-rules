"use server";

import fs from "node:fs";
import path from "node:path";

import { PlanError } from "@/engine/assistant/adaptation";
import { type Decision } from "@/engine/assistant/process";
import { type Trigger } from "@/engine/assistant/session";
import { type Issue } from "@/engine/conformance";
import { type DeviceSpec, type Discovered, type Reading } from "@/engine/devices";
import { type FileMap } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { addDT } from "@/engine/modeling/models";
import { type ModelVersion } from "@/engine/modelset";

import { discoverDevice, invokeOperation, readDevice } from "./connectors";
import { GateError, Repository, readDir, readModels, type VersionInfo } from "./repository";
import { settle } from "./settle";

const repoPath = () => process.env.FMDDT_REPO ?? path.join(process.cwd(), "model-repo");
const scenarios = () => path.join(process.cwd(), "scenarios");

export interface RepoState {
  path: string;
  initialized: boolean;
  /** A repository of the earlier, single-history format lives at this path. */
  legacy: boolean;
  models: string[];
  /** Every version of every model, with its files. */
  versions: ModelVersion[];
  infos: VersionInfo[];
}

export interface VersionContent {
  info: VersionInfo;
  process: FileMap;
  changes: string;
}

export interface Examples {
  baselines: { scenario: string; variant: string | null }[];
  batches: { name: string; text: string }[];
  edits: { name: string; model: string; files: FileMap }[];
}

export type Outcome =
  | { ok: true; version: number | null; state: RepoState }
  | { ok: false; error: string; issues?: Issue[] };

function stateOf(repo: Repository): RepoState {
  const models = repo.models();
  return {
    path: repo.root,
    initialized: models.length > 0,
    legacy: repo.isLegacy(),
    models,
    versions: repo.versions(),
    infos: models.flatMap((model) => repo.history(model)),
  };
}

function failure(error: unknown): Outcome {
  if (error instanceof GateError) {
    return { ok: false, error: "the model does not pass its checks", issues: error.issues };
  }
  if (error instanceof PlanError) return { ok: false, error: error.message };
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
}

export async function getState(): Promise<RepoState> {
  return stateOf(new Repository(repoPath()));
}

const subdirs = (dir: string) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [];

/** Models, observation batches and model edits shipped under `scenarios/`. */
export async function getExamples(): Promise<Examples> {
  const examples: Examples = { baselines: [], batches: [], edits: [] };
  for (const scenario of subdirs(scenarios())) {
    const root = path.join(scenarios(), scenario);
    if (!fs.existsSync(path.join(root, "models"))) continue;
    examples.baselines.push({ scenario, variant: null });
    for (const variant of subdirs(path.join(root, "variants"))) examples.baselines.push({ scenario, variant });
    for (const step of subdirs(root)) {
      const dir = path.join(root, step);
      for (const [file, text] of Object.entries(readDir(dir))) {
        if (file.startsWith("observations")) examples.batches.push({ name: `${scenario}/${step}/${file}`, text });
      }
      for (const model of subdirs(path.join(dir, "edit"))) {
        examples.edits.push({
          name: `${scenario}/${step}`,
          model,
          files: readDir(path.join(dir, "edit", model)),
        });
      }
    }
  }
  return examples;
}

/** First version of every model, from a scenario shipped under `scenarios/`. */
export async function initRepository(scenario: string, variant: string | null): Promise<Outcome> {
  const repo = new Repository(repoPath());
  if (repo.isRepository()) return { ok: false, error: "the repository already has models" };
  if (repo.isLegacy()) return { ok: false, error: "archive the repository of the earlier format first" };
  if (!subdirs(scenarios()).includes(scenario)) return { ok: false, error: "unknown scenario" };
  try {
    const models = readModels(path.join(scenarios(), scenario, "models"));
    if (variant) {
      if (!subdirs(path.join(scenarios(), scenario, "variants")).includes(variant)) {
        return { ok: false, error: "unknown variant" };
      }
      for (const over of readModels(path.join(scenarios(), scenario, "variants", variant))) {
        const target = models.find((m) => m.model === over.model);
        if (target) Object.assign(target.files, over.files);
      }
    }
    repo.init(models);
    return { ok: true, version: 1, state: stateOf(repo) };
  } catch (error) {
    return failure(error);
  }
}

/** Set a repository of the earlier format aside, untouched, under another name. */
export async function archiveLegacy(): Promise<Outcome> {
  const repo = new Repository(repoPath());
  if (!repo.isLegacy()) return { ok: false, error: "there is nothing to archive" };
  let index = 1;
  while (fs.existsSync(`${repo.root}-archived-${index}`)) index++;
  fs.renameSync(repo.root, `${repo.root}-archived-${index}`);
  return { ok: true, version: null, state: stateOf(repo) };
}

export async function getVersion(model: string, version: number): Promise<VersionContent> {
  const repo = new Repository(repoPath());
  return {
    info: repo.info(model, version),
    process: repo.processFiles(model, version),
    changes: repo.changes(model, version),
  };
}

/**
 * Read the sensors of devices as a model describes them. The description comes
 * from the browser, so a device can be tried before its model is committed.
 */
export async function readDevices(devices: DeviceSpec[]): Promise<Reading[]> {
  const readings = await Promise.all(devices.map((device) => readDevice(device)));
  return readings.flat();
}

export async function discoverSensors(
  device: DeviceSpec,
): Promise<{ ok: true; found: Discovered[] } | { ok: false; error: string }> {
  try {
    return { ok: true, found: await discoverDevice(device) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Ask a part of a device to perform an operation of its class. This acts on the device. */
export async function invoke(
  device: DeviceSpec,
  part: string,
  operation: string,
  args: Dict,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await invokeOperation(device, part, operation, args);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Go back to an earlier version of a model: the versions after it are removed from the repository. */
export async function restoreVersion(model: string, version: number): Promise<Outcome> {
  const repo = new Repository(repoPath());
  try {
    if (!repo.models().includes(model)) return { ok: false, error: `unknown model ${model}` };
    repo.restore(model, version);
    repo.writeProjection();
    return { ok: true, version, state: stateOf(repo) };
  } catch (error) {
    return failure(error);
  }
}

/** The first version of the model of a new DT: empty, for its modeler to fill. */
export async function createModel(id: string, label: string): Promise<Outcome> {
  const repo = new Repository(repoPath());
  try {
    if (!repo.isRepository()) return { ok: false, error: "the repository has no models yet" };
    const candidate = repo.federation();
    const problem = addDT(candidate, id, label);
    if (problem) return { ok: false, error: problem };
    const version = repo.commit(id, candidate, "initial model");
    repo.writeProjection();
    return { ok: true, version, state: stateOf(repo) };
  } catch (error) {
    return failure(error);
  }
}

/** Apply the decision of the modeler of `focus`; only this commits. */
export async function decide(focus: string, trigger: Trigger, decision: Decision): Promise<Outcome> {
  const repo = new Repository(repoPath());
  try {
    if (!repo.models().includes(focus)) return { ok: false, error: `unknown model ${focus}` };
    const version = settle(repo, focus, trigger, decision);
    return { ok: true, version, state: stateOf(repo) };
  } catch (error) {
    return failure(error);
  }
}
