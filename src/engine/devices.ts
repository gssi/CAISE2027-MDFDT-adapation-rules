/**
 * Physical devices, as a DT model describes them.
 *
 * Two O2 concepts carry the description, whatever the domain and the kind of
 * hardware: a class that is `instanceOf` a concept marked `device` stands for
 * a device reached through a connector (its attributes are the settings of
 * the connection); a class of a concept marked `sensor` stands for a sensor on
 * a device. The attributes of a sensor that are bound are the parameters it
 * senses, each bound to the observation key it provides; the others are its
 * settings (which kind of sensor, which one). A part that only acts is of a
 * concept marked `actuator`. What a part can be asked to do are the operations
 * of its class, so the actions of the hardware are part of the model.
 *
 * This module only reads the model. Talking to hardware is the job of a
 * connector (`src/connectors`), chosen by the `connector` setting of a device.
 */
import { type ObservationBatch } from "./assistant/change";
import { classProps, typeOf, type Capabilities, type Federation } from "./federation";
import { targets, valueConforms, type Dict, type EObject, type Model } from "./kernel/model";

export interface SettingKind {
  name: string;
  eType: string;
  fallback?: string | number | boolean;
}

/** A kind of device: how it is reached. */
export interface DeviceKind {
  type: string;
  settings: SettingKind[];
}

/** A kind of part of a device: what it senses and what it can be asked to do. */
export interface PartKind {
  kind: string;
  settings: SettingKind[];
  parameters: { name: string; eType: string; unit?: string; meaning?: string; observation?: string }[];
  operations?: {
    name: string;
    description: string;
    parameters: { name: string; eType: string; unit?: string }[];
  }[];
}

/** A part attached to a device that the model does not describe. */
export interface AttachedPart {
  device: string; // the device object it is attached to
  uid: string;
  kind: PartKind;
}

export interface ParameterSpec {
  name: string; // the attribute of the sensor class, and the parameter of the sensor kind
  key: string; // the observation key it provides
  eType: string;
  unit: string | null;
  meaning: string | null;
}

export interface OperationSpec {
  name: string;
  parameters: { name: string; eType: string; unit: string | null }[];
}

/** A part of a device: it senses parameters, can be asked to act, or both. */
export interface SensorSpec {
  id: string; // the O0 object
  kind: string;
  uid: string;
  settings: Dict;
  parameters: ParameterSpec[];
  /** What the part can be asked to do: the operations of its class. */
  operations: OperationSpec[];
}

export interface DeviceSpec {
  model: string;
  id: string; // the O0 object
  connector: string;
  settings: Dict;
  sensors: SensorSpec[];
}

/** What a connector read for one parameter of one sensor: a value, or why not. */
export interface Reading {
  sensor: string;
  parameter: string;
  key: string;
  value?: unknown;
  error?: string;
}

/** A sensor a connector found on a device, whether the model knows it or not. */
export interface Discovered {
  kind: string | null; // a kind of the catalogue, when it is one
  uid: string;
  label: string;
}

function flagged(fed: Federation, type: Model | null, obj: EObject, flag: "device" | "sensor" | "actuator"): boolean {
  return Boolean(classProps(fed, type, obj.instanceOf)[flag]);
}

function settingsOf(type: Model, obj: EObject, skip: string[]): Dict {
  const eclass = type.eClasses[obj.instanceOf];
  const out: Dict = {};
  for (const name of Object.keys(eclass?.eAttributes ?? {})) {
    if (!skip.includes(name) && !(name in obj.bindings) && name in obj.slots) out[name] = obj.slots[name];
  }
  return out;
}

function sensorOf(type: Model, obj: EObject): SensorSpec {
  const eclass = type.eClasses[obj.instanceOf];
  return {
    id: obj.name,
    kind: String(obj.slots.kind ?? ""),
    uid: String(obj.slots.uid ?? ""),
    settings: settingsOf(type, obj, ["kind", "uid"]),
    parameters: Object.entries(obj.bindings)
      .filter(([name]) => name in (eclass?.eAttributes ?? {}))
      .map(([name, key]) => {
        const attribute = eclass.eAttributes[name];
        return { name, key, eType: attribute.eType, unit: attribute.unit, meaning: attribute.meaning };
      }),
    operations: Object.values(eclass?.eOperations ?? {}).map((operation) => ({
      name: operation.name,
      parameters: Object.values(operation.eParameters).map((p) => ({ name: p.name, eType: p.eType, unit: p.unit })),
    })),
  };
}

