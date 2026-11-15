/**
 * Renaming a class, an attribute or an object of a model, with everything in that model that
 * names it. The models of other DTs are not touched: what they point at by
 * name is theirs to follow, and reaches them as drift.
 */
import { typeOf, type Federation } from "../federation";
import { modelKey, targets, type Model } from "../kernel/model";
import { formatRef, parseRef } from "../kernel/refs";
import { evolutionName, weavingName } from "../modelset";

const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

function renameKey<T>(record: Record<string, T>, from: string, to: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key === from ? to : key, value]));
}

/** Why `name` cannot be given, or null when it can. */
export function nameProblem(taken: Iterable<string>, name: string): string | null {
  if (!NAME.test(name)) return "a name is letters, digits and underscores, and does not start with a digit";
  if ([...taken].includes(name)) return `${name} is already used in this model`;
  return null;
}

/** Follow the element in the weaving models this model owns. */
function renameEnds(fed: Federation, model: string, owner: string, from: string, to: string): void {
  for (const name of [weavingName(model), evolutionName(model)]) {
    for (const link of fed.weaving[name]?.links ?? []) {
      for (const [end, value] of Object.entries(link.ends)) {
        const parsed = parseRef(value);
        if (parsed.data || parsed.model !== owner || parsed.path[0] !== from) continue;
        link.ends[end] = formatRef({ ...parsed, path: [to, ...parsed.path.slice(1)] });
      }
    }
  }
}

/** Rename a class of the type of `model`; null when done, else why not. */
export function renameClass(fed: Federation, model: string, from: string, to: string): string | null {
  const instance: Model | undefined = fed.models[model];
  const type = typeOf(fed, instance);
  if (!instance || !type || !(from in type.eClasses)) return `unknown class ${from}`;
  if (from === to) return null;
  const problem = nameProblem(Object.keys(type.eClasses), to);
  if (problem) return problem;

  type.eClasses = renameKey(type.eClasses, from, to);
  type.eClasses[to].name = to;
  for (const eclass of Object.values(type.eClasses)) {
    for (const reference of Object.values(eclass.eReferences)) if (reference.eType === from) reference.eType = to;
  }
  for (const obj of Object.values(instance.objects)) if (obj.instanceOf === from) obj.instanceOf = to;
  renameEnds(fed, model, modelKey(type), from, to);
  return null;
}

/**
 * Rename a shared concept; null when done, else why not. The types of the DTs
 * that instantiate it are not touched: they are models of their own, and their
 * modelers follow, each with a version of their model.
 */
export function renameConcept(fed: Federation, concepts: string, from: string, to: string): string | null {
  const model: Model | undefined = fed.models[concepts];
  if (!model || model.level !== "O2" || !(from in model.eClasses)) return `unknown concept ${from}`;
  if (from === to) return null;
  const problem = nameProblem(Object.keys(model.eClasses), to);
  if (problem) return problem;
  model.eClasses = renameKey(model.eClasses, from, to);
  model.eClasses[to].name = to;
  for (const concept of Object.values(model.eClasses)) {
    for (const relation of Object.values(concept.eReferences)) if (relation.eType === from) relation.eType = to;
  }
  return null;
}

/** Remove a shared concept, with the relations of the other concepts that lead to it. */
export function removeConcept(fed: Federation, concepts: string, name: string): void {
  const model: Model | undefined = fed.models[concepts];
  if (!model || model.level !== "O2") return;
  delete model.eClasses[name];
  for (const concept of Object.values(model.eClasses)) {
    for (const relation of Object.values(concept.eReferences)) {
      if (relation.eType === name) delete concept.eReferences[relation.name];
    }
  }
}

/** Rename an object of `model`; null when done, else why not. */
export function renameObject(fed: Federation, model: string, from: string, to: string): string | null {
  const instance: Model | undefined = fed.models[model];
  if (!instance || !(from in instance.objects)) return `unknown object ${from}`;
  if (from === to) return null;
  const problem = nameProblem(Object.keys(instance.objects), to);
  if (problem) return problem;

  const type = typeOf(fed, instance);
  instance.objects = renameKey(instance.objects, from, to);
  instance.objects[to].name = to;
  for (const obj of Object.values(instance.objects)) {
    for (const reference of Object.keys(type?.eClasses[obj.instanceOf]?.eReferences ?? {})) {
      if (!targets(obj, reference).includes(from)) continue;
      const value = obj.slots[reference];
      obj.slots[reference] = Array.isArray(value) ? value.map((name) => (name === from ? to : name)) : to;
    }
  }
  renameEnds(fed, model, instance.name, from, to);
  return null;
}

/** Rename an attribute of a class of the type of `model`, with the values its objects give it. */
export function renameAttribute(fed: Federation, model: string, owner: string, from: string, to: string): string | null {
  const instance: Model | undefined = fed.models[model];
  const type = typeOf(fed, instance);
  const eclass = type?.eClasses[owner];
  if (!instance || !type || !eclass || !(from in eclass.eAttributes)) return `unknown attribute ${owner}.${from}`;
  if (from === to) return null;
  const taken = [...Object.keys(eclass.eAttributes), ...Object.keys(eclass.eReferences)];
  const problem = nameProblem(taken, to);
  if (problem) return problem.replace("in this model", `in ${owner}`);

  eclass.eAttributes = renameKey(eclass.eAttributes, from, to);
  eclass.eAttributes[to].name = to;
  const holders = new Set([owner]);
  for (const obj of Object.values(instance.objects)) {
    if (obj.instanceOf !== owner) continue;
    holders.add(obj.name);
    obj.slots = renameKey(obj.slots, from, to);
    obj.bindings = renameKey(obj.bindings, from, to);
  }
  for (const name of [weavingName(model), evolutionName(model)]) {
    for (const link of fed.weaving[name]?.links ?? []) {
      for (const [end, value] of Object.entries(link.ends)) {
        const parsed = parseRef(value);
        const mine = parsed.model === instance.name || parsed.model === modelKey(type);
        if (parsed.data || !mine || !holders.has(parsed.path[0]) || parsed.path[1] !== from) continue;
        link.ends[end] = formatRef({ ...parsed, path: [parsed.path[0], to, ...parsed.path.slice(2)] });
      }
    }
  }
  return null;
}
