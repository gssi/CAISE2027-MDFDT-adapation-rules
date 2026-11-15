/**
 * Model evolutions the modelling assistant can propose.
 *
 * `proposeEvolution` answers a bottom-up change: when the data of a DT no
 * longer conforms to its type, it proposes the next version of the type and
 * moves the instance to it. `migrateInstance` moves an instance to an existing
 * version of its type. Both only build candidates: nothing is committed
 * without a modeler decision.
 */
import {
  classProps,
  cloneFederation,
  typeOf,
  versions,
  type Capabilities,
  type Federation,
} from "../federation";
import {
  DATA_LEVEL,
  modelKey,
  targets,
  type Dict,
  type EAttribute,
  type EClass,
  type EObject,
  type Model,
} from "../kernel/model";
import { parseRef, ref } from "../kernel/refs";
import { isSensor } from "../devices";
import { addSensor, observeParameter } from "../modeling/parts";
import { linkVersions } from "../modelset";
import { boundKeys, type ChangeSet } from "./change";

export class EvolutionError extends Error {}

export interface EvolutionProposal {
  package: string;
  instance: string;
  fromVersion: number;
  toVersion: number;
  replaces: [string, string][];
}

export function proposalToDict(proposal: EvolutionProposal): Dict {
  return {
    type: proposal.package,
    from: proposal.fromVersion,
    to: proposal.toVersion,
    instance: proposal.instance,
    replaces: proposal.replaces.map(([before, after]) => `${before} -> ${after}`),
  };
}

function camel(key: string): string {
  return key
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function snake(name: string): string {
  return name.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "_").toLowerCase();
}

/** The capability key that can back an attribute: same type and unit, and the
 * same meaning whenever both sides declare one. */
function matchingKey(capabilities: Capabilities, attribute: EAttribute): string | null {
  const fits = (capability: Dict) => {
    if ((capability.eType ?? null) !== attribute.eType) return false;
    if ((capability.unit ?? null) !== attribute.unit) return false;
    const declared = capability.meaning ?? null;
    return declared === null || attribute.meaning === null || declared === attribute.meaning;
  };
  if (attribute.name in capabilities && fits(capabilities[attribute.name])) return attribute.name;
  const candidates = Object.keys(capabilities).filter((key) => fits(capabilities[key]));
  return candidates.length === 1 ? candidates[0] : null;
}

/** Retype an O0 model to `targetKey`, in place. Objects whose class survives
 * are kept; every class without an object gets one, bound to the capabilities
 * of the DT. Throws when the DT cannot back a required attribute. */
export function migrateInstance(fed: Federation, instanceName: string, targetKey: string): void {
  const instance = fed.models[instanceName];
  const target = fed.models[targetKey];
  const capabilities = fed.capabilities[instanceName] ?? {};
  const objects: Record<string, EObject> = {};
  for (const obj of Object.values(instance.objects)) {
    const eclass = target.eClasses[obj.instanceOf];
    if (!eclass) continue;
    const kept: EObject = structuredClone(obj);
    kept.bindings = Object.fromEntries(
      Object.entries(kept.bindings).filter(([a]) => a in eclass.eAttributes),
    );
    kept.slots = Object.fromEntries(
      Object.entries(kept.slots).filter(([s]) => s in eclass.eAttributes || s in eclass.eReferences),
    );
    objects[kept.name] = kept;
  }
  const instantiated = new Set(Object.values(objects).map((o) => o.instanceOf));
  for (const eclass of Object.values(target.eClasses)) {
    if (instantiated.has(eclass.name)) continue;
    const obj: EObject = { name: snake(eclass.name), instanceOf: eclass.name, bindings: {}, slots: {} };
    if (classProps(fed, target, eclass.name).requiresSource) {
      for (const attribute of Object.values(eclass.eAttributes)) {
        const key = matchingKey(capabilities, attribute);
        if (key === null) {
          throw new EvolutionError(
            `${instanceName} has no capability for ${ref(targetKey, eclass.name, attribute.name)}`,
          );
        }
        obj.bindings[attribute.name] = key;
      }
    }
    objects[obj.name] = obj;
  }
  for (const obj of Object.values(objects)) {
    for (const reference of Object.values(target.eClasses[obj.instanceOf].eReferences)) {
      const valid = targets(obj, reference.name).filter((t) => t in objects);
      if (valid.length || reference.lowerBound === 0) {
        if (!valid.length) delete obj.slots[reference.name];
        continue;
      }
      const candidates = Object.values(objects).filter((o) => o.instanceOf === reference.eType);
      // What it referred to is gone and nothing takes its place for sure: the
      // reference is left open, for the gate to point out and the modeler to settle.
      if (candidates.length === 1) obj.slots[reference.name] = candidates[0].name;
      else delete obj.slots[reference.name];
    }
  }
  instance.objects = objects;
  instance.typedBy = targetKey;
}