/** The devices a DT model describes, each with the sensors that refer to it. */
export function devicesOf(fed: Federation, model: string): DeviceSpec[] {
  const instance = fed.models[model];
  const type = instance?.level === "O0" ? typeOf(fed, instance) : null;
  if (!instance || !type) return [];
  const objects = Object.values(instance.objects);
  return objects
    .filter((obj) => flagged(fed, type, obj, "device"))
    .map((device) => ({
      model,
      id: device.name,
      connector: String(device.slots.connector ?? ""),
      settings: settingsOf(type, device, ["connector"]),
      sensors: objects
        .filter((obj) => flagged(fed, type, obj, "sensor") || flagged(fed, type, obj, "actuator"))
        .filter((obj) =>
          Object.keys(type.eClasses[obj.instanceOf]?.eReferences ?? {}).some((r) => targets(obj, r).includes(device.name)),
        )
        .map((obj) => sensorOf(type, obj)),
    }));
}

/** Whether an object is a sensor: its bindings provide observation keys instead of using them. */
export function isSensor(fed: Federation, instance: Model, obj: EObject): boolean {
  return flagged(fed, typeOf(fed, instance), obj, "sensor");
}

/** The observation keys the sensors of a model provide, as capabilities. */
export function providedKeys(fed: Federation, model: string): Capabilities {
  const instance = fed.models[model];
  const type = instance?.level === "O0" ? typeOf(fed, instance) : null;
  const out: Capabilities = {};
  if (!instance || !type) return out;
  for (const obj of Object.values(instance.objects)) {
    if (!flagged(fed, type, obj, "sensor")) continue;
    for (const parameter of sensorOf(type, obj).parameters) {
      const capability: Dict = { eType: parameter.eType };
      if (parameter.unit !== null) capability.unit = parameter.unit;
      if (parameter.meaning !== null) capability.meaning = parameter.meaning;
      out[parameter.key] = capability;
    }
  }
  return out;
}

/** Every observation key a model can bind: what its DT reported, and what its sensors provide. */
export function availableKeys(fed: Federation, model: string): Capabilities {
  return { ...(fed.capabilities[model] ?? {}), ...providedKeys(fed, model) };
}

/**
 * What a DT reports after its devices were read, as the modeling layer takes
 * it: the values, and the capabilities as they are now. A parameter that could
 * not be read is not a capability any more, which is how a sensor that was
 * removed reaches the model as a change. A part that is attached but not in
 * the model is a capability that is new, reported with what the part is, which
 * is how a sensor that was added reaches it.
 */
export function toBatch(
  fed: Federation,
  model: string,
  readings: Reading[],
  timestamp: number,
  attached: AttachedPart[] = [],
): ObservationBatch {
  const capabilities = availableKeys(fed, model);
  for (const reading of readings) if (reading.error !== undefined) delete capabilities[reading.key];
  const modelled = new Set(devicesOf(fed, model).flatMap((device) => device.sensors.map((part) => part.uid)));
  for (const part of attached) {
    if (modelled.has(part.uid)) continue;
    for (const parameter of part.kind.parameters) {
      const key = parameter.name in capabilities ? `${part.kind.kind}_${part.uid}_${parameter.name}` : parameter.name;
      const capability: Dict = { eType: parameter.eType };
      if (parameter.unit) capability.unit = parameter.unit;
      if (parameter.meaning) capability.meaning = parameter.meaning;
      if (parameter.observation) capability.observation = parameter.observation;
      capabilities[key] = { ...capability, part: { ...part, parameter: parameter.name } };
    }
  }
  return {
    source: model,
    capabilities,
    observations: readings
      .filter((reading) => reading.error === undefined)
      .map((reading) => ({ key: reading.key, value: reading.value, timestamp })),
  };
}

/** Why the arguments of a call do not fit an operation; empty when they do. */
export function checkArguments(operation: OperationSpec, args: Dict): string[] {
  const problems: string[] = [];
  for (const parameter of operation.parameters) {
    if (!(parameter.name in args)) problems.push(`${parameter.name} is missing`);
    else if (!valueConforms(args[parameter.name], parameter.eType)) {
      problems.push(`${parameter.name} must be ${parameter.eType}`);
    }
  }
  for (const name of Object.keys(args)) {
    if (!operation.parameters.some((p) => p.name === name)) problems.push(`${operation.name} has no parameter ${name}`);
  }
  return problems;
}
