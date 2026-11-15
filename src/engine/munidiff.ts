/**
 * Differences between two versions of a model, in the Munidiff syntax
 * (A. de la Vega, "Towards an Interoperable Textual Format for Model
 * Differences Reporting", MODELS-C 2023): a unified diff whose hunks are model
 * elements instead of lines of text.
 *
 *   @@ @@
 *    room1.Occupancy:EClass {        a changed element lists only what changed,
 *   +    onDrift: suspend            the new value before the old one
 *   -    onDrift: exclude_input
 *    }
 *
 * `-->` is a reference, `*-->` a containment; an added or removed element has
 * `+` or `-` on every line. Elements are matched by qualified name. For an O0
 * object the type after the colon is the O1 class it is an instance of.
 */
import { CORRESPONDENCE, resolve, type Federation } from "./federation";
import { instanceOfModel, weavingName } from "./modelset";
import { type Dict, type EClass, type Model } from "./kernel/model";
import { parseRef } from "./kernel/refs";

const INDENT = "    ";

interface Feature {
  name: string;
  /** `: ` attribute, ` --> ` reference, ` *--> ` containment */
  separator: ": " | " --> " | " *--> ";
  many: boolean;
  values: string[];
}

interface Element {
  label: string;
  features: Feature[];
}

const attribute = (name: string, value: unknown): Feature => ({
  name,
  separator: ": ",
  many: false,
  values: value === null || value === undefined ? [] : [String(value)],
});
const reference = (name: string, targets: string[], many = false): Feature => ({
  name,
  separator: " --> ",
  many,
  values: targets,
});
const containment = (name: string, parts: string[]): Feature => ({
  name,
  separator: " *--> ",
  many: true,
  values: parts,
});

/** The label of the element a reference points to, in any model. An element
 * that no longer exists keeps the label it had in the other version. */
function labelOf(fed: Federation, other: Federation, element: string): string {
  const parsed = parseRef(element);
  const dotted = [parsed.model.split("@")[0], ...(parsed.data ? ["data"] : []), ...parsed.path].join(".");
  if (parsed.data) return `${dotted}:Capability`;
  const found = resolve(fed, element) ?? resolve(other, element);
  if (!found || !parsed.path.length) return dotted;
  if (found.attribute) return `${dotted}:EAttribute`;
  if (found.obj) return `${dotted}:${found.obj.instanceOf}`;
  return `${dotted}:EClass`;
}

function classElements(fed: Federation, model: Model, out: Map<string, Element>): void {
  const meta = fed.models[model.typedBy ?? ""];
  for (const eclass of Object.values(model.eClasses) as EClass[]) {
    const id = `${model.name}.${eclass.name}`;
    const features: Feature[] = [];
    if (eclass.instanceOf) {
      features.push(reference("instanceOf", [`${meta?.name ?? model.typedBy}.${eclass.instanceOf}:EClass`]));
    }
    for (const [name, value] of Object.entries(eclass.properties)) features.push(attribute(name, value));
    const attributes = Object.values(eclass.eAttributes);
    const references = Object.values(eclass.eReferences);
    if (attributes.length) {
      features.push(containment("eAttributes", attributes.map((a) => `${id}.${a.name}:EAttribute`)));
    }
    if (references.length) {
      features.push(containment("eReferences", references.map((r) => `${id}.${r.name}:EReference`)));
    }
    const operations = Object.values(eclass.eOperations ?? {});
    if (operations.length) {
      features.push(containment("eOperations", operations.map((o) => `${id}.${o.name}:EOperation`)));
    }
    out.set(id, { label: `${id}:EClass`, features });
    for (const o of operations) {
      const parameters = Object.values(o.eParameters).map((p) => `${p.name}: ${p.eType}${p.unit ? ` [${p.unit}]` : ""}`);
      out.set(`${id}.${o.name}`, {
        label: `${id}.${o.name}:EOperation`,
        features: [
          attribute("description", o.description),
          { name: "eParameters", separator: ": ", many: true, values: parameters },
        ],
      });
    }
    for (const a of attributes) {
      out.set(`${id}.${a.name}`, {
        label: `${id}.${a.name}:EAttribute`,
        features: [attribute("eType", a.eType), attribute("unit", a.unit), attribute("meaning", a.meaning)],
      });
    }
    for (const r of references) {
      out.set(`${id}.${r.name}`, {
        label: `${id}.${r.name}:EReference`,
        features: [
          reference("eType", [`${model.name}.${r.eType}:EClass`]),
          attribute("lowerBound", r.lowerBound),
          attribute("upperBound", r.upperBound),
        ],
      });
    }
  }
}

function flatten(prefix: string, value: Dict, out: Feature[]): void {
  for (const [name, inner] of Object.entries(value)) out.push(attribute(`${prefix}.${name}`, inner));
}

