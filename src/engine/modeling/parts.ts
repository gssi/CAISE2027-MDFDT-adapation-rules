/**
 * Describing devices in a DT model: the device, its parts, what they sense and
 * what the model observes of it. Functions that change a model in place; the
 * modeler calls them, and so does the modelling assistant when it proposes the
 * version that follows a change of the hardware.
 *
 * A kind of device or part is given as data (its settings, parameters and
 * operations): the catalogue of a connector fits, and nothing here knows which.
 */
import { availableKeys, isSensor, providedKeys, type DeviceKind, type PartKind } from "../devices";

export type { DeviceKind, PartKind, SettingKind } from "../devices";
import { classProps, type Federation } from "../federation";
import { type Dict, type EAttribute, type Model } from "../kernel/model";

export function uniqueName(taken: Iterable<string>, stem: string): string {
  const names = new Set(taken);
  if (!names.has(stem)) return stem;
  let index = 2;
  while (names.has(`${stem}${index}`)) index++;
  return `${stem}${index}`;
}

export const pascal = (text: string) =>
  text
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");

function conceptWith(fed: Federation, type: Model, flag: "device" | "sensor" | "actuator"): string | null {
  const meta = fed.models[type.typedBy ?? ""];
  return Object.values(meta?.eClasses ?? {}).find((c) => c.properties[flag])?.name ?? null;
}

export const plainAttribute = (name: string, eType: string, unit?: string, meaning?: string): EAttribute => ({
  name,
  eType,
  unit: unit ?? null,
  meaning: meaning ?? null,
  upperBound: 1,
});

/**
 * Describe a device in a DT model: a class for this kind of device, with the
 * settings of its connector as attributes, and the object that is the device.
 * Returns the object, or null when the shared concepts have no device concept.
 */
export function addDevice(
  fed: Federation,
  model: string,
  connector: DeviceKind,
  settings: Dict = {},
): string | null {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  const concept = type ? conceptWith(fed, type, "device") : null;
  if (!instance || !type || !concept) return null;
  const className = `${pascal(connector.type)}Device`;
  type.eClasses[className] ??= {
    name: className,
    instanceOf: concept,
    eAttributes: Object.fromEntries(
      [{ name: "connector", eType: "EString" }, ...connector.settings].map((s) => [s.name, plainAttribute(s.name, s.eType)]),
    ),
    eReferences: {},
    properties: {},
  };
  const name = uniqueName(Object.keys(instance.objects), `${connector.type}_device`);
  const slots: Dict = { connector: connector.type };
  for (const setting of connector.settings) {
    const value = settings[setting.name] ?? setting.fallback;
    if (value !== undefined && value !== "") slots[setting.name] = value;
  }
  instance.objects[name] = { name, instanceOf: className, bindings: {}, slots };
  return name;
}

/**
 * Describe a sensor on a device: a class for this kind of sensor, whose
 * attributes are its settings and the parameters it senses, and the object
 * that is the sensor, each parameter bound to the observation key it provides.
 */
export function addSensor(
  fed: Federation,
  model: string,
  device: string,
  connector: DeviceKind,
  kind: PartKind,
  uid = "",
  /** The observation key of a parameter, when it is already decided. */
  given: Record<string, string> = {},
): string | null {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  // a part that senses nothing only acts
  const concept = type
    ? ((kind.parameters.length ? null : conceptWith(fed, type, "actuator")) ?? conceptWith(fed, type, "sensor"))
    : null;
  const deviceObject = instance?.objects[device];
  if (!instance || !type || !concept || !deviceObject) return null;
  // the class of this kind of part; a class of the same name that is something else keeps its name
  const taken = type.eClasses[pascal(kind.kind)];
  const className =
    taken && (taken.instanceOf !== concept || !("kind" in taken.eAttributes))
      ? uniqueName(Object.keys(type.eClasses), `${pascal(kind.kind)}${kind.parameters.length ? "Sensor" : "Actuator"}`)
      : pascal(kind.kind);
  type.eClasses[className] ??= {
    name: className,
    instanceOf: concept,
    eAttributes: Object.fromEntries([
      ["kind", plainAttribute("kind", "EString")],
      ...kind.settings.map((s) => [s.name, plainAttribute(s.name, s.eType)]),
      ...kind.parameters.map((p) => [p.name, plainAttribute(p.name, p.eType, p.unit, p.meaning)]),
    ]),
    eReferences: {
      device: { name: "device", eType: deviceObject.instanceOf, lowerBound: 1, upperBound: 1, containment: false },
    },
    ...(kind.operations?.length
      ? {
          eOperations: Object.fromEntries(
            kind.operations.map((operation) => [
              operation.name,
              {
                name: operation.name,
                description: operation.description,
                eParameters: Object.fromEntries(
                  operation.parameters.map((p) => [p.name, plainAttribute(p.name, p.eType, p.unit)]),
                ),
              },
            ]),
          ),
        }
      : {}),
    properties: {},
  };
  // a second sensor of the same kind is told apart by its UID
  const name =
    kind.kind in instance.objects && uid && uid !== kind.kind
      ? uniqueName(Object.keys(instance.objects), `${kind.kind}_${uid}`)
      : uniqueName(Object.keys(instance.objects), kind.kind);
  const keys = new Set(Object.keys(availableKeys(fed, model)));
  const bindings: Record<string, string> = {};
  for (const parameter of kind.parameters) {
    const key =
      given[parameter.name] ??
      (keys.has(parameter.name) ? uniqueName(keys, `${name}_${parameter.name}`) : parameter.name);
    keys.add(key);
    bindings[parameter.name] = key;
  }
  const slots: Dict = { kind: kind.kind, device };
  for (const setting of kind.settings) slots[setting.name] = setting.name === "uid" ? uid : (setting.fallback ?? "");
  instance.objects[name] = { name, instanceOf: className, bindings, slots };
  return name;
}

