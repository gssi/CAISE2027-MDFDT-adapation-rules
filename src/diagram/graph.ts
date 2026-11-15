/**
 * From the modeling layer to a drawable graph: containers (one per model, in
 * the lane of its level), nodes (classes, objects, observation keys) and edges
 * (typing, references, bindings, weaving links). Pure: no layout, no DOM.
 *
 * When `before` is given the graph shows the change between two versions:
 * elements that disappeared are kept and marked `removed`.
 */
import { type CorrespondenceStatus } from "@/engine/weaving/checks";
import {
  CORRESPONDENCE,
  EVOLUTION,
  REPRESENTATION,
  classProps,
  links,
  typeOf,
  type Federation,
} from "@/engine/federation";
import {
  classToDict,
  modelKey,
  objectToDict,
  targets,
  type Dict,
  type Model,
} from "@/engine/kernel/model";
import { dataRef, parseRef, ref } from "@/engine/kernel/refs";
import { availableKeys, isSensor } from "@/engine/devices";
import { type LiveValue } from "@/engine/runtime/live";
import { linkToDict, type WModel } from "@/engine/weaving/model";

export type LaneId = "O2" | "O1" | "O0" | "data";
export const LANES: LaneId[] = ["O2", "O1", "O0", "data"];

export type Mark = "added" | "removed" | "modified";
export type EdgeKind =
  | "typing"
  | "reference"
  | "binding"
  | "correspondence"
  | "representation"
  | "evolution"
  | "drift"
  | "impact";

export const EDGE_KINDS: EdgeKind[] = [
  "typing",
  "reference",
  "binding",
  "correspondence",
  "representation",
  "evolution",
  "drift",
  "impact",
];

export interface GContainer {
  id: string;
  lane: LaneId;
  title: string;
  subtitle?: string;
  /** Containers of the lane below that this one should sit above. */
  anchors: string[];
  mark?: Mark;
  /** Stands for another model: only what a weaving link touches is shown. */
  proxy?: boolean;
  /** What a button in the title adds to the container ("Add a class"); none without it. */
  action?: string;
}

export interface GRow {
  text: string;
  mark?: Mark;
  /** A live reading shown next to the row; null while there is none yet. */
  value?: LiveValue | null;
}

export interface GNode {
  id: string;
  container: string;
  kind: "class" | "object" | "key";
  title: string;
  subtitle?: string;
  rows: GRow[];
  mark?: Mark;
  drift?: boolean;
  impact?: string; // severity
  proxy?: boolean;
}

export interface GEdge {
  id: string;
  kind: EdgeKind;
  from: string;
  to: string;
  label?: string;
  /** Status, severity or origin: drives the colour. */
  tone?: string;
  /** Edges of the same kind into the same target may share one trunk. */
  bus?: boolean;
  detail?: string;
  mark?: Mark;
  /** Read from another relation, not stated in a model: a correspondence as it holds among the types. */
  derived?: boolean;
  /** A reference that holds its target as a part: drawn with a diamond on the whole. */
  containment?: boolean;
}

export interface GraphSpec {
  containers: GContainer[];
  nodes: GNode[];
  edges: GEdge[];
}

export interface Overlays {
  statuses?: CorrespondenceStatus[];
  drift?: WModel | null;
  impact?: WModel | null;
  /** Live readings, by element reference; null when live reading is off. */
  values?: Record<string, LiveValue> | null;
}

export interface GraphOptions {
  /** Show one model only; the others appear as proxies of what it weaves. */
  focus?: string;
}

const PROXY = "proxy:";
/** Ending of the id of a correspondence as it reads among the types. */
export const TYPES = "@types";
const modelOfId = (id: string) => id.replace(/@data$/, "").split("#")[0].split("@")[0];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function markOf(now: unknown, old: unknown, comparing: boolean): Mark | undefined {
  if (!comparing) return undefined;
  if (old === undefined) return "added";
  if (now === undefined) return "removed";
  return same(now, old) ? undefined : "modified";
}

function attributeText(name: string, a: Dict): string {
  return `${name}: ${a.eType}${a.unit ? ` [${a.unit}]` : ""}`;
}

