/**
 * Model repository on disk: one model per DT, each with its own versions.
 *
 *   <root>/repository.yaml                 the models, in order
 *   <root>/<model>/HEAD                    its current version
 *   <root>/<model>/versions/0002/          the files of that version
 *       version.yaml                       parent, message, and the version the
 *                                          other models were at (its context)
 *       changes.munidiff                   what changed since the parent
 *       process/                           the artifacts and the decision behind it
 *
 * A model is committed on its own, after passing its own gate.
 */
import fs from "node:fs";
import path from "node:path";

import { headFederation, headsOf, restoreBlockers } from "@/engine/assistant/session";
import { issueText, type Issue } from "@/engine/conformance";
import { type Federation, type FileMap } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { dumpYaml, loadYaml } from "@/engine/kernel/yaml";
import { asNextVersion, assemble, extract, gateFor, type ModelVersion } from "@/engine/modelset";
import { munidiff } from "@/engine/munidiff";
import { project } from "@/engine/runtime/projection";

export class GateError extends Error {
  constructor(public issues: Issue[]) {
    super("commit rejected:\n" + issues.map((issue) => `  ${issueText(issue)}`).join("\n"));
  }
}

const META = "version.yaml";
const CHANGES = "changes.munidiff";
const tag = (version: number) => String(version).padStart(4, "0");

/** The YAML files directly inside `dir`. */
export function readDir(dir: string): FileMap {
  const files: FileMap = {};
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".yaml")) {
      files[entry.name] = fs.readFileSync(path.join(dir, entry.name), "utf8");
    }
  }
  return files;
}

function writeDir(dir: string, files: FileMap): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), text, "utf8");
}

export interface VersionInfo {
  model: string;
  id: number;
  parent: number | null;
  message: string;
  context: Record<string, number>;
  hasProcess: boolean;
}

/** A set of models to start a repository from: `<dir>/<model>/*.yaml`. */
export function readModels(dir: string): ModelVersion[] {
  if (!fs.existsSync(dir)) throw new Error(`model directory not found: ${dir}`);
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ model: entry.name, version: 1, files: readDir(path.join(dir, entry.name)) }))
    .filter((model) => Object.keys(model.files).length > 0);
}

export class Repository {
  constructor(public root: string) {}

  /** A repository of the earlier format: one global history for all the models. */
  isLegacy(): boolean {
    return fs.existsSync(path.join(this.root, "HEAD")) && fs.existsSync(path.join(this.root, "commits"));
  }

  models(): string[] {
    const index = path.join(this.root, "repository.yaml");
    if (!fs.existsSync(index)) return [];
    return loadYaml<Dict>(fs.readFileSync(index, "utf8"))?.models ?? [];
  }

  isRepository(): boolean {
    return this.models().length > 0;
  }

  head(model: string): number | null {
    const marker = path.join(this.root, model, "HEAD");
    return fs.existsSync(marker) ? Number(fs.readFileSync(marker, "utf8").trim()) : null;
  }

  versionDir(model: string, version: number): string {
    return path.join(this.root, model, "versions", tag(version));
  }

  info(model: string, version: number): VersionInfo {
    const dir = this.versionDir(model, version);
    const data = loadYaml<Dict>(fs.readFileSync(path.join(dir, META), "utf8"));
    return {
      model,
      id: data.id,
      parent: data.parent ?? null,
      message: data.message,
      context: data.context ?? {},
      hasProcess: fs.existsSync(path.join(dir, "process")),
    };
  }

  history(model: string): VersionInfo[] {
    return Array.from({ length: this.head(model) ?? 0 }, (_, index) => this.info(model, index + 1));
  }

  read(model: string, version: number): ModelVersion {
    const files = readDir(this.versionDir(model, version));
    delete files[META];
    return { model, version, files, context: this.info(model, version).context };
  }

  /** Every version of every model. */
  versions(): ModelVersion[] {
    return this.models().flatMap((model) =>
      Array.from({ length: this.head(model) ?? 0 }, (_, index) => this.read(model, index + 1)),
    );
  }

  /** The modeling layer at the current version of every model. */
  federation(): Federation {
    return headFederation(this.versions());
  }

  /**
   * Commit `model` as it is in `candidate`, as its next version. The model must
   * pass its gate; the other models are not touched.
   */
  commit(model: string, candidate: Federation, message: string, process?: FileMap): number {
    const versions = this.versions();
    const parent = this.head(model);
    const next = (parent ?? 0) + 1;
    const head = parent ? headFederation(versions) : assemble([]);
    const fed = parent ? asNextVersion(candidate, head, model, next) : candidate;
    const issues = gateFor(fed, model);
    if (issues.length) throw new GateError(issues);

    const dir = this.versionDir(model, next);
    fs.rmSync(dir, { recursive: true, force: true }); // what a restore interrupted half-way left behind
    const context = headsOf(versions);
    delete context[model];
    writeDir(dir, extract(fed, model));
    writeDir(dir, { [META]: dumpYaml({ id: next, parent, message, context }) });
    const changes = munidiff(head, fed, model, {
      from: parent ? `${model}/versions/${tag(parent)}` : "/dev/null",
      to: `${model}/versions/${tag(next)}`,
    });
    fs.writeFileSync(path.join(dir, CHANGES), changes, "utf8");
    if (process) writeDir(path.join(dir, "process"), process);

    const known = this.models();
    if (!known.includes(model)) {
      writeDir(this.root, { "repository.yaml": dumpYaml({ models: [...known, model] }) });
    }
    fs.writeFileSync(path.join(this.root, model, "HEAD"), `${next}\n`);
    return next;
  }

  /**
   * Make an earlier version of `model` its current one again and remove the
   * versions after it. Refused while a version of another model was committed
   * against one of them: that model goes back first. Returns what was removed.
   */
  restore(model: string, target: number): number[] {
    const head = this.head(model);
    if (head === null) throw new Error(`unknown model ${model}`);
    if (!Number.isInteger(target) || target < 1 || target >= head) {
      throw new Error(`${model} has no version ${target} before its current one`);
    }
    const blockers = restoreBlockers(this.versions(), model, target);
    if (blockers.length) {
      throw new Error(
        blockers
          .map((b) => `${b.model} v${b.version} was committed against ${model} v${b.against}: restore ${b.model} first`)
          .join("; "),
      );
    }
    // HEAD first: the versions after it are no longer part of the model whatever happens next.
    fs.writeFileSync(path.join(this.root, model, "HEAD"), `${target}\n`);
    const removed: number[] = [];
    for (let version = target + 1; version <= head; version++) {
      fs.rmSync(this.versionDir(model, version), { recursive: true, force: true });
      removed.push(version);
    }
    return removed;
  }

  /** First version of every model of a set; a model that weaves others comes after them. */
  init(models: ModelVersion[]): void {
    const fed = assemble(models);
    const rank = (m: ModelVersion) =>
      "concepts.mlm.yaml" in m.files ? 0 : "weaving.wm.yaml" in m.files ? 2 : 1;
    for (const model of [...models].sort((a, b) => rank(a) - rank(b))) {
      this.commit(model.model, fed, "initial model");
    }
    this.writeProjection();
  }

  processFiles(model: string, version: number): FileMap {
    return readDir(path.join(this.versionDir(model, version), "process"));
  }

  changes(model: string, version: number): string {
    const file = path.join(this.versionDir(model, version), CHANGES);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  }

  writeProjection(): string {
    const target = path.join(this.root, "runtime");
    writeDir(target, { "config.yaml": dumpYaml(project(this.federation())) });
    return path.join(target, "config.yaml");
  }
}
