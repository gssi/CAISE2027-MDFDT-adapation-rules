/**
 * A repository holds one model per DT, each with its own versions. The engine
 * works on a `Federation`: this module composes it from the models and takes it
 * apart again, model by model.
 *
 * A DT model owns its O1 type (`room1@2`), its O0 instance (`room1`), the
 * capabilities its DT reports and, when it is an initiating DT, the weaving
 * model that relates it to other DTs. The shared O2 concepts are a model too.
 */
import { checkConformance, type Issue } from "./conformance";
import {
  CORRESPONDENCE,
  EVOLUTION,
  cloneFederation,
  emptyFederation,
  type Capabilities,
  type Federation,
  type FileMap,
} from "./federation";
import { classToDict, modelFromDict, modelKey, modelToDict, type Dict, type Model } from "./kernel/model";
import { parseRef, ref } from "./kernel/refs";
import { dumpYaml, loadYaml } from "./kernel/yaml";
import { ruleFromDict, ruleToDict } from "./mapping";
import { checkReactions } from "./runtime/reactions";
import { checkCorrespondences, HOLDS, PENDING, validateWModel } from "./weaving/checks";
import { wlink, wmodel, wmodelFromDict, wmodelToDict } from "./weaving/model";

export const FILES = {
  concepts: "concepts.mlm.yaml",
  derivations: "derivations.yaml",
  type: "type.mlm.yaml",
  instance: "instance.mlm.yaml",
  capabilities: "capabilities.yaml",
  weaving: "weaving.wm.yaml",
  evolution: "evolution.wm.yaml",
};

/** One version of one model: its files, and what the other models were at when it was committed. */
export interface ModelVersion {
  model: string;
  version: number;
  files: FileMap;
  context?: Record<string, number>;
}

export const weavingName = (model: string) => `${model}-weaving`;
export const evolutionName = (model: string) => `${model}-evolution`;

/** The model an element, a model key or a weaving model belongs to. */
export function modelOf(key: string): string {
  return parseRef(key).model.split("@")[0];
}

function load(fed: Federation, version: ModelVersion, typeOnly: boolean): void {
  for (const [file, text] of Object.entries(version.files)) {
    if (file.endsWith(".mlm.yaml")) {
      const model = modelFromDict(loadYaml<Dict>(text));
      if (typeOnly && (model.level !== "O1" || modelKey(model) in fed.models)) continue;
      fed.models[modelKey(model)] = model;
    } else if (typeOnly) {
      continue;
    } else if (file.endsWith(".wm.yaml")) {
      const wm = wmodelFromDict(loadYaml<Dict>(text));
      fed.weaving[wm.name] = wm;
    } else if (file === FILES.capabilities) {
      fed.capabilities[version.model] = loadYaml<Capabilities>(text) ?? {};
    } else if (file === FILES.derivations) {
      fed.derivations = (loadYaml<Dict[]>(text) ?? []).map(ruleFromDict);
    }
  }
}

/**
 * The modeling layer as the engine sees it: the given version of every model,
 * plus the types of earlier versions (`history`), which evolution links refer to.
 */
export function assemble(current: ModelVersion[], history: ModelVersion[] = []): Federation {
  const fed = emptyFederation();
  for (const version of current) load(fed, version, false);
  for (const version of history) load(fed, version, true);
  return fed;
}

/** The models of a federation: the shared concepts and one per DT. */
export function modelIds(fed: Federation): string[] {
  return Object.values(fed.models)
    .filter((m) => m.level !== "O1")
    .map((m) => m.name);
}

export function instanceOfModel(fed: Federation, model: string): Model | null {
  const found = fed.models[model];
  return found && found.level === "O0" ? found : null;
}

/** The version a model is at: the version of the type its instance conforms to. */
export function versionOf(fed: Federation, model: string): number | null {
  const type = fed.models[instanceOfModel(fed, model)?.typedBy ?? ""];
  return type?.version ?? null;
}

