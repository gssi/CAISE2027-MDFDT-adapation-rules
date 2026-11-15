/**
 * Multi-level modelling kernel.
 *
 * The notation borrows the Ecore vocabulary (EPackage, EClass, EAttribute,
 * EReference) and extends it to three levels with cascading typing:
 *
 *  - O2: generic concepts;
 *  - O1: versioned DT types, every class is `instanceOf` an O2 concept;
 *  - O0: instances of the federation, every object is `instanceOf` an O1 class.
 *
 * Runtime data sits below O0 and is not part of a model. Everything is plain
 * data, so a model can be cloned, compared and sent to the browser as is.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dict = Record<string, any>;

export type Level = "O2" | "O1" | "O0";
export const LEVELS: Level[] = ["O2", "O1", "O0"];
export const DATA_LEVEL = "data";

export const PRIMITIVES = ["EBoolean", "EInt", "EDouble", "EString"];
export const NUMERIC = ["EInt", "EDouble"];

export const INTERIM_BEHAVIOURS = ["suspend", "exclude_input", "keep_last_valid"];
export const DEFAULT_INTERIM = "suspend";

/** Strict typing: a Boolean is never accepted where a number is expected. */
export function valueConforms(value: unknown, etype: string): boolean {
  if (etype === "EBoolean") return typeof value === "boolean";
  if (etype === "EInt") return typeof value === "number" && Number.isInteger(value);
  if (etype === "EDouble") return typeof value === "number" && Number.isFinite(value);
  if (etype === "EString") return typeof value === "string";
  return false;
}

export function etypeOf(value: unknown): string | null {
  if (typeof value === "boolean") return "EBoolean";
  if (typeof value === "number") return Number.isInteger(value) ? "EInt" : "EDouble";
  if (typeof value === "string") return "EString";
  return null;
}

/** How a value reads in a message: quoted strings, `None` for nothing. */
export function repr(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "string") return `'${value}'`;
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

export function str(value: unknown): string {
  return typeof value === "string" ? value : repr(value);
}

export interface EAttribute {
  name: string;
  eType: string;
  unit: string | null;
  meaning: string | null;
  upperBound: number;
}

export interface EReference {
  name: string;
  eType: string;
  lowerBound: number;
  upperBound: number;
  containment: boolean;
}

/** Something an instance of a class can be asked to do, with typed parameters. */
export interface EOperation {
  name: string;
  eParameters: Record<string, EAttribute>;
  description: string | null;
}

/** A class at O2 or O1. `properties` holds the remaining annotations
 * (`requiresSource`, `dependent`, `onDrift`, `direction` ...). */
export interface EClass {
  name: string;
  instanceOf: string | null;
  eAttributes: Record<string, EAttribute>;
  eReferences: Record<string, EReference>;
  /** Absent when the class has none, so that most classes stay as they were. */
  eOperations?: Record<string, EOperation>;
  properties: Dict;
}

/** An O0 object. `bindings` map attributes to runtime observation keys,
 * `slots` hold attribute values and reference targets (object names). */
export interface EObject {
  name: string;
  instanceOf: string;
  bindings: Record<string, string>;
  slots: Dict;
}

/** One model of the multi-level hierarchy. O2 and O1 models are packages of
 * classes; O1 packages are versioned. O0 models hold the objects of one DT.
 * `typedBy` names the model of the level above (`core`, `room@1`). */
export interface Model {
  level: Level;
  name: string;
  version: number | null;
  typedBy: string | null;
  dt: string | null;
  eClasses: Record<string, EClass>;
  objects: Record<string, EObject>;
}

export function modelKey(model: Pick<Model, "level" | "name" | "version">): string {
  return model.level === "O1" ? `${model.name}@${model.version}` : model.name;
}

export function attributeFromDict(name: string, data: Dict | string): EAttribute {
  const d: Dict = typeof data === "string" ? { eType: data } : data;
  return {
    name,
    eType: d.eType,
    unit: d.unit ?? null,
    meaning: d.meaning ?? null,
    upperBound: d.upperBound ?? 1,
  };
}

export function attributeToDict(attribute: EAttribute): Dict {
  const out: Dict = { eType: attribute.eType };
  if (attribute.unit !== null) out.unit = attribute.unit;
  if (attribute.meaning !== null) out.meaning = attribute.meaning;
  if (attribute.upperBound !== 1) out.upperBound = attribute.upperBound;
  return out;
}

export function referenceFromDict(name: string, data: Dict | string): EReference {
  const d: Dict = typeof data === "string" ? { eType: data } : data;
  return {
    name,
    eType: d.eType,
    lowerBound: d.lowerBound ?? 0,
    upperBound: d.upperBound ?? 1,
    containment: d.containment ?? false,
  };
}