function classRows(now: Dict | undefined, old: Dict | undefined, comparing: boolean): GRow[] {
  const a: Dict = now?.eAttributes ?? {};
  const b: Dict = old?.eAttributes ?? {};
  const names = [...Object.keys(a), ...Object.keys(b).filter((n) => !(n in a))];
  const rows: GRow[] = names.map((name) => ({
    text: attributeText(name, a[name] ?? b[name]),
    mark: now && old ? markOf(a[name], b[name], comparing) : undefined,
  }));
  const x: Dict = now?.eOperations ?? {};
  const y: Dict = old?.eOperations ?? {};
  for (const name of [...Object.keys(x), ...Object.keys(y).filter((n) => !(n in x))]) {
    const parameters = Object.keys((x[name] ?? y[name]).eParameters ?? {});
    rows.push({
      text: `${name}(${parameters.join(", ")})`,
      mark: now && old ? markOf(x[name], y[name], comparing) : undefined,
    });
  }
  return rows;
}

function objectRows(
  model: Model | undefined,
  objName: string,
  type: Model | null,
  provides: boolean,
  needsSource: boolean,
  values: Record<string, LiveValue> | null,
): GRow[] {
  const obj = model?.objects[objName];
  if (!obj || !model) return [];
  const eclass = type?.eClasses[obj.instanceOf];
  const arrow = provides ? "→" : "←";
  const live = (attribute: string) =>
    values ? { value: values[ref(model.name, obj.name, attribute)] ?? null } : {};
  const rows: GRow[] = Object.entries(obj.bindings).map(([a, key]) => ({ text: `${a} ${arrow} ${key}`, ...live(a) }));
  for (const [slot, value] of Object.entries(obj.slots)) {
    if (eclass && slot in eclass.eReferences) continue;
    rows.push({ text: `${slot} = ${String(value)}` });
  }
  // With live readings on, what another DT provides shows what is received.
  if (values && needsSource) {
    for (const attribute of Object.keys(eclass?.eAttributes ?? {})) {
      if (!(attribute in obj.bindings) && !(attribute in obj.slots)) rows.push({ text: attribute, ...live(attribute) });
    }
  }
  return rows;
}

/** Two versions of a type that say the same: a commit gives a type its next number even when it did not change. */
function sameClasses(a: Model | null | undefined, b: Model | null | undefined): boolean {
  if (!a || !b) return false;
  const dict = (model: Model) => Object.entries(model.eClasses).map(([name, eclass]) => [name, classToDict(eclass)]);
  return same(dict(a), dict(b));
}

/** What differs between two versions of a correspondence, one line per property. */
function linkChanges(now: Dict, old: Dict, prefix = ""): string[] {
  const out: string[] = [];
  for (const name of new Set([...Object.keys(old), ...Object.keys(now)])) {
    const a = old[name];
    const b = now[name];
    if (same(a, b)) continue;
    const nested = (v: unknown) => typeof v === "object" && v !== null && !Array.isArray(v);
    if (nested(a) && nested(b)) out.push(...linkChanges(b, a, `${prefix}${name}.`));
    else out.push(`${prefix}${name}: ${a === undefined ? "none" : String(a)} → ${b === undefined ? "none" : String(b)}`);
  }
  return out;
}