/** The files of one model, as they are stored in a version of it. */
export function extract(fed: Federation, model: string): FileMap {
  const files: FileMap = {};
  const found = fed.models[model];
  if (!found) return files;
  if (found.level === "O2") {
    files[FILES.concepts] = dumpYaml(modelToDict(found));
    if (fed.derivations.length) files[FILES.derivations] = dumpYaml(fed.derivations.map(ruleToDict));
    return files;
  }
  const type = fed.models[found.typedBy ?? ""];
  if (type) files[FILES.type] = dumpYaml(modelToDict(type));
  files[FILES.instance] = dumpYaml(modelToDict(found));
  files[FILES.capabilities] = dumpYaml(fed.capabilities[model] ?? {});
  const weaving = fed.weaving[weavingName(model)];
  if (weaving?.links.length) files[FILES.weaving] = dumpYaml(wmodelToDict(weaving));
  const evolution = fed.weaving[evolutionName(model)];
  if (evolution?.links.length) files[FILES.evolution] = dumpYaml(wmodelToDict(evolution));
  return files;
}

/** The models whose content differs between two federations. */
export function changedModels(before: Federation, after: Federation): string[] {
  const ids = [...new Set([...modelIds(before), ...modelIds(after)])];
  return ids.filter((id) => JSON.stringify(extract(before, id)) !== JSON.stringify(extract(after, id)));
}

/** `base` with everything `model` owns taken from `source`. */
export function transplant(base: Federation, source: Federation, model: string): Federation {
  const fed = cloneFederation(base);
  const from = cloneFederation(source);
  if (from.models[model]?.level === "O2" || fed.models[model]?.level === "O2") {
    if (from.models[model]) fed.models[model] = from.models[model];
    fed.derivations = from.derivations;
    return fed;
  }
  for (const key of Object.keys(fed.models)) if (modelOf(key) === model) delete fed.models[key];
  for (const [key, value] of Object.entries(from.models)) if (modelOf(key) === model) fed.models[key] = value;
  if (model in from.capabilities) fed.capabilities[model] = from.capabilities[model];
  else delete fed.capabilities[model];
  for (const name of [weavingName(model), evolutionName(model)]) {
    if (from.weaving[name]) fed.weaving[name] = from.weaving[name];
    else delete fed.weaving[name];
  }
  return fed;
}

/** Trace the evolution of a type: every class to the class of the same name,
 * and the replacements the modelling assistant proposed. */
export function linkVersions(
  fed: Federation,
  before: Model,
  after: Model,
  replaces: [string, string][] = [],
): void {
  const wm = (fed.weaving[evolutionName(before.name)] ??= wmodel(evolutionName(before.name)));
  for (const key of [modelKey(before), modelKey(after)]) if (!wm.woven.includes(key)) wm.woven.push(key);
  const stem = `ev-${before.name}-${before.version}-${after.version}`;
  const add = (id: string, from: string, to: string) => {
    if (!wm.links.some((link) => link.id === id)) wm.links.push(wlink(id, EVOLUTION, { from, to }));
  };
  add(stem, modelKey(before), modelKey(after));
  for (const [old, now] of replaces) add(`${stem}-${old}`, ref(modelKey(before), old), ref(modelKey(after), now));
  for (const name of Object.keys(before.eClasses)) {
    if (name in after.eClasses) add(`${stem}-${name}`, ref(modelKey(before), name), ref(modelKey(after), name));
  }
}

/**
 * The classes of `before` that are in `after` under another name: a class that
 * is gone while exactly one new class has the same definition. A rename leaves
 * no other mark in a model, and its trace is what lets other DTs follow it.
 */
export function renamedClasses(before: Model, after: Model): [string, string][] {
  const gone = Object.keys(before.eClasses).filter((name) => !(name in after.eClasses));
  const fresh = Object.keys(after.eClasses).filter((name) => !(name in before.eClasses));
  const shape = (model: Model, name: string, moved: string[]) => {
    const data = classToDict(model.eClasses[name]);
    for (const reference of Object.values((data.eReferences ?? {}) as Record<string, Dict | string>)) {
      if (typeof reference !== "string" && moved.includes(reference.eType)) reference.eType = "?";
    }
    return JSON.stringify(data);
  };
  const pairs: [string, string][] = [];
  for (const old of gone) {
    const same = (name: string) => shape(after, name, fresh) === shape(before, old, gone);
    const matches = fresh.filter(same);
    const rivals = gone.filter((other) => shape(before, other, gone) === shape(before, old, gone));
    if (matches.length === 1 && rivals.length === 1) pairs.push([old, matches[0]]);
  }
  return pairs;
}

