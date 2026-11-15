/**
 * Conformance gate: O1 conforms to O2, O0 conforms to O1, and the bindings
 * of O0 are backed by the capabilities the DT reports.
 */
import { availableKeys, isSensor } from "./devices";
import { type Federation } from "./federation";
import {
  INTERIM_BEHAVIOURS,
  PRIMITIVES,
  repr,
  str,
  targets,
  valueConforms,
  modelKey,
  type Model,
} from "./kernel/model";
import { ref } from "./kernel/refs";

export interface Issue {
  check: string;
  element: string;
  message: string;
}

export function issueText(issue: Issue): string {
  return `[${issue.check}] ${issue.element}: ${issue.message}`;
}

function checkTypes(fed: Federation, model: Model, issues: Issue[]): void {
  const key = modelKey(model);
  const add = (element: string, message: string) => issues.push({ check: "O1->O2", element, message });
  const meta = fed.models[model.typedBy ?? ""];
  if (!meta || meta.level !== "O2") {
    add(key, `typedBy ${repr(model.typedBy)} is not an O2 model`);
    return;
  }
  if (!Number.isInteger(model.version)) add(key, "an O1 type must carry a version");
  for (const eclass of Object.values(model.eClasses)) {
    const where = ref(key, eclass.name);
    if (!(eclass.instanceOf !== null && eclass.instanceOf in meta.eClasses)) {
      add(where, `instanceOf ${repr(eclass.instanceOf)} is not in ${modelKey(meta)}`);
    }
    for (const attribute of Object.values(eclass.eAttributes)) {
      if (!PRIMITIVES.includes(attribute.eType)) {
        add(ref(key, eclass.name, attribute.name), "unknown eType");
      }
    }
    for (const reference of Object.values(eclass.eReferences)) {
      if (!(reference.eType in model.eClasses)) {
        add(
          ref(key, eclass.name, reference.name),
          `eType ${repr(reference.eType)} is not a class of ${key}`,
        );
      }
    }
    for (const operation of Object.values(eclass.eOperations ?? {})) {
      for (const parameter of Object.values(operation.eParameters)) {
        if (!PRIMITIVES.includes(parameter.eType)) {
          add(ref(key, eclass.name, operation.name), `parameter ${repr(parameter.name)} has an unknown eType`);
        }
      }
    }
    const behaviour = eclass.properties.onDrift;
    if (behaviour !== undefined && behaviour !== null && !INTERIM_BEHAVIOURS.includes(behaviour)) {
      add(where, `unknown interim behaviour ${repr(behaviour)}`);
    }
  }
}

function checkInstances(fed: Federation, model: Model, issues: Issue[]): void {
  const add = (check: string, element: string, message: string) =>
    issues.push({ check, element, message });
  const o1 = fed.models[model.typedBy ?? ""];
  if (!o1 || o1.level !== "O1") {
    add("O0->O1", model.name, `typedBy ${repr(model.typedBy)} is not an O1 type`);
    return;
  }
  const capabilities = availableKeys(fed, model.name);
  for (const obj of Object.values(model.objects)) {
    const where = ref(model.name, obj.name);
    const eclass = o1.eClasses[obj.instanceOf];
    if (!eclass) {
      add("O0->O1", where, `instanceOf ${repr(obj.instanceOf)} is not in ${modelKey(o1)}`);
      continue;
    }
    for (const [attributeName, key] of Object.entries(obj.bindings)) {
      const attribute = eclass.eAttributes[attributeName];
      const element = ref(model.name, obj.name, attributeName);
      if (!attribute) {
        add("O0->O1", element, `${eclass.name} has no such attribute`);
        continue;
      }
      if (isSensor(fed, model, obj)) continue; // a sensor provides the key: nothing has to report it
      const capability = capabilities[key];
      if (!capability) {
        add("O0->data", element, `bound key ${repr(key)} is not a capability of the DT`);
      } else if ((capability.eType ?? null) !== attribute.eType) {
        add(
          "O0->data",
          element,
          `key ${repr(key)} provides ${str(capability.eType)}, the type expects ${attribute.eType}`,
        );
      } else if ((capability.unit ?? null) !== attribute.unit) {
        add(
          "O0->data",
          element,
          `key ${repr(key)} has unit ${repr(capability.unit)}, ` +
            `the type expects ${repr(attribute.unit)}`,
        );
      }
    }
    for (const [slot, value] of Object.entries(obj.slots)) {
      const element = ref(model.name, obj.name, slot);
      if (slot in eclass.eAttributes) {
        const etype = eclass.eAttributes[slot].eType;
        if (!valueConforms(value, etype)) {
          add("O0->O1", element, `value ${repr(value)} does not conform to ${etype}`);
        }
      } else if (!(slot in eclass.eReferences)) {
        add("O0->O1", element, `${eclass.name} has no such feature`);
      }
    }
    for (const reference of Object.values(eclass.eReferences)) {
      const element = ref(model.name, obj.name, reference.name);
      const found = targets(obj, reference.name);
      if (found.length < reference.lowerBound) {
        add("O0->O1", element, `needs at least ${reference.lowerBound} target(s)`);
      }
      if (reference.upperBound !== -1 && found.length > reference.upperBound) {
        add("O0->O1", element, `accepts at most ${reference.upperBound} target(s)`);
      }
      for (const target of found) {
        const other = model.objects[target];
        if (!other) {
          add("O0->O1", element, `target ${repr(target)} does not exist`);
        } else if (other.instanceOf !== reference.eType) {
          add(
            "O0->O1",
            element,
            `target ${repr(target)} is a ${other.instanceOf}, expected ${reference.eType}`,
          );
        }
      }
    }
  }
}

export function checkConformance(fed: Federation): Issue[] {
  const issues: Issue[] = [];
  for (const model of Object.values(fed.models)) {
    if (model.level === "O1") checkTypes(fed, model, issues);
    else if (model.level === "O0") checkInstances(fed, model, issues);
  }
  return issues;
}
