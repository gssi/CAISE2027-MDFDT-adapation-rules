/**
 * The modelling assistant at work on a repository of models: what triggers a
 * run of the process for the model a modeler has open, computed the same way
 * in the browser (to show it) and on the server (to commit the decision).
 */
import { type Federation, type FileMap } from "../federation";
import {
  FILES,
  assemble,
  transplant,
  wovenBy,
  type ModelVersion,
} from "../modelset";
import { project } from "../runtime/projection";
import { checkTimeliness } from "../runtime/simulator";
import { incomingRequests } from "./adaptation";
import { type ObservationBatch } from "./change";
import { onEdit, onObservations, onTimeliness, type ProcessResult } from "./process";

/** What triggers a run of the process, in the context of one model. */
export type Trigger =
  | { kind: "edit"; files: FileMap } // the working copy of the model
  | { kind: "observations"; batch: ObservationBatch } // its DT reports at runtime
  | { kind: "timeliness"; batches: ObservationBatch[]; now: number }
  | { kind: "incoming" } // the models it weaves moved on
  | { kind: "request"; correspondence: string }; // another DT asks for something

/** The current version of every model. */
export function headsOf(versions: ModelVersion[]): Record<string, number> {
  const heads: Record<string, number> = {};
  for (const v of versions) heads[v.model] = Math.max(heads[v.model] ?? 0, v.version);
  return heads;
}

/** The modeling layer with every model at the version given in `at`. */
export function assembleAt(versions: ModelVersion[], at: Record<string, number>): Federation {
  return assemble(
    versions.filter((v) => at[v.model] === v.version),
    versions.filter((v) => at[v.model] !== undefined && v.version < at[v.model]),
  );
}

/**
 * What keeps the versions of `model` after `target` in the repository: the
 * versions of other models that were committed when `model` was already past
 * `target`. They were verified against what would be removed, so their own
 * model has to go back first. For each such model, its earliest such version.
 */
export function restoreBlockers(
  versions: ModelVersion[],
  model: string,
  target: number,
): { model: string; version: number; against: number }[] {
  const first: Record<string, { model: string; version: number; against: number }> = {};
  for (const v of versions) {
    const against = v.context?.[model];
    if (v.model === model || against === undefined || against <= target) continue;
    if (!first[v.model] || v.version < first[v.model].version) first[v.model] = { model: v.model, version: v.version, against };
  }
  return Object.values(first);
}

export function headFederation(versions: ModelVersion[]): Federation {
  return assembleAt(versions, headsOf(versions));
}

/**
 * Drift that reaches an initiating DT from the models it weaves: they moved on
 * since its current version was committed. The change is the difference between
 * what the model was verified against and what those models are now.
 */
export function incomingDrift(versions: ModelVersion[], focus: string): ProcessResult | null {
  const heads = headsOf(versions);
  const head = assembleAt(versions, heads);
  const context = versions.find((v) => v.model === focus && v.version === heads[focus])?.context ?? {};
  const before = { ...heads };
  let moved = false;
  for (const woven of wovenBy(head, focus)) {
    if (context[woven] !== undefined && context[woven] !== heads[woven]) {
      before[woven] = context[woven];
      moved = true;
    }
  }
  if (!moved) return null;
  const result = onEdit(assembleAt(versions, before), head, heads[focus]);
  return result.drift.links.length || result.plan.resolutions.length ? result : null;
}

/**
 * The working copy of a model as files, turned into the federation it gives.
 * The committed type of the model stays, as history: a working copy that is
 * already the next version (a proposal the modeler went on editing) refers to it.
 */
export function withWorkingCopy(versions: ModelVersion[], focus: string, files: FileMap): Federation {
  const heads = headsOf(versions);
  const current = versions.filter((v) => heads[v.model] === v.version);
  return assemble(
    current.map((v) => (v.model === focus ? { ...v, files } : v)),
    versions.filter((v) => v.version < heads[v.model] || v.model === focus),
  );
}

/** Run the process for `focus` on a trigger; `null` when there is nothing to process. */
export function runTrigger(versions: ModelVersion[], focus: string, trigger: Trigger): ProcessResult | null {
  const heads = headsOf(versions);
  const head = assembleAt(versions, heads);
  const base = heads[focus] ?? null;
  if (trigger.kind === "edit") {
    // only what the model owns can change in its working copy
    const working = transplant(head, withWorkingCopy(versions, focus, trigger.files), focus);
    return onEdit(head, working, base);
  }
  if (trigger.kind === "observations") return onObservations(head, trigger.batch, base);
  if (trigger.kind === "timeliness") {
    const violations = checkTimeliness(project(head, base), trigger.batches, trigger.now);
    return violations.length ? onTimeliness(head, violations, base) : null;
  }
  if (trigger.kind === "incoming") return incomingDrift(versions, focus);
  const request = incomingRequests(head, focus).find((r) => r.correspondence === trigger.correspondence);
  return request?.proposal ? onEdit(head, request.proposal, base) : null;
}

export { FILES };