// -- from what a sensor senses to what the model observes --------------------

/** The elements of a model that use an observation key: `object.attribute`. */
export function usersOf(fed: Federation, model: string, key: string): string[] {
  const instance = fed.models[model];
  const out: string[] = [];
  for (const obj of Object.values(instance?.objects ?? {})) {
    if (isSensor(fed, instance, obj)) continue;
    for (const [attribute, bound] of Object.entries(obj.bindings)) if (bound === key) out.push(`${obj.name}.${attribute}`);
  }
  return out;
}

/** The attributes of the model a sensed parameter can feed: observations of
 * the same type and unit that no part provides yet, as `object.attribute`. One
 * that reads a key the DT merely reports can be fed by a part instead. */
export function linkTargets(fed: Federation, model: string, sensor: string, parameter: string): string[] {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  const sensed = type?.eClasses[instance?.objects[sensor]?.instanceOf ?? ""]?.eAttributes[parameter];
  if (!instance || !type || !sensed) return [];
  const out: string[] = [];
  const sensedKeys = providedKeys(fed, model);
  for (const obj of Object.values(instance.objects)) {
    if (!classProps(fed, type, obj.instanceOf).requiresSource || isSensor(fed, instance, obj)) continue;
    for (const attribute of Object.values(type.eClasses[obj.instanceOf]?.eAttributes ?? {})) {
      if ((obj.bindings[attribute.name] ?? "") in sensedKeys) continue;
      if (attribute.eType === sensed.eType && attribute.unit === sensed.unit) out.push(`${obj.name}.${attribute.name}`);
    }
  }
  return out;
}

/** Feed an observation of the model from a parameter a sensor senses. */
export function linkParameter(fed: Federation, model: string, sensor: string, parameter: string, target: string): boolean {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  const [objectName, attribute] = target.split(".");
  const obj = instance?.objects[objectName];
  const source = instance?.objects[sensor];
  const key = source?.bindings[parameter];
  if (!instance || !type || !obj || !source || !key) return false;
  obj.bindings[attribute] = key;
  // the observation says where its data comes from, when its class can
  for (const reference of Object.values(type.eClasses[obj.instanceOf]?.eReferences ?? {})) {
    if (reference.eType === source.instanceOf && reference.upperBound === 1) obj.slots[reference.name] = sensor;
  }
  return true;
}

/**
 * Model what a sensor senses as an observation of the DT: a class with one
 * attribute, typed like the parameter and referring to the sensor as its
 * source, and its object, bound to the key the parameter provides.
 */
export function observeParameter(
  fed: Federation,
  model: string,
  sensor: string,
  parameter: string,
  /** How to call the class of the observation; by default after the parameter. */
  called?: string,
): string | null {
  const instance = fed.models[model];
  const type = fed.models[instance?.typedBy ?? ""];
  const meta = fed.models[type?.typedBy ?? ""];
  const source = instance?.objects[sensor];
  const sensed = type?.eClasses[source?.instanceOf ?? ""]?.eAttributes[parameter];
  const concept = Object.values(meta?.eClasses ?? {}).find((c) => c.properties.requiresSource)?.name;
  const key = source?.bindings[parameter];
  if (!instance || !type || !source || !sensed || !concept || !key) return null;
  const className = uniqueName(Object.keys(type.eClasses), called || pascal(parameter));
  type.eClasses[className] = {
    name: className,
    instanceOf: concept,
    eAttributes: { [parameter]: { ...sensed, name: parameter } },
    eReferences: {
      source: { name: "source", eType: source.instanceOf, lowerBound: 1, upperBound: 1, containment: false },
    },
    properties: {},
  };
  const snake = (text: string) => text.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "_").toLowerCase();
  const name = uniqueName(Object.keys(instance.objects), called ? snake(className) : `${parameter}_observation`);
  instance.objects[name] = { name, instanceOf: className, bindings: { [parameter]: key }, slots: { source: sensor } };
  return name;
}

