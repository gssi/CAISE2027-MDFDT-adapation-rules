/**
 * Step 1: identify the change and its origin (DT, level).
 *
 * A change is either observed at runtime (the data a DT provides no longer
 * matches the committed model) or made by the modeler (a model edit). Both are
 * compared with the last committed version, at every level.
 */
import { availableKeys, isSensor } from "../devices";
import { dtLabel, typeOf, type Federation } from "../federation";
import {
  DATA_LEVEL,
  LEVELS,
  etypeOf,
  modelToDict,
  valueConforms,
  type Dict,
} from "../kernel/model";
import { dataRef, parseRef } from "../kernel/refs";
import { linkToDict } from "../weaving/model";

export const RUNTIME = "runtime_observation";
export const EDIT = "model_edit";
export const TIMELINESS = "timeliness_violation";
const CONTAINERS = ["eClasses", "objects", "eAttributes", "eReferences"];

export interface Change {
  kind: "added" | "removed" | "modified";
  level: string; // data | O0 | O1 | O2 | weaving | catalogue
  element: string;
  before?: unknown;
  after?: unknown;
}

export interface ChangeSet {
  trigger: string;
  origin: string | null; // the model where the change originates
  originDT: string | null;
  originLevel: string | null;
  base: number | null; // the commit the change is compared with
  changes: Change[];
}

const present = (value: unknown) => value !== null && value !== undefined;

export function changeToDict(change: Change): Dict {
  const out: Dict = { kind: change.kind, level: change.level, element: change.element };
  if (present(change.before)) out.before = change.before;
  if (present(change.after)) out.after = change.after;
  return out;
}

export function changeFromDict(data: Dict): Change {
  const out: Change = { kind: data.kind, level: data.level, element: data.element };
  if (present(data.before)) out.before = data.before;
  if (present(data.after)) out.after = data.after;
  return out;
}

export function changeSetToDict(set: ChangeSet): Dict {
  return {
    artifact: "change-set",
    trigger: set.trigger,
    base: set.base,
    origin: { dt: set.originDT, model: set.origin, level: set.originLevel },
    changes: set.changes.map(changeToDict),
  };
}

export function changeSetFromDict(data: Dict): ChangeSet {
  const origin: Dict = data.origin ?? {};
  return {
    trigger: data.trigger,
    origin: origin.model ?? null,
    originDT: origin.dt ?? null,
    originLevel: origin.level ?? null,
    base: data.base ?? null,
    changes: ((data.changes ?? []) as Dict[]).map(changeFromDict),
  };
}

// -- generic diff of two versions of the modeling layer ----------------------

const isDict = (value: unknown): value is Dict =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function union(a: Dict, b: Dict): string[] {
  return [...Object.keys(a), ...Object.keys(b).filter((key) => !(key in a))];
}

function walk(prefix: string, level: string, before: unknown, after: unknown, out: Change[]) {
  if (isDict(before) && isDict(after)) {
    for (const key of union(before, after)) {
      if (CONTAINERS.includes(key)) {
        walk(prefix, level, before[key] ?? {}, after[key] ?? {}, out);
        continue;
      }
      const element = `${prefix}${prefix.endsWith("#") ? "" : "."}${key}`;
      if (!(key in after)) out.push({ kind: "removed", level, element, before: before[key] });
      else if (!(key in before)) out.push({ kind: "added", level, element, after: after[key] });
      else walk(element, level, before[key], after[key], out);
    }
  } else if (!same(before, after)) {
    out.push({ kind: "modified", level, element: prefix, before, after });
  }
}

function weavingTree(fed: Federation, name: string): Dict {
  const tree: Dict = {};
  for (const link of fed.weaving[name]?.links ?? []) {
    const body = linkToDict(link);
    delete body.id;
    tree[link.id] = body;
  }
  return tree;
}

/** What changed between two versions, at every level. */
export function diff(before: Federation, after: Federation): Change[] {
  const out: Change[] = [];
  for (const key of union(before.models, after.models)) {
    const old = before.models[key];
    const now = after.models[key];
    const level = (now ?? old).level;
    if (!now) out.push({ kind: "removed", level, element: key, before: modelToDict(old) });
    else if (!old) out.push({ kind: "added", level, element: key, after: modelToDict(now) });
    else walk(`${key}#`, level, modelToDict(old), modelToDict(now), out);
  }
  for (const name of union(before.weaving, after.weaving)) {
    walk(`${name}#`, "weaving", weavingTree(before, name), weavingTree(after, name), out);
  }
  for (const name of union(before.capabilities, after.capabilities)) {
    const old = before.capabilities[name] ?? {};
    const now = after.capabilities[name] ?? {};
    for (const key of union(old, now)) {
      const element = dataRef(name, key);
      if (!(key in now)) out.push({ kind: "removed", level: DATA_LEVEL, element, before: old[key] });
      else if (!(key in old)) out.push({ kind: "added", level: DATA_LEVEL, element, after: now[key] });
      else if (!same(old[key], now[key])) {
        out.push({ kind: "modified", level: DATA_LEVEL, element, before: old[key], after: now[key] });
      }
    }
  }
  const rules = (fed: Federation) =>
    Object.fromEntries(fed.derivations.map((r) => [`${r.source}->${r.target}`, r.expression]));
  walk("derivations#", "catalogue", rules(before), rules(after), out);
  return out;
}

