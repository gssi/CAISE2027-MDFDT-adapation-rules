/**
 * The content of the modeling layer: models of the three levels, weaving
 * models, the capabilities reported by the DTs and the derivation catalogue.
 */
import {
  DATA_LEVEL,
  DEFAULT_INTERIM,
  modelFromDict,
  modelKey,
  modelToDict,
  targets,
  type Dict,
  type EAttribute,
  type EClass,
  type EObject,
  type Model,
} from "./kernel/model";
import { parseRef, type ElementRef } from "./kernel/refs";
import { dumpYaml, loadYaml } from "./kernel/yaml";
import { ruleFromDict, ruleToDict, type DerivationRule } from "./mapping";
import { wmodelFromDict, wmodelToDict, type WLink, type WModel } from "./weaving/model";

export const CORRESPONDENCE = "Correspondence";
export const EVOLUTION = "Evolution";
export const REPRESENTATION = "Representation";

export type Capabilities = Record<string, Dict>;

export interface Federation {
  models: Record<string, Model>;
  weaving: Record<string, WModel>;
  capabilities: Record<string, Capabilities>;
  derivations: DerivationRule[];
}

/** A set of files of the modeling layer: relative path -> YAML text. */
export type FileMap = Record<string, string>;

export function emptyFederation(): Federation {
  return { models: {}, weaving: {}, capabilities: {}, derivations: [] };
}

export function cloneFederation(fed: Federation): Federation {
  return structuredClone(fed);
}

// -- persistence -------------------------------------------------------------

function byPath(left: string, right: string): number {
  const a = left.split("/");
  const b = right.split("/");
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return a.length - b.length;
}

export function federationFromFiles(files: FileMap): Federation {
  const fed = emptyFederation();
  const paths = Object.keys(files).sort(byPath);
  for (const path of paths.filter((p) => p.endsWith(".mlm.yaml"))) {
    const model = modelFromDict(loadYaml<Dict>(files[path]));
    fed.models[modelKey(model)] = model;
  }
  for (const path of paths.filter((p) => p.endsWith(".wm.yaml"))) {
    const wm = wmodelFromDict(loadYaml<Dict>(files[path]));
    fed.weaving[wm.name] = wm;
  }
  for (const path of paths) {
    const match = /^capabilities\/([^/]+)\.yaml$/.exec(path);
    if (match) fed.capabilities[match[1]] = loadYaml<Capabilities>(files[path]) ?? {};
  }
  if (files["derivations.yaml"] !== undefined) {
    fed.derivations = (loadYaml<Dict[]>(files["derivations.yaml"]) ?? []).map(ruleFromDict);
  }
  return fed;
}

export function modelPath(model: Model): string {
  const name = model.level === "O1" ? `${model.name}.v${model.version}` : model.name;
  return `${model.level.toLowerCase()}/${name}.mlm.yaml`;
}

export function federationToFiles(fed: Federation): FileMap {
  const files: FileMap = {};
  for (const model of Object.values(fed.models)) {
    files[modelPath(model)] = dumpYaml(modelToDict(model));
  }
  for (const wm of Object.values(fed.weaving)) {
    files[`weaving/${wm.name}.wm.yaml`] = dumpYaml(wmodelToDict(wm));
  }
  for (const [name, capabilities] of Object.entries(fed.capabilities)) {
    files[`capabilities/${name}.yaml`] = dumpYaml(capabilities);
  }
  if (fed.derivations.length) {
    files["derivations.yaml"] = dumpYaml(fed.derivations.map(ruleToDict));
  }
  return files;
}

/** `fed` with the model files of `files` added or replaced. */
export function overlay(fed: Federation, files: FileMap): Federation {
  return federationFromFiles({ ...federationToFiles(fed), ...files });
}

// -- navigation --------------------------------------------------------------

export interface Resolved {
  ref: ElementRef;
  model: Model;
  eclass: EClass | null;
  obj: EObject | null;
  attribute: EAttribute | null;
}

export function instances(fed: Federation): Model[] {
  return Object.values(fed.models).filter((m) => m.level === "O0");
}

export function typeOf(fed: Federation, instance: Model | null | undefined): Model | null {
  return fed.models[instance?.typedBy ?? ""] ?? null;
}

export function versions(fed: Federation, pkg: string): number[] {
  return Object.values(fed.models)
    .filter((m) => m.level === "O1" && m.name === pkg && m.version !== null)
    .map((m) => m.version as number)
    .sort((a, b) => a - b);
}