export function referenceToDict(reference: EReference): Dict {
  const out: Dict = { eType: reference.eType };
  if (reference.lowerBound !== 0) out.lowerBound = reference.lowerBound;
  if (reference.upperBound !== 1) out.upperBound = reference.upperBound;
  if (reference.containment) out.containment = true;
  return out;
}

export function operationFromDict(name: string, data: Dict | null): EOperation {
  const d: Dict = data ?? {};
  return {
    name,
    eParameters: mapEntries((d.eParameters ?? {}) as Dict, attributeFromDict),
    description: d.description ?? null,
  };
}

export function operationToDict(operation: EOperation): Dict {
  const out: Dict = {};
  if (operation.description !== null) out.description = operation.description;
  if (Object.keys(operation.eParameters).length) {
    out.eParameters = mapEntries(operation.eParameters, (_, a) => attributeToDict(a));
  }
  return out;
}

/** `name(parameter, ...)`, as an operation reads in a diagram or a message. */
export function signature(operation: EOperation): string {
  return `${operation.name}(${Object.keys(operation.eParameters).join(", ")})`;
}

function mapEntries<A, B>(input: Record<string, A>, f: (key: string, value: A) => B) {
  const out: Record<string, B> = {};
  for (const [key, value] of Object.entries(input)) out[key] = f(key, value);
  return out;
}

export function classFromDict(name: string, data: Dict | null | undefined): EClass {
  const rest: Dict = { ...(data ?? {}) };
  const attributes: Dict = rest.eAttributes ?? {};
  const references: Dict = rest.eReferences ?? {};
  const instanceOf: string | null = rest.instanceOf ?? null;
  const operations: Dict | undefined = rest.eOperations;
  delete rest.eAttributes;
  delete rest.eReferences;
  delete rest.eOperations;
  delete rest.instanceOf;
  const eclass: EClass = {
    name,
    instanceOf,
    eAttributes: mapEntries(attributes, attributeFromDict),
    eReferences: mapEntries(references, referenceFromDict),
    properties: rest,
  };
  if (operations && Object.keys(operations).length) eclass.eOperations = mapEntries(operations, operationFromDict);
  return eclass;
}

export function classToDict(eclass: EClass): Dict {
  const out: Dict = {};
  if (eclass.instanceOf) out.instanceOf = eclass.instanceOf;
  Object.assign(out, eclass.properties);
  if (Object.keys(eclass.eAttributes).length) {
    out.eAttributes = mapEntries(eclass.eAttributes, (_, a) => attributeToDict(a));
  }
  if (Object.keys(eclass.eReferences).length) {
    out.eReferences = mapEntries(eclass.eReferences, (_, r) => referenceToDict(r));
  }
  if (eclass.eOperations && Object.keys(eclass.eOperations).length) {
    out.eOperations = mapEntries(eclass.eOperations, (_, o) => operationToDict(o));
  }
  return out;
}

export function objectFromDict(name: string, data: Dict): EObject {
  const rest: Dict = { ...data };
  const instanceOf: string = rest.instanceOf;
  const bindings: Record<string, string> = { ...(rest.bindings ?? {}) };
  delete rest.instanceOf;
  delete rest.bindings;
  return { name, instanceOf, bindings, slots: rest };
}

export function objectToDict(obj: EObject): Dict {
  const out: Dict = { instanceOf: obj.instanceOf };
  if (Object.keys(obj.bindings).length) out.bindings = { ...obj.bindings };
  Object.assign(out, obj.slots);
  return out;
}

/** The objects a reference slot points to. */
export function targets(obj: EObject, reference: string): string[] {
  const value = obj.slots[reference];
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? [...value] : [value];
}

export function modelFromDict(data: Dict): Model {
  const level: Level = data.level;
  if (!LEVELS.includes(level)) throw new Error(`unknown level ${repr(level)}`);
  if (level === "O0") {
    return {
      level,
      name: data.name,
      version: null,
      typedBy: data.typedBy ?? null,
      dt: data.dt ?? null,
      eClasses: {},
      objects: mapEntries((data.objects ?? {}) as Dict, objectFromDict),
    };
  }
  return {
    level,
    name: data.ePackage,
    version: data.version ?? null,
    typedBy: data.typedBy ?? null,
    dt: null,
    eClasses: mapEntries((data.eClasses ?? {}) as Dict, classFromDict),
    objects: {},
  };
}

export function modelToDict(model: Model): Dict {
  const out: Dict = { level: model.level };
  if (model.level === "O0") {
    out.name = model.name;
    if (model.dt) out.dt = model.dt;
    if (model.typedBy) out.typedBy = model.typedBy;
    out.objects = mapEntries(model.objects, (_, o) => objectToDict(o));
    return out;
  }
  out.ePackage = model.name;
  if (model.version !== null) out.version = model.version;
  if (model.typedBy) out.typedBy = model.typedBy;
  out.eClasses = mapEntries(model.eClasses, (_, c) => classToDict(c));
  return out;
}