export function buildGraph(
  after: Federation,
  before: Federation | null,
  kinds: ReadonlySet<EdgeKind>,
  overlays: Overlays = {},
  options: GraphOptions = {},
): GraphSpec {
  const comparing = before !== null;
  const old = before ?? after;
  const containers: GContainer[] = [];
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const nodeIds = new Set<string>();
  const containerIds = new Set<string>();
  const seenEdges = new Set<string>();

  const addEdge = (edge: GEdge) => {
    if (!kinds.has(edge.kind) || seenEdges.has(edge.id)) return;
    seenEdges.add(edge.id);
    edges.push(edge);
  };
  const addNode = (node: GNode) => {
    nodeIds.add(node.id);
    nodes.push(node);
  };

  const keys = [
    ...Object.keys(after.models),
    ...Object.keys(old.models).filter((k) => !(k in after.models)),
  ];
  for (const key of keys) {
    const now = after.models[key];
    const was = old.models[key];
    const model = now ?? was;
    // A type that only got its next number is the type it was, not a new one.
    const typed = now ? Object.values(after.models).find((m) => m.level === "O0" && m.typedBy === key) : undefined;
    const renumbered =
      comparing && model.level === "O1" && !was && sameClasses(now, old.models[old.models[typed?.name ?? ""]?.typedBy ?? ""]);
    const mark = renumbered ? undefined : markOf(now ? 1 : undefined, was ? 1 : undefined, comparing);
    containerIds.add(key);

    if (model.level !== "O0") {
      const anchors = [after, old].flatMap((fed) =>
        Object.values(fed.models)
          .filter((m) => (model.level === "O1" ? m.level === "O0" : m.level === "O1"))
          .filter((m) => m.typedBy === key)
          .map(modelKey),
      );
      containers.push({
        id: key,
        lane: model.level,
        title: key,
        subtitle: model.typedBy ? `: ${model.typedBy}` : undefined,
        anchors: [...new Set(anchors)],
        mark,
      });
      const names = [
        ...Object.keys(now?.eClasses ?? {}),
        ...Object.keys(was?.eClasses ?? {}).filter((n) => !(n in (now?.eClasses ?? {}))),
      ];
      for (const name of names) {
        const c = now?.eClasses[name];
        const p = renumbered ? c : was?.eClasses[name];
        const eclass = c ?? p!;
        const id = ref(key, name);
        addNode({
          id,
          container: key,
          kind: "class",
          title: name,
          subtitle: eclass.instanceOf ? `: ${eclass.instanceOf}` : undefined,
          rows: classRows(c && classToDict(c), p && classToDict(p), comparing && !mark),
          mark: mark ?? markOf(c && classToDict(c), p && classToDict(p), comparing),
        });
        if (eclass.instanceOf && model.typedBy) {
          addEdge({
            id: `typing:${id}`,
            kind: "typing",
            from: id,
            to: ref(model.typedBy, eclass.instanceOf),
            bus: true,
          });
        }
        for (const reference of Object.values(eclass.eReferences)) {
          const many = reference.upperBound === -1 ? " *" : "";
          addEdge({
            id: `reference:${id}.${reference.name}`,
            kind: "reference",
            from: id,
            to: ref(key, reference.eType),
            label: `${reference.name}${many}`,
            containment: reference.containment || undefined,
          });
        }
      }
      continue;
    }

    // O0: the objects of one DT, and below them the data it can provide.
    const typeNow = now ? typeOf(after, now) : null;
    const typeWas = was ? typeOf(old, was) : null;
    const retyped = comparing && now && was && now.typedBy !== was.typedBy && !sameClasses(typeNow, typeWas);
    containers.push({
      id: key,
      lane: "O0",
      title: model.dt ? `${model.dt} · ${key}` : key,
      subtitle: `: ${model.typedBy}`,
      anchors: [],
      mark: mark ?? (retyped ? "modified" : undefined),
    });
    const names = [
      ...Object.keys(now?.objects ?? {}),
      ...Object.keys(was?.objects ?? {}).filter((n) => !(n in (now?.objects ?? {}))),
    ];
    for (const name of names) {
      const o = now?.objects[name];
      const p = was?.objects[name];
      const obj = o ?? p!;
      const owner = o ? now : was;
      const type = o ? typeNow : typeWas;
      const id = ref(key, name);
      const provides = Boolean(owner && isSensor(o ? after : old, owner, obj));
      addNode({
        id,
        container: key,
        kind: "object",
        title: name,
        subtitle: `: ${obj.instanceOf}`,
        rows: objectRows(
          owner,
          name,
          type,
          provides,
          Boolean(classProps(o ? after : old, type, obj.instanceOf).requiresSource),
          overlays.values ?? null,
        ),
        mark: mark ?? markOf(o && objectToDict(o), p && objectToDict(p), comparing),
      });
      if (type) {
        addEdge({
          id: `typing:${id}`,
          kind: "typing",
          from: id,
          to: ref(modelKey(type), obj.instanceOf),
          bus: true,
        });
        for (const [reference, declared] of Object.entries(type.eClasses[obj.instanceOf]?.eReferences ?? {})) {
          for (const target of targets(obj, reference)) {
            addEdge({
              id: `reference:${id}.${reference}.${target}`,
              kind: "reference",
              from: id,
              to: ref(key, target),
              label: reference,
              containment: declared.containment || undefined,
            });
          }
        }
      }
      for (const [attribute, observed] of Object.entries(obj.bindings)) {
        const keyNode = dataRef(key, observed);
        addEdge({
          id: `binding:${id}.${attribute}`,
          kind: "binding",
          from: provides ? id : keyNode,
          to: provides ? keyNode : id,
          label: attribute === observed ? undefined : attribute,
        });
      }
    }
    const capsNow = now ? availableKeys(after, key) : {};
    const capsWas = was ? availableKeys(old, key) : {};
    const capKeys = [...Object.keys(capsNow), ...Object.keys(capsWas).filter((k) => !(k in capsNow))];
    if (capKeys.length) {
      const dataId = `${key}@data`;
      containerIds.add(dataId);
      containers.push({ id: dataId, lane: "data", title: `${key} data`, anchors: [key] });
      for (const capability of capKeys) {
        const c: Dict = capsNow[capability] ?? capsWas[capability];
        addNode({
          id: dataRef(key, capability),
          container: dataId,
          kind: "key",
          title: capability,
          rows: [
            {
              text: [c.eType, c.unit].filter(Boolean).join(" · "),
              ...(overlays.values ? { value: overlays.values[dataRef(key, capability)] ?? null } : {}),
            },
          ],
          mark: mark ?? markOf(capsNow[capability], capsWas[capability], comparing),
        });
      }
    }
  }

  /** The node (or container) an element reference lands on. */
  const endOf = (element: string | undefined): string | null => {
    if (!element) return null;
    const parsed = parseRef(element);
    const owner = parsed.path.length
      ? parsed.data
        ? dataRef(parsed.model, parsed.path[0])
        : ref(parsed.model, parsed.path[0])
      : null;
    if (owner && nodeIds.has(owner)) return owner;
    const container = parsed.data ? `${parsed.model}@data` : parsed.model;
    return containerIds.has(container) ? container : null;
  };
  const connect = (edge: Omit<GEdge, "from" | "to">, from?: string, to?: string) => {
    const a = endOf(from);
    const b = endOf(to);
    if (a && b && a !== b) addEdge({ ...edge, from: a, to: b });
  };

  // Typing and references may point at elements that are not drawn.
  for (let i = edges.length - 1; i >= 0; i--) {
    const e = edges[i];
    if (!(nodeIds.has(e.from) || containerIds.has(e.from)) || !nodeIds.has(e.to)) edges.splice(i, 1);
  }

  const statuses = new Map((overlays.statuses ?? []).map((s) => [s.correspondence, s]));
  const drifted = new Map<string, Dict>();
  for (const link of overlays.drift?.links ?? []) {
    if (link.type === "HorizontalDrift" && link.props.correspondence) {
      drifted.set(link.props.correspondence, link.props);
    }
  }
  const drawn = new Set<string>();
  for (const fed of comparing ? [after, old] : [after]) {
    for (const link of links(fed, CORRESPONDENCE)) {
      if (drawn.has(link.id)) continue;
      drawn.add(link.id);
      const status = statuses.get(link.id);
      const drift = drifted.get(link.id);
      const tone: string = drift?.status ?? status?.status ?? "holds";
      const mapping = link.props.mapping ? ` · ${link.props.mapping}` : "";
      const earlier = comparing ? links(old, CORRESPONDENCE).find((l) => l.id === link.id) : undefined;
      const changes = earlier && fed === after ? linkChanges(linkToDict(link), linkToDict(earlier)) : [];
      const mark: Mark | undefined = !comparing
        ? undefined
        : fed === old && !links(after, CORRESPONDENCE).some((l) => l.id === link.id)
          ? "removed"
          : !earlier
            ? "added"
            : changes.length
              ? "modified"
              : undefined;
      connect(
        {
          id: `correspondence:${link.id}`,
          kind: "correspondence",
          label: `${link.id}${tone === "holds" ? "" : ` · ${tone}`}${mapping}${mark === "modified" ? " · changed" : mark === "added" ? " · new" : ""}`,
          tone,
          detail: [...changes, ...(drift?.reasons ?? status?.reasons ?? [])].join("; ") || undefined,
          mark,
        },
        link.ends.participating,
        link.ends.initiating,
      );
    }
    for (const link of links(fed, REPRESENTATION)) {
      connect(
        {
          id: `representation:${link.id}`,
          kind: "representation",
          label: "twin",
          detail: `${link.ends.dt} is the DT of ${link.ends.entity}`,
          mark: !comparing
            ? undefined
            : !links(after, REPRESENTATION).some((l) => l.id === link.id)
              ? "removed"
              : !links(old, REPRESENTATION).some((l) => l.id === link.id)
                ? "added"
                : undefined,
        },
        link.ends.entity,
        link.ends.dt,
      );
    }
    for (const link of links(fed, EVOLUTION)) {
      connect({ id: `evolution:${link.id}`, kind: "evolution" }, link.ends.from, link.ends.to);
    }
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const link of overlays.drift?.links ?? []) {
    if (link.type === "VerticalDrift") {
      const bottomUp = link.props.origin === "bottom-up";
      const [from, to] = bottomUp ? [link.ends.lower, link.ends.upper] : [link.ends.upper, link.ends.lower];
      connect(
        {
          id: `drift:${link.id}`,
          kind: "drift",
          label: link.props.origin,
          tone: "vertical",
          detail: (link.props.reasons ?? []).join("; "),
        },
        from,
        to,
      );
    }
    for (const end of Object.values(link.ends)) {
      const node = byId.get(endOf(end) ?? "");
      if (node) node.drift = true;
    }
  }
  const rank: Record<string, number> = { low: 1, medium: 2, high: 3 };
  for (const link of overlays.impact?.links ?? []) {
    const node = byId.get(endOf(link.ends.target) ?? "");
    const severity: string = link.props.severity ?? "low";
    if (node && (rank[severity] ?? 0) > (rank[node.impact ?? ""] ?? 0)) node.impact = severity;
    if (link.props.category === "correspondence") continue; // shown by the correspondence itself
    connect(
      {
        id: `impact:${link.id}`,
        kind: "impact",
        label: link.props.category,
        tone: severity,
        detail: link.props.reason,
      },
      link.ends.source,
      link.ends.target,
    );
  }

  return options.focus ? focusOn({ containers, nodes, edges }, options.focus, after, old, comparing) : { containers, nodes, edges };
}