/**
 * What a shared concept can say of its instances: the roles the engine knows.
 * A concept with none of them is an entity, what the others are about.
 */
export const CONCEPT_ROLES: Record<string, string> = {
  requiresSource: "instances need a value source: runtime data or another DT",
  dependent: "instances are evaluated from other elements",
  device: "instances are physical devices, reached through a connector",
  sensor: "instances are sensors on a device: what they sense provides data",
  actuator: "instances are parts of a device that only act",
  reaction: "instances invoke an operation when a condition on what they observe becomes true",
};

/** Properties of an O1 class, inherited from the O2 concept it instantiates. */
export function classProps(fed: Federation, o1: Model | null, className: string): Dict {
  const eclass = o1?.eClasses[className];
  if (!o1 || !eclass) return {};
  const meta = fed.models[o1.typedBy ?? ""];
  const inherited = meta?.eClasses[eclass.instanceOf ?? ""]?.properties ?? {};
  return { ...inherited, ...eclass.properties };
}

export function interimOf(fed: Federation, instance: Model, obj: EObject): string {
  return classProps(fed, typeOf(fed, instance), obj.instanceOf).onDrift ?? DEFAULT_INTERIM;
}

export function levelOf(fed: Federation, ref: ElementRef): string | null {
  if (ref.data) return DATA_LEVEL;
  return fed.models[ref.model]?.level ?? null;
}

/** The DT a model belongs to: an O0 model names it, an O1 type is labelled
 * after the instances it types. */
export function dtLabel(fed: Federation, key: string): string {
  const model = fed.models[key];
  if (!model) return key;
  if (model.level === "O0") return model.dt || model.name;
  const labels = [
    ...new Set(
      instances(fed)
        .filter((i) => typeOf(fed, i)?.name === model.name)
        .map((i) => i.dt || i.name),
    ),
  ].sort();
  return labels.length === 1 ? labels[0] : model.name;
}

/** Resolve a reference to a model element; `null` when it dangles. */
export function resolve(fed: Federation, reference: string | ElementRef): Resolved | null {
  const ref = typeof reference === "string" ? parseRef(reference) : reference;
  const model = fed.models[ref.model];
  if (!model || ref.data || ref.path.length > 2) return null;
  const resolved: Resolved = { ref, model, eclass: null, obj: null, attribute: null };
  if (!ref.path.length) return resolved;
  if (model.level === "O0") {
    const obj = model.objects[ref.path[0]];
    const o1 = typeOf(fed, model);
    if (!obj || !o1) return null;
    resolved.obj = obj;
    resolved.eclass = o1.eClasses[obj.instanceOf] ?? null;
  } else {
    resolved.eclass = model.eClasses[ref.path[0]] ?? null;
  }
  if (resolved.eclass === null) return null;
  if (ref.path.length === 2) {
    resolved.attribute = resolved.eclass.eAttributes[ref.path[1]] ?? null;
    if (resolved.attribute === null) return null;
  }
  return resolved;
}

/** Objects of the same O0 model that use `objName` (dependency links are
 * derived from the reference slots, not stored). */
export function dependents(fed: Federation, instance: Model, objName: string): [EObject, string][] {
  const o1 = typeOf(fed, instance);
  const found: [EObject, string][] = [];
  for (const obj of Object.values(instance.objects)) {
    const eclass = o1?.eClasses[obj.instanceOf];
    if (!eclass) continue;
    for (const reference of Object.keys(eclass.eReferences)) {
      if (targets(obj, reference).includes(objName)) found.push([obj, reference]);
    }
  }
  return found;
}

// -- weaving -----------------------------------------------------------------

export function links(fed: Federation, type: string): WLink[] {
  return Object.values(fed.weaving).flatMap((wm) => wm.links.filter((l) => l.type === type));
}

export function findLink(fed: Federation, id: string): WLink | null {
  for (const wm of Object.values(fed.weaving)) {
    const link = wm.links.find((l) => l.id === id);
    if (link) return link;
  }
  return null;
}

/** Follow Evolution links from a type element to its latest successor. */
export function successor(fed: Federation, element: string): string | null {
  let current = element;
  const seen = new Set<string>();
  while (!seen.has(current)) {
    seen.add(current);
    const following = links(fed, EVOLUTION)
      .filter((l) => l.ends.from === current)
      .map((l) => l.ends.to);
    if (!following.length) break;
    current = following[0];
  }
  return current !== element ? current : null;
}