// -- change identification ---------------------------------------------------

/** Observation key -> [object, attribute] that uses it, for one O0 model. A
 * sensor provides its keys and does not count as using them. */
export function boundKeys(fed: Federation, instanceName: string): Record<string, [string, string]> {
  const out: Record<string, [string, string]> = {};
  const instance = fed.models[instanceName];
  for (const obj of Object.values(instance?.objects ?? {})) {
    if (isSensor(fed, instance, obj)) continue;
    for (const [attribute, key] of Object.entries(obj.bindings)) out[key] = [obj.name, attribute];
  }
  return out;
}

export interface Observation {
  key: string;
  value: unknown;
  timestamp: number;
}

/** What a DT sends to the modeling layer. A key can only be declared missing
 * when the DT reports its capabilities. */
export interface ObservationBatch {
  source: string;
  capabilities?: Record<string, Dict>;
  observations?: Observation[];
}

/** Compare what a DT reports at runtime with the committed model. */
export function fromObservations(
  head: Federation,
  batch: ObservationBatch,
  base: number | null = null,
): ChangeSet {
  const source = batch.source;
  const instance = head.models[source];
  const o1 = typeOf(head, instance);
  const known = availableKeys(head, source);
  const reported = batch.capabilities;
  const changes = new Map<string, Change>();

  if (reported) {
    for (const key of union(known, reported)) {
      const element = dataRef(source, key);
      if (!(key in reported)) {
        changes.set(element, { kind: "removed", level: DATA_LEVEL, element, before: known[key] });
      } else if (!(key in known)) {
        changes.set(element, { kind: "added", level: DATA_LEVEL, element, after: reported[key] });
      } else if (!same(known[key], reported[key])) {
        changes.set(element, {
          kind: "modified",
          level: DATA_LEVEL,
          element,
          before: known[key],
          after: reported[key],
        });
      }
    }
  }
  const current = reported ?? known;
  const bound = boundKeys(head, source);
  for (const observation of batch.observations ?? []) {
    const { key, value } = observation;
    const element = dataRef(source, key);
    if (changes.has(element)) continue;
    if (!(key in current)) {
      changes.set(element, {
        kind: "added",
        level: DATA_LEVEL,
        element,
        after: { eType: etypeOf(value) },
      });
    } else if (key in bound && o1 !== null) {
      const [objName, attribute] = bound[key];
      const expected = o1.eClasses[instance.objects[objName].instanceOf].eAttributes[attribute];
      if (!valueConforms(value, expected.eType)) {
        changes.set(element, {
          kind: "modified",
          level: DATA_LEVEL,
          element,
          before: { eType: expected.eType },
          after: { eType: etypeOf(value) },
        });
      }
    }
  }
  return {
    trigger: RUNTIME,
    origin: source,
    originDT: dtLabel(head, source),
    originLevel: changes.size ? DATA_LEVEL : null,
    base,
    changes: [...changes.values()],
  };
}

/** Compare a model edit with the committed model. The origin is the highest
 * level that changed: lower levels follow from it. */
export function fromEdit(head: Federation, working: Federation, base: number | null = null): ChangeSet {
  const changes = diff(head, working);
  const set: ChangeSet = {
    trigger: EDIT,
    origin: null,
    originDT: null,
    originLevel: null,
    base,
    changes,
  };
  for (const level of LEVELS) {
    const atLevel = changes.filter((c) => c.level === level);
    if (atLevel.length) {
      const key = parseRef(atLevel[0].element).model;
      set.origin = key;
      set.originLevel = level;
      set.originDT = dtLabel(working, key);
      return set;
    }
  }
  if (changes.length) set.originLevel = changes[0].level;
  return set;
}

export interface Violation extends Dict {
  correspondence: string;
  element: string;
  participating: string;
  source: string;
  violation: string;
  expected: Dict;
  reason: string;
}

/** A timeliness violation observed at runtime re-enters the process as a change. */
export function fromTimeliness(
  head: Federation,
  violations: Violation[],
  base: number | null = null,
): ChangeSet {
  const origin = violations.length ? parseRef(violations[0].source).model : null;
  return {
    trigger: TIMELINESS,
    origin,
    originDT: origin ? dtLabel(head, origin) : null,
    originLevel: violations.length ? DATA_LEVEL : null,
    base,
    changes: violations.map((v) => ({
      kind: "modified",
      level: DATA_LEVEL,
      element: v.source,
      before: v.expected,
      after: v,
    })),
  };
}
