/**
 * Model edits of the modeler, as functions that change a working copy of the
 * modeling layer in place. The caller clones first; nothing here commits.
 * Describing devices and what they sense is in `@/engine/modeling/parts`.
 */
import { CORRESPONDENCE, REPRESENTATION, findLink, links, resolve, type Federation } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { pascal, plainAttribute, uniqueName } from "@/engine/modeling/parts";
import { parseRef, ref } from "@/engine/kernel/refs";
import { weavingName } from "@/engine/modelset";
import { wlink, wmodel } from "@/engine/weaving/model";


/** What a participating element provides, as the expectations of a correspondence. */
export function expectationOf(fed: Federation, element: string): Dict {
  const resolved = resolve(fed, element);
  if (!resolved?.attribute) return {};
  const expects: Dict = { typeVersion: resolved.model.typedBy, eType: resolved.attribute.eType };
  if (resolved.attribute.unit !== null) expects.unit = resolved.attribute.unit;
  if (resolved.attribute.meaning !== null) expects.meaning = resolved.attribute.meaning;
  return expects;
}

/** A new correspondence for an initiating element; the participating end can
 * be an element, or only a DT when the modeler cannot name the element yet. */
export function addCorrespondence(fed: Federation, initiating: string, participating: string): string {
  const owner = parseRef(initiating);
  const wm = (fed.weaving[weavingName(owner.model)] ??= wmodel(weavingName(owner.model)));
  const taken = Object.values(fed.weaving).flatMap((w) => w.links.map((l) => l.id));
  const id = uniqueName(taken, `c-${[parseRef(participating).model, ...owner.path].join("-")}`);
  const link = wlink(id, CORRESPONDENCE, { initiating, participating });
  const expects = expectationOf(fed, participating);
  if (Object.keys(expects).length) link.props.expects = expects;
  wm.links.push(link);
  for (const model of [owner.model, parseRef(participating).model]) {
    if (!wm.woven.includes(model)) wm.woven.push(model);
  }
  return id;
}

/** The DT stated as the twin of an object of a model, if any. */
export function representationOf(fed: Federation, entity: string): string | null {
  return links(fed, REPRESENTATION).find((link) => link.ends.entity === entity)?.ends.dt ?? null;
}

/** State which DT is the twin of an object (`dt` null: none), in the weaving of the model of the object. */
export function setRepresentation(fed: Federation, entity: string, dt: string | null): void {
  const owner = parseRef(entity).model;
  for (const wm of Object.values(fed.weaving)) {
    wm.links = wm.links.filter((link) => link.type !== REPRESENTATION || link.ends.entity !== entity);
  }
  if (!dt) return;
  const wm = (fed.weaving[weavingName(owner)] ??= wmodel(weavingName(owner)));
  const taken = Object.values(fed.weaving).flatMap((w) => w.links.map((l) => l.id));
  wm.links.push(wlink(uniqueName(taken, `r-${dt}`), REPRESENTATION, { entity, dt }));
  for (const model of [owner, dt]) if (!wm.woven.includes(model)) wm.woven.push(model);
}

export function removeLink(fed: Federation, id: string): void {
  for (const wm of Object.values(fed.weaving)) wm.links = wm.links.filter((link) => link.id !== id);
}

/** Point a correspondence at another participating element and refresh what it expects. */
export function retargetCorrespondence(fed: Federation, id: string, participating: string): void {
  const link = findLink(fed, id);
  if (!link) return;
  link.ends.participating = participating;
  const kept: Dict = { ...(link.props.expects ?? {}) };
  for (const stale of ["typeVersion", "eType", "unit", "meaning"]) delete kept[stale];
  const expects = { ...expectationOf(fed, participating), ...kept };
  if (Object.keys(expects).length) link.props.expects = expects;
  else delete link.props.expects;
}

/** Every attribute of every O0 object, as candidate ends of a correspondence. */
export function attributeElements(fed: Federation, except?: string): string[] {
  const out: string[] = [];
  for (const model of Object.values(fed.models)) {
    if (model.level !== "O0" || model.name === except) continue;
    const type = fed.models[model.typedBy ?? ""];
    for (const obj of Object.values(model.objects)) {
      for (const attribute of Object.keys(type?.eClasses[obj.instanceOf]?.eAttributes ?? {})) {
        out.push(ref(model.name, obj.name, attribute));
      }
    }
  }
  return out;
}

// -- reactions and the concepts they need ------------------------------------

const CONCEPTS: Record<string, { name: string; properties: Dict }> = {
  actuator: { name: "Actuator", properties: { actuator: true } },
  reaction: { name: "Reaction", properties: { dependent: true, reaction: true } },
};

/** Whether the shared concepts know a kind of element (`actuator`, `reaction`, ...). */
export function hasConcept(fed: Federation, flag: string): boolean {
  return Object.values(fed.models).some(
    (m) => m.level === "O2" && Object.values(m.eClasses).some((c) => c.properties[flag]),
  );
}

/** Add a concept the shared model lacks, in its working copy; returns the O2 model it was added to. */
export function ensureConcept(fed: Federation, flag: string): string | null {
  const meta = Object.values(fed.models).find((m) => m.level === "O2");
  const concept = CONCEPTS[flag];
  if (!meta || !concept) return null;
  if (!hasConcept(fed, flag)) {
    const name = uniqueName(Object.keys(meta.eClasses), concept.name);
    meta.eClasses[name] = { name, instanceOf: null, eAttributes: {}, eReferences: {}, properties: { ...concept.properties } };
  }
  return meta.name;
}

export interface ReactionDraft {
  /** What is observed, as `object.attribute`. */
  input: string;
  when: string;
  /** The part of a device that acts, and what it is asked to do. */
  target: string;
  operation: string;
  args: Dict;
}

/**
 * Describe a reaction: when the condition on what is observed becomes true,
 * the operation is invoked on the target. A class for this reaction, with one
 * attribute per argument, and its object.
 */
export function addReaction(fed: Federation, model: string, draft: ReactionDraft): string | null {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  const meta = fed.models[type?.typedBy ?? ""];
  const concept = Object.values(meta?.eClasses ?? {}).find((c) => c.properties.reaction)?.name;
  const [inputName, attribute] = draft.input.split(".");
  const input = instance?.objects[inputName];
  const target = instance?.objects[draft.target];
  const operation = type?.eClasses[target?.instanceOf ?? ""]?.eOperations?.[draft.operation];
  if (!instance || !type || !concept || !input || !target || !operation) return null;
  const className = uniqueName(Object.keys(type.eClasses), pascal(`${attribute}_${draft.operation}`));
  type.eClasses[className] = {
    name: className,
    instanceOf: concept,
    eAttributes: {
      when: plainAttribute("when", "EString"),
      operation: plainAttribute("operation", "EString"),
      ...Object.fromEntries(Object.values(operation.eParameters).map((p) => [p.name, { ...p }])),
    },
    eReferences: {
      input: { name: "input", eType: input.instanceOf, lowerBound: 1, upperBound: 1, containment: false },
      target: { name: "target", eType: target.instanceOf, lowerBound: 1, upperBound: 1, containment: false },
    },
    properties: {},
  };
  const name = uniqueName(Object.keys(instance.objects), `${attribute}_${draft.operation}`);
  instance.objects[name] = {
    name,
    instanceOf: className,
    bindings: {},
    slots: { input: inputName, target: draft.target, when: draft.when, operation: draft.operation, ...draft.args },
  };
  return name;
}

export {
  addDevice,
  addSensor,
  linkParameter,
  linkTargets,
  observeParameter,
  uniqueName,
  usersOf,
} from "@/engine/modeling/parts";