/** Every element of one model, by qualified name, in a stable order. */
function elementsOf(fed: Federation, other: Federation, model: string): Map<string, Element> {
  const out = new Map<string, Element>();
  const found = fed.models[model];
  if (!found) return out;
  if (found.level === "O2") {
    classElements(fed, found, out);
    for (const rule of fed.derivations) {
      const id = `${model}.${rule.source}->${rule.target}`;
      out.set(id, { label: `${id}:Derivation`, features: [attribute("expression", rule.expression)] });
    }
    return out;
  }
  const instance = instanceOfModel(fed, model);
  const type = fed.models[instance?.typedBy ?? ""];
  if (type) classElements(fed, type, out);
  for (const obj of Object.values(instance?.objects ?? {})) {
    const eclass = type?.eClasses[obj.instanceOf];
    const features: Feature[] = [];
    const bindings = Object.entries(obj.bindings).map(([a, key]) => `${a} <- ${key}`);
    if (bindings.length) features.push({ name: "bindings", separator: ": ", many: true, values: bindings });
    for (const [slot, value] of Object.entries(obj.slots)) {
      if (eclass && slot in eclass.eReferences) {
        const targets = (Array.isArray(value) ? value : [value]).map(
          (t) => `${model}.${t}:${instance?.objects[t]?.instanceOf ?? "?"}`,
        );
        features.push(reference(slot, targets, eclass.eReferences[slot].upperBound !== 1));
      } else {
        features.push(attribute(slot, value));
      }
    }
    out.set(`${model}.${obj.name}`, { label: `${model}.${obj.name}:${obj.instanceOf}`, features });
  }
  for (const [key, capability] of Object.entries(fed.capabilities[model] ?? {})) {
    const id = `${model}.data.${key}`;
    out.set(id, {
      label: `${id}:Capability`,
      features: Object.entries(capability).map(([name, value]) => attribute(name, value)),
    });
  }
  for (const link of fed.weaving[weavingName(model)]?.links ?? []) {
    if (link.type !== CORRESPONDENCE) continue;
    const features: Feature[] = [];
    for (const [end, element] of Object.entries(link.ends)) features.push(reference(end, [labelOf(fed, other, element)]));
    for (const [name, value] of Object.entries(link.props)) {
      if (value === null || value === undefined) continue;
      if (Array.isArray(value)) {
        features.push({
          name,
          separator: ": ",
          many: true,
          values: value.map((v) => (typeof v === "object" ? Object.values(v as Dict).join(": ") : String(v))),
        });
      } else if (typeof value === "object") {
        flatten(name, value as Dict, features);
      } else {
        features.push(attribute(name, value));
      }
    }
    out.set(`${model}.${link.id}`, { label: `${model}.${link.id}:${link.type}`, features });
  }
  return out;
}

/** Lines of a feature, without the diff prefix. */
function featureLines(feature: Feature): string[] {
  if (!feature.many) return [`${INDENT}${feature.name}${feature.separator}${feature.values[0]}`];
  return [
    `${INDENT}${feature.name}${feature.separator} [`,
    ...feature.values.map((value) => `${INDENT}${INDENT}${value}`),
    `${INDENT}]`,
  ];
}

/** Longest common subsequence of two lists, as index pairs. */
function common(a: string[], b: string[]): [number, number][] {
  const table = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) pairs.push([i++, j++]);
    else if (table[i + 1][j] >= table[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

function changedFeature(before: Feature | undefined, after: Feature | undefined): string[] {
  const shape = (after ?? before) as Feature;
  const old = before?.values ?? [];
  const now = after?.values ?? [];
  if (!shape.many) {
    return [
      ...now.map((value) => `+${INDENT}${shape.name}${shape.separator}${value}`),
      ...old.map((value) => `-${INDENT}${shape.name}${shape.separator}${value}`),
    ];
  }
  const lines = [` ${INDENT}${shape.name}${shape.separator} [`];
  let i = 0;
  let j = 0;
  for (const [x, y] of [...common(old, now), [old.length, now.length] as [number, number]]) {
    for (; j < y; j++) lines.push(`+${INDENT}${INDENT}${now[j]}`);
    for (; i < x; i++) lines.push(`-${INDENT}${INDENT}${old[i]}`);
    if (x < old.length) lines.push(` ${INDENT}${INDENT}${old[x]}`);
    i = x + 1;
    j = y + 1;
  }
  lines.push(` ${INDENT}]`);
  return lines;
}

export interface MunidiffOptions {
  /** Names of the two versions in the header, e.g. `room1/versions/0001`. */
  from?: string;
  to?: string;
}

/** The differences of `model` between two federations; empty when there are none. */
export function munidiff(before: Federation, after: Federation, model: string, options: MunidiffOptions = {}): string {
  const old = elementsOf(before, after, model);
  const now = elementsOf(after, before, model);
  const hunks: string[] = [];
  for (const id of [...old.keys(), ...[...now.keys()].filter((key) => !old.has(key))]) {
    const a = old.get(id);
    const b = now.get(id);
    if (a && !b) {
      const body = a.features.filter((f) => f.values.length).flatMap(featureLines);
      hunks.push(["@@ @@", `-${a.label} {`, ...body.map((line) => `-${line}`), "-}"].join("\n"));
    } else if (b && !a) {
      const body = b.features.filter((f) => f.values.length).flatMap(featureLines);
      hunks.push(["@@ @@", `+${b.label} {`, ...body.map((line) => `+${line}`), "+}"].join("\n"));
    } else if (a && b) {
      const names = [...a.features.map((f) => f.name), ...b.features.map((f) => f.name)];
      const body: string[] = [];
      for (const name of [...new Set(names)]) {
        const x = a.features.find((f) => f.name === name);
        const y = b.features.find((f) => f.name === name);
        if (JSON.stringify(x?.values ?? []) === JSON.stringify(y?.values ?? [])) continue;
        body.push(...changedFeature(x, y));
      }
      // an element whose type changed (an object of another class) shows both labels
      if (a.label !== b.label) hunks.push(["@@ @@", `+${b.label} {`, `-${a.label} {`, ...body, " }"].join("\n"));
      else if (body.length) hunks.push(["@@ @@", ` ${b.label} {`, ...body, " }"].join("\n"));
    }
  }
  if (!hunks.length) return "";
  return [`--- ${options.from ?? `${model} (before)`}`, `+++ ${options.to ?? `${model} (after)`}`, ...hunks].join("\n");
}