/**
 * The graph of one model. Of the other models only the elements its weaving
 * links touch remain, as proxies grouped by the model they come from.
 */
function focusOn(spec: GraphSpec, focus: string, after: Federation, old: Federation, comparing: boolean): GraphSpec {
  const current = new Set([after.models[focus]?.typedBy, comparing ? old.models[focus]?.typedBy : undefined]);
  const own = new Set(
    spec.containers
      .filter((c) => modelOfId(c.id) === focus && (c.lane !== "O1" || current.has(c.id)))
      .map((c) => c.id),
  );
  // An earlier type that says the same as the current one is not a change to show.
  const currentType = after.models[after.models[focus]?.typedBy ?? ""];
  for (const id of [...own]) {
    const earlier = after.models[id] ?? old.models[id];
    if (comparing && earlier?.level === "O1" && earlier !== currentType && sameClasses(earlier, currentType)) own.delete(id);
  }
  const containers = spec.containers.filter((c) => own.has(c.id));
  const nodes = spec.nodes.filter((n) => own.has(n.container));
  const visible = new Set([...own, ...nodes.map((n) => n.id)]);
  // An earlier type the instance no longer conforms to is shown as what it replaces.
  for (const container of containers) {
    if (container.lane === "O1" && comparing && container.id !== after.models[focus]?.typedBy) {
      container.mark = "removed";
      for (const node of nodes) if (node.container === container.id) node.mark = "removed";
    }
  }
  const byId = new Map(spec.nodes.map((n) => [n.id, n]));
  const proxies = new Map<string, GContainer>();
  const laneOfContainer = new Map(spec.containers.map((c) => [c.id, c.lane]));
  const proxyOf = (id: string): string => {
    const model = modelOfId(id);
    // on the level of what is linked: an object among the instances, a class among the types
    const home = byId.get(id)?.container;
    const lane = (home && laneOfContainer.get(home)) || "O0";
    const containerId = PROXY + model + (lane === "O0" ? "" : `:${lane}`);
    if (!proxies.has(containerId)) {
      const instance = after.models[model] ?? old.models[model];
      proxies.set(containerId, {
        id: containerId,
        lane,
        title: lane === "O0" ? (instance?.dt ? `${instance.dt} · ${model}` : model) : (home ?? model),
        subtitle: lane === "O0" && instance?.typedBy ? `: ${instance.typedBy}` : undefined,
        anchors: [],
        proxy: true,
      });
    }
    const node = byId.get(id);
    if (!node) return containerId; // the link names a whole model
    if (!visible.has(id)) {
      nodes.push({ ...node, container: containerId, proxy: true });
      visible.add(id);
    }
    return id;
  };
  /** The class of an object, as a node of the type its model conforms to. */
  const classOf = (id: string): string | null => {
    const parsed = parseRef(id);
    // an object the change removed is still an instance of the class it had
    for (const fed of [after, old]) {
      const instance = fed.models[parsed.model];
      const obj = instance?.objects[parsed.path[0]];
      const node = instance?.typedBy && obj ? ref(instance.typedBy, obj.instanceOf) : null;
      if (node && byId.has(node)) return node;
    }
    return null;
  };
  /** The type of another model, as a box among the types. */
  const proxyType = (model: string): string | null => {
    const type = (after.models[model] ?? old.models[model])?.typedBy;
    if (!type || !laneOfContainer.has(type)) return null;
    const containerId = `${PROXY}${model}:O1`;
    if (!proxies.has(containerId)) {
      proxies.set(containerId, { id: containerId, lane: "O1", title: type, anchors: [], proxy: true });
    }
    return containerId;
  };
  const edges: GEdge[] = [];
  for (const edge of spec.edges) {
    const a = visible.has(edge.from);
    const b = visible.has(edge.to);
    if (a && b) edges.push(edge);
    else if (edge.kind === "representation" && (a || own.has(edge.to))) {
      // the entity is an object, the DT a whole model: one of the two is this model
      const dt = modelOfId(edge.to);
      const entityClass = classOf(edge.from);
      edges.push(a ? { ...edge, to: proxyOf(edge.to) } : { ...edge, from: proxyOf(edge.from) });
      // read among the types: the class of the entity, and the type of the DT
      const type = a ? proxyType(dt) : (after.models[dt]?.typedBy ?? null);
      if (entityClass && type) {
        edges.push({
          id: `${edge.id}${TYPES}`,
          kind: "representation",
          derived: true,
          detail: `the DT of an instance of this class`,
          from: a ? entityClass : proxyOf(entityClass),
          to: type,
        });
      }
    } else if (edge.kind === "correspondence" && (a || b || own.has(edge.from) || own.has(edge.to))) {
      const inside = a || own.has(edge.from);
      const [fromClass, toClass] = [classOf(edge.from), classOf(edge.to)];
      edges.push(inside ? { ...edge, to: proxyOf(edge.to) } : { ...edge, from: proxyOf(edge.from) });
      // A correspondence relates objects; what it states is about their classes.
      // The same relation is shown among the types, where it is read, not stated.
      if (fromClass && toClass) {
        edges.push({
          id: `${edge.id}${TYPES}`,
          kind: "correspondence",
          tone: edge.tone,
          derived: true,
          detail: `${edge.id.slice("correspondence:".length)} relates instances of these classes`,
          from: inside ? fromClass : proxyOf(fromClass),
          to: inside ? proxyOf(toClass) : toClass,
        });
      }
    }
  }
  const shown = new Set([...visible, ...proxies.keys()]);
  return {
    containers: [...containers, ...proxies.values()],
    nodes,
    edges: edges.filter((e) => shown.has(e.from) && shown.has(e.to)),
  };
}