/**
 * `candidate` with `model` as its next version. A model is edited in place;
 * committing it gives its type the next version number, restores the committed
 * type as history and traces the evolution between the two.
 */
export function asNextVersion(candidate: Federation, head: Federation, model: string, next: number): Federation {
  const fed = cloneFederation(candidate);
  const instance = instanceOfModel(fed, model);
  const edited = fed.models[instance?.typedBy ?? ""];
  if (!instance || !edited || edited.version === next) return fed;
  const committed = head.models[modelKey(edited)];
  const type: Model = { ...edited, version: next };
  fed.models[modelKey(type)] = type;
  if (committed) fed.models[modelKey(committed)] = structuredClone(committed);
  else delete fed.models[modelKey(edited)];
  instance.typedBy = modelKey(type);
  if (committed) {
    // The trace of the earlier versions is not the modeler's to edit: it is taken as committed.
    const trace = evolutionName(model);
    if (head.weaving[trace]) fed.weaving[trace] = structuredClone(head.weaving[trace]);
    else delete fed.weaving[trace];
    linkVersions(fed, committed, type, renamedClasses(committed, type));
  }
  return fed;
}

/**
 * The gate a model must pass to be committed: its own conformance, the weaving
 * models it owns, and the correspondences it initiates, checked against the
 * current version of the models it weaves.
 */
export function gateFor(fed: Federation, model: string): Issue[] {
  const mine = (element: string) => modelOf(element) === model;
  const issues = checkConformance(fed).filter((issue) => mine(issue.element));
  for (const name of [weavingName(model), evolutionName(model)]) {
    if (fed.weaving[name]) issues.push(...validateWModel(fed, fed.weaving[name]));
  }
  issues.push(...checkReactions(fed, model));
  for (const status of checkCorrespondences(fed)) {
    if (!mine(status.initiating) || status.status === HOLDS || status.status === PENDING) continue;
    issues.push({
      check: `correspondence:${status.status}`,
      element: status.correspondence || status.initiating,
      message: status.reasons.join("; "),
    });
  }
  return issues;
}

/** The DT models a model weaves: the participants of its correspondences. */
export function wovenBy(fed: Federation, model: string): string[] {
  const out = new Set<string>();
  for (const link of fed.weaving[weavingName(model)]?.links ?? []) {
    if (link.type !== CORRESPONDENCE || !link.ends.participating) continue;
    out.add(modelOf(link.ends.participating));
  }
  return [...out];
}

/**
 * Apply an edit prepared as files to the working copy of `model`: its type and
 * instance are replaced (keeping the version being edited), the links of its
 * weaving model are added or replaced one by one.
 */
export function applyEdit(fed: Federation, model: string, files: FileMap): Federation {
  const out = cloneFederation(fed);
  const instance = instanceOfModel(out, model);
  const current = out.models[instance?.typedBy ?? ""];
  if (!instance || !current) return out;
  if (files[FILES.type]) {
    const type = modelFromDict(loadYaml<Dict>(files[FILES.type]));
    out.models[modelKey(current)] = { ...type, name: model, version: current.version };
  }
  if (files[FILES.instance]) {
    const edited = modelFromDict(loadYaml<Dict>(files[FILES.instance]));
    out.models[model] = { ...edited, name: model, typedBy: modelKey(current) };
  }
  if (files[FILES.weaving]) {
    const edited = wmodelFromDict(loadYaml<Dict>(files[FILES.weaving]));
    const wm = (out.weaving[weavingName(model)] ??= wmodel(weavingName(model)));
    for (const link of edited.links) {
      const index = wm.links.findIndex((known) => known.id === link.id);
      if (index === -1) wm.links.push(link);
      else wm.links[index] = link;
    }
    for (const name of edited.woven) if (!wm.woven.includes(name)) wm.woven.push(name);
  }
  return out;
}