/**
 * Candidate model for a bottom-up change.
 *
 * The reported capabilities are always recorded. When a bound observation key
 * is lost, the next version of the type is proposed: the classes left without
 * data are replaced by classes for the new keys, named after the hints the DT
 * reports (`observation`, `source`) when it gives any.
 */
export function proposeEvolution(
  head: Federation,
  changeset: ChangeSet,
): [Federation, EvolutionProposal | null] {
  const candidate = cloneFederation(head);
  const source = changeset.origin;
  if (source === null || !(source in candidate.models)) return [candidate, null];
  const capabilities = (candidate.capabilities[source] ??= {});
  const lost: string[] = [];
  const fresh: Record<string, Dict> = {};
  for (const change of changeset.changes) {
    const body = change.after ?? change.before;
    if (change.level !== DATA_LEVEL || typeof body !== "object" || body === null) continue;
    const key = parseRef(change.element).path[0];
    if (change.kind === "removed" || change.kind === "modified") {
      lost.push(key);
      delete capabilities[key];
    }
    if (change.kind === "added" || change.kind === "modified") {
      fresh[key] = { ...(change.after as Dict) };
      capabilities[key] = { ...(change.after as Dict) };
    }
  }

  const bound = boundKeys(head, source);
  const lostBound = lost.filter((key) => key in bound);
  if (!lostBound.length) return [candidate, null];

  const instance = head.models[source];
  const old = typeOf(head, instance);
  if (old === null) return [candidate, null];
  const evolved: Model = structuredClone(old);
  evolved.version = Math.max(...versions(head, old.name)) + 1;

  const removed: EClass[] = [];
  for (const key of lostBound) {
    const [objName, attribute] = bound[key];
    const eclass = evolved.eClasses[instance.objects[objName].instanceOf];
    if (!eclass) continue;
    delete eclass.eAttributes[attribute];
    if (!Object.keys(eclass.eAttributes).length) {
      removed.push(eclass);
      delete evolved.eClasses[eclass.name];
    }
  }

  const template = removed[0] ?? null;
  const meta = head.models[old.typedBy ?? ""];
  let concept = template?.instanceOf ?? null;
  if (concept === null && meta) {
    concept =
      Object.entries(meta.eClasses).find(([, c]) => c.properties.requiresSource)?.[0] ?? null;
  }

  let replaces: [string, string][] = [];
  const added: string[] = [];
  for (const [key, capability] of Object.entries(fresh)) {
    if (key in bound && !lostBound.includes(key)) continue;
    if (capability.part) continue; // provided by a part of a device: modelled with the part, below
    const className: string = capability.observation || camel(key);
    let eclass = evolved.eClasses[className];
    if (!eclass) {
      eclass = {
        name: className,
        instanceOf: concept,
        eAttributes: {},
        eReferences: template ? structuredClone(template.eReferences) : {},
        properties: template ? structuredClone(template.properties) : {},
      };
      evolved.eClasses[className] = eclass;
      added.push(className);
    }
    eclass.eAttributes[key] = {
      name: key,
      eType: capability.eType,
      unit: capability.unit ?? null,
      meaning: capability.meaning ?? null,
      upperBound: 1,
    };
    const sourceHint: string | undefined = capability.source;
    if (sourceHint && template) {
      // The DT names a new data source: it replaces the one of the lost data.
      for (const reference of Object.values({ ...eclass.eReferences })) {
        const previous = evolved.eClasses[reference.eType];
        const stillUsed = Object.values(evolved.eClasses).some(
          (c) => c !== eclass && Object.values(c.eReferences).some((r) => r.eType === reference.eType),
        );
        if (!previous || stillUsed || reference.eType === sourceHint) continue;
        delete evolved.eClasses[previous.name];
        evolved.eClasses[sourceHint] = {
          name: sourceHint,
          instanceOf: previous.instanceOf,
          eAttributes: structuredClone(previous.eAttributes),
          eReferences: {},
          properties: structuredClone(previous.properties),
        };
        eclass.eReferences[reference.name] = {
          name: reference.name,
          eType: sourceHint,
          lowerBound: reference.lowerBound,
          upperBound: reference.upperBound,
          containment: false,
        };
        replaces.push([previous.name, sourceHint]);
      }
    }
  }
  const paired: [string, string][] = [];
  for (let i = 0; i < Math.min(removed.length, added.length); i++) {
    paired.push([removed[i].name, added[i]]);
  }
  replaces = [...paired, ...replaces];

  // A sensor all of whose parameters are gone is gone itself, with its class
  // when no other sensor of that kind is left.
  const goneSensors = Object.values(instance.objects).filter(
    (obj) =>
      isSensor(head, instance, obj) &&
      Object.keys(obj.bindings).length > 0 &&
      Object.values(obj.bindings).every((key) => lost.includes(key)),
  );
  const goneClasses = [...new Set(goneSensors.map((obj) => obj.instanceOf))].filter((name) =>
    Object.values(instance.objects).every((obj) => obj.instanceOf !== name || goneSensors.includes(obj)),
  );
  for (const name of goneClasses) delete evolved.eClasses[name];

  candidate.models[modelKey(evolved)] = evolved;
  migrateInstance(candidate, source, modelKey(evolved));
  for (const obj of goneSensors) delete candidate.models[source].objects[obj.name];

  // A part that is attached but was not in the model: the part, and an
  // observation of every parameter it senses, on the key it provides.
  const parts = new Map<string, { part: Dict; keys: Record<string, string>; hints: Record<string, string> }>();
  for (const [key, capability] of Object.entries(fresh)) {
    if (!capability.part) continue;
    const entry: { part: Dict; keys: Record<string, string>; hints: Record<string, string> } = parts.get(
      capability.part.uid,
    ) ?? { part: capability.part, keys: {}, hints: {} };
    entry.keys[capability.part.parameter] = key;
    if (capability.observation) entry.hints[capability.part.parameter] = capability.observation;
    parts.set(capability.part.uid, entry);
  }
  const newSensors: string[] = [];
  const newObservations: string[] = [];
  for (const { part, keys, hints } of parts.values()) {
    const reached = { type: String(candidate.models[source].objects[part.device]?.slots.connector ?? ""), settings: [] };
    const sensor = addSensor(candidate, source, part.device, reached, part.kind, part.uid, keys);
    if (!sensor) continue;
    newSensors.push(candidate.models[source].objects[sensor].instanceOf);
    for (const [parameter, key] of Object.entries(keys)) {
      const observation = observeParameter(candidate, source, sensor, parameter, hints[parameter]);
      if (observation) newObservations.push(candidate.models[source].objects[observation].instanceOf);
      delete capabilities[key]; // the sensor of the model provides it now
    }
  }
  if (parts.size) {
    // What replaced what: the observations left without data by the new ones,
    // the sensors that are gone by the parts that came.
    const pairs: [string, string][] = [];
    removed.slice(added.length).forEach((eclass, i) => newObservations[i] && pairs.push([eclass.name, newObservations[i]]));
    goneClasses.forEach((name, i) => newSensors[i] && pairs.push([name, newSensors[i]]));
    replaces = [...replaces, ...pairs];
    // What referred to something replaced now refers to what replaced it.
    const became = new Map(replaces);
    for (const eclass of Object.values(evolved.eClasses)) {
      for (const reference of Object.values(eclass.eReferences)) {
        if (!(reference.eType in evolved.eClasses) && became.has(reference.eType)) {
          reference.eType = became.get(reference.eType) as string;
        }
      }
    }
    migrateInstance(candidate, source, modelKey(evolved));
  }
  for (const obj of Object.values(candidate.models[source].objects)) {
    if (!isSensor(candidate, candidate.models[source], obj)) continue;
    for (const [attribute, key] of Object.entries(obj.bindings)) if (lost.includes(key)) delete obj.bindings[attribute];
  }
  linkVersions(candidate, old, evolved, replaces);
  return [
    candidate,
    {
      package: old.name,
      instance: source,
      fromVersion: old.version as number,
      toVersion: evolved.version,
      replaces,
    },
  ];
}
