/**
 * Layout of the multi-level diagram, as a pure function: positions and paths
 * from a graph, no DOM.
 *
 * Levels are horizontal lanes (O2, O1, O0, data). The layout adapts to the
 * width it is given: the models of a lane wrap onto several shelves, and a wide
 * model arranges its nodes on several rows, so the diagram can grow downwards
 * and fill the canvas instead of becoming a thin strip. Without a width
 * nothing wraps and every DT is a column.
 *
 * Connectors are orthogonal and routed like on a circuit board. Nodes sit on
 * rows; a connector leaves a node through its top or bottom side, runs
 * horizontally only in the gap between two rows (on a track of its own) and
 * crosses a row only through the free space between two nodes. A connector
 * therefore never runs through a node, and two connectors never share a
 * stretch of line.
 */
import { LANES, type GContainer, type GEdge, type GNode, type GraphSpec, type LaneId } from "./graph";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Point = [number, number];

export interface LLabel extends Rect {
  text: string;
}

export interface LEdge {
  id: string;
  /** Connectors that share a trunk have the same `connector`. */
  connector: string;
  points: Point[];
  arrow: boolean;
  label?: LLabel;
}

export interface LLane {
  id: LaneId;
  y: number;
  h: number;
}

export interface Layout {
  width: number;
  height: number;
  lanes: LLane[];
  containers: Record<string, Rect>;
  nodes: Record<string, Rect>;
  edges: LEdge[];
  /** The band at the side that holds what belongs to other models, when there is any. */
  aside?: Rect;
  /** The nodes of every container as they are arranged: rows from the top, each from the left. */
  rows: Record<string, string[][]>;
  /** The rows of every lane, from the top: where the nodes of the lane stand. */
  grid: Record<string, { y: number; h: number }[]>;
  /** The row of its lane on which each container of the band starts. */
  band: Record<string, number>;
}

export interface LayoutOptions {
  /** Width of a text in pixels; the default is an estimate for 12px text. */
  measure?: (text: string, bold?: boolean) => number;
  /** Width to stay within, by wrapping; unlimited when absent. */
  width?: number;
  /** Keep what belongs to other models among the rest, without a band at the side. */
  inline?: boolean;
  /**
   * The rows of nodes a modeler chose for a container, by container id. Such a
   * container is not wrapped: its nodes stand on these rows, in this order.
   * Ids that are not nodes of the container are ignored, and its nodes that
   * are not named follow on a last row.
   */
  arrangement?: Record<string, string[][]>;
  /**
   * The row of its lane on which a modeler wants a container of the band to
   * start, by container id. Without it a container starts next to the elements
   * of the model it is linked to. Containers never stand over each other: one
   * that finds its row taken goes below.
   */
  band?: Record<string, number>;
}

const MARGIN = 20;
const GUTTER = 44; // room for the lane names on the left
const SIDE = 40; // free space on both sides, wide enough for connectors
const CONTAINER_GAP = 44;
const NODE_GAP = 30;
const PAD = 12;
const TITLE = 22;
const HEADER = 32;
const ROW = 17;
const TRACK = 15;
const PORT_STEP = 12;
const NUDGE = 6;
const LABEL_H = 16;
const VALUE = 66; // room for a live reading at the end of a row
const ASIDE_GAP = 56; // between a model and the band of the models woven with it
const ASIDE_PAD = 14;
const ASIDE_NAME = 18; // room for the name of the band, written along its side

const estimate = (text: string, bold = false) => text.length * (bold ? 7.2 : 6.6);

export function nodeSize(node: GNode, measure = estimate): { w: number; h: number } {
  const title = measure(node.title, true) + (node.subtitle ? measure(` ${node.subtitle}`) : 0) + 24;
  // a row with a live reading keeps room for it, so the diagram does not move as values change
  const rows = Math.max(0, ...node.rows.map((row) => measure(row.text) + 20 + (row.value !== undefined ? VALUE : 0)));
  return {
    w: Math.round(Math.min(300, Math.max(112, title, rows))),
    h: HEADER + node.rows.length * ROW + (node.rows.length ? 8 : 0),
  };
}

interface Run {
  connector: string;
  x1: number;
  x2: number;
}

/** How a connector travels: the sides it uses and the gaps it runs through.
 * Gap `g` is the space above row `g`; between two gaps it crosses a row. */
interface Plan {
  edge: GEdge;
  connector: string;
  from: string;
  to: string;
  fromSide: "top" | "bottom";
  toSide: "top" | "bottom";
  gaps: number[];
  direct: boolean; // a straight line between two neighbours
}

const centre = (r: Rect) => r.x + r.w / 2;

/** Greedy assignment of horizontal runs to tracks: runs on a track never touch. */
function assignTracks(runs: Run[]): Map<string, number> {
  const merged = new Map<string, Run>();
  for (const run of runs) {
    const known = merged.get(run.connector);
    if (known) {
      known.x1 = Math.min(known.x1, run.x1);
      known.x2 = Math.max(known.x2, run.x2);
    } else {
      merged.set(run.connector, { ...run });
    }
  }
  const ordered = [...merged.values()].sort((a, b) => a.x1 - b.x1 || a.x2 - b.x2);
  const ends: number[] = [];
  const out = new Map<string, number>();
  for (const run of ordered) {
    let track = ends.findIndex((end) => end + 10 < run.x1);
    if (track === -1) track = ends.length;
    ends[track] = run.x2;
    out.set(run.connector, track);
  }
  return out;
}

function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && Math.abs(last[0] - p[0]) < 0.01 && Math.abs(last[1] - p[1]) < 0.01) continue;
    const prev = out[out.length - 2];
    if (
      prev &&
      last &&
      ((Math.abs(prev[0] - last[0]) < 0.01 && Math.abs(last[0] - p[0]) < 0.01) ||
        (Math.abs(prev[1] - last[1]) < 0.01 && Math.abs(last[1] - p[1]) < 0.01))
    ) {
      out[out.length - 1] = p;
    } else {
      out.push(p);
    }
  }
  return out;
}

/** Split `items` into rows no wider than `limit`, of similar width. */
function wrap<T>(items: T[], widthOf: (item: T) => number, gapAfter: (item: T) => number, limit: number): T[][] {
  if (!items.length) return [[]];
  let total = 0;
  items.forEach((item, i) => (total += widthOf(item) + (i < items.length - 1 ? gapAfter(item) : 0)));
  if (total <= limit) return [items];
  const target = Math.min(limit, (total / Math.ceil(total / limit)) * 1.12);
  const rows: T[][] = [[]];
  let used = 0;
  for (const item of items) {
    const row = rows[rows.length - 1];
    const w = widthOf(item);
    if (row.length && used + w > target) {
      rows.push([item]);
      used = w + gapAfter(item);
    } else {
      row.push(item);
      used += w + gapAfter(item);
    }
  }
  return rows;
}

export function layout(spec: GraphSpec, options: LayoutOptions = {}): Layout {
  const measure = options.measure ?? estimate;
  const content = (options.width ?? Number.POSITIVE_INFINITY) - GUTTER - 2 * SIDE - MARGIN;
  const lanes = LANES.filter((lane) => spec.containers.some((c) => c.lane === lane));
  const containerOf = new Map(spec.containers.map((c) => [c.id, c]));
  const nodesOf = new Map<string, GNode[]>();
  for (const node of spec.nodes) {
    nodesOf.set(node.container, [...(nodesOf.get(node.container) ?? []), node]);
  }
  const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));
  // -- what the modeler arranged by hand: the order of the nodes follows it
  const arranged = new Map<string, GNode[][]>();
  for (const [id, wanted] of Object.entries(options.arrangement ?? {})) {
    const own = nodesOf.get(id);
    if (!own?.length) continue;
    const left = new Map(own.map((node) => [node.id, node]));
    const rows: GNode[][] = [];
    for (const row of wanted) {
      const kept = row.flatMap((nodeId) => {
        const node = left.get(nodeId);
        left.delete(nodeId);
        return node ? [node] : [];
      });
      if (kept.length) rows.push(kept);
    }
    if (left.size) rows.push([...left.values()]);
    arranged.set(id, rows);
    nodesOf.set(id, rows.flat());
  }
  const sizes = new Map(spec.nodes.map((n) => [n.id, nodeSize(n, measure)]));
  const inLane = (lane: LaneId) => spec.containers.filter((c) => c.lane === lane);

  // -- neighbours joined by a reference get a straight line and room for its label
  const wishGap = new Map<string, number>(); // by the node on the left
  const neighbourEdges: [GEdge, string][] = [];
  for (const edge of spec.edges) {
    if (edge.kind !== "reference") continue;
    const a = nodeById.get(edge.from);
    const b = nodeById.get(edge.to);
    if (!a || !b || a.container !== b.container) continue;
    const siblings = nodesOf.get(a.container) ?? [];
    const i = siblings.indexOf(a);
    const j = siblings.indexOf(b);
    if (Math.abs(i - j) !== 1) continue;
    const leftId = siblings[Math.min(i, j)].id;
    neighbourEdges.push([edge, leftId]);
    const room = (edge.label ? measure(edge.label) + 12 : 0) + 28;
    wishGap.set(leftId, Math.max(wishGap.get(leftId) ?? NODE_GAP, room));
  }
  const gapAfter = (node: GNode) => wishGap.get(node.id) ?? NODE_GAP;

  // -- inside a container: nodes on one or more rows
  const nodeRows = new Map<string, GNode[][]>();
  const containerWidth = new Map<string, number>();
  const rowWidth = (row: GNode[]) =>
    row.reduce((sum, node, i) => sum + sizes.get(node.id)!.w + (i < row.length - 1 ? gapAfter(node) : 0), 0);
  const measureContainer = (container: GContainer, room: number) => {
    const rows =
      arranged.get(container.id) ??
      wrap(nodesOf.get(container.id) ?? [], (n) => sizes.get(n.id)!.w, gapAfter, room - 2 * PAD);
    nodeRows.set(container.id, rows);
    const title = measure(container.title, true) + measure(container.subtitle ?? "") + (container.action ? 48 : 30);
    containerWidth.set(container.id, Math.round(Math.max(2 * PAD + Math.max(...rows.map(rowWidth)), title, 120)));
  };
  // What belongs to other models stands in a band at the side, one below the
  // other in its lane; the model itself wraps in the room that is left.
  const beside = options.inline ? [] : spec.containers.filter((c) => c.proxy);
  const isBeside = (id: string) => beside.some((c) => c.id === id);
  const aside = (c: GContainer) => isBeside(c.id);
  for (const container of beside) measureContainer(container, content);
  const asideWidth = beside.length
    ? Math.max(...beside.map((c) => containerWidth.get(c.id)!)) + 2 * ASIDE_PAD + ASIDE_NAME
    : 0;
  const room = content - (beside.length ? asideWidth + ASIDE_GAP : 0);
  for (const container of spec.containers) if (!aside(container)) measureContainer(container, room);

  // -- inside a lane: containers on one or more shelves
  const anchorOrder = (lane: LaneId) => {
    const position = new Map(spec.containers.map((c, i) => [c.id, i]));
    const wish = (id: string) => {
      const anchors = containerOf.get(id)!.anchors.filter((a) => position.has(a));
      if (!anchors.length) return Number.POSITIVE_INFINITY;
      return anchors.reduce((sum, a) => sum + position.get(a)!, 0) / anchors.length;
    };
    const list = inLane(lane).filter((c) => !aside(c));
    return lane === "O0" ? list : [...list].sort((a, b) => wish(a.id) - wish(b.id) || (a.id < b.id ? -1 : 1));
  };
  const shelves = new Map<LaneId, string[][]>();
  let wrapped = false;
  for (const lane of lanes) {
    const ids = anchorOrder(lane).map((c) => c.id);
    const own = ids.length ? wrap(ids, (id) => containerWidth.get(id)!, () => CONTAINER_GAP, room) : [];
    wrapped ||= own.length > 1;
    shelves.set(lane, own);
  }

  // -- rows of nodes: the grid the connectors are routed on
  interface RowInfo {
    lane: LaneId;
    first: boolean; // a container starts on this row: its title sits above it
    nodes: string[];
    y: number;
    h: number;
  }
  const rows: RowInfo[] = [];
  const firstRow = new Map<string, number>(); // by container
  const lastRow = new Map<string, number>();
  const rowOfNode = new Map<string, number>();
  const bandRows: Record<string, number> = {};
  for (const lane of lanes) {
    for (const shelf of shelves.get(lane)!) {
      const depth = Math.max(...shelf.map((id) => nodeRows.get(id)!.length));
      const base = rows.length;
      for (let r = 0; r < depth; r++) rows.push({ lane, first: r === 0, nodes: [], y: 0, h: 0 });
      for (const id of shelf) {
        const own = nodeRows.get(id)!;
        firstRow.set(id, base);
        lastRow.set(id, base + own.length - 1);
        own.forEach((row, r) => row.forEach((node) => rowOfNode.set(node.id, base + r)));
      }
    }
    // What stands in the band shares the rows of its lane: each container next
    // to the elements of the model it is linked to, or where the modeler put
    // it, one below the other. The lane is as tall as the taller of the two.
    const side = inLane(lane).filter(aside).map((c) => c.id);
    if (!side.length) continue;
    const start = rows.findIndex((row) => row.lane === lane);
    const laneBase = start === -1 ? rows.length : start;
    const ownRows = rows.length - laneBase;
    const holder = (end: string) => nodeById.get(end)?.container ?? end;
    const items = side.map((id, index) => {
      const linked: number[] = [];
      for (const edge of spec.edges) {
        const other = holder(edge.from) === id ? edge.to : holder(edge.to) === id ? edge.from : null;
        const row = other === null ? undefined : rowOfNode.get(other);
        if (row !== undefined && row >= laneBase && !isBeside(holder(other!))) linked.push(row - laneBase);
      }
      const chosen = options.band?.[id];
      const wanted =
        chosen !== undefined && Number.isFinite(chosen)
          ? Math.max(0, Math.round(chosen))
          : linked.length
            ? Math.round(linked.reduce((sum, row) => sum + row, 0) / linked.length)
            : 0;
      return { id, index, depth: nodeRows.get(id)!.length, wanted, chosen: chosen !== undefined };
    });
    const need = items.reduce((sum, item) => sum + item.depth, 0);
    // a container can be put one row past the end of the lane, which then grows
    let total = Math.max(ownRows, need);
    for (const item of items) {
      item.wanted = Math.min(item.wanted, item.chosen ? total : total - item.depth);
    }
    total = Math.max(total, ...items.filter((item) => item.chosen).map((item) => item.wanted + item.depth));
    items.sort((a, b) => a.wanted - b.wanted || Number(b.chosen) - Number(a.chosen) || a.index - b.index);
    const starts: number[] = [];
    let free = 0;
    for (const item of items) {
      starts.push(Math.max(item.wanted, free));
      free = starts[starts.length - 1] + item.depth;
    }
    // those pushed past the end move up, with the ones above them, as far as needed
    let limit = Math.max(total, need);
    for (let i = items.length - 1; i >= 0; i--) {
      starts[i] = Math.min(starts[i], limit - items[i].depth);
      limit = starts[i];
    }
    for (let r = ownRows; r < total; r++) rows.push({ lane, first: false, nodes: [], y: 0, h: 0 });
    items.forEach((item, i) => {
      const first = laneBase + starts[i];
      firstRow.set(item.id, first);
      lastRow.set(item.id, first + item.depth - 1);
      nodeRows.get(item.id)!.forEach((row, r) => row.forEach((node) => rowOfNode.set(node.id, first + r)));
      rows[first].first = true;
      bandRows[item.id] = starts[i];
    });
  }

  // -- horizontal placement
  const containers: Record<string, Rect> = {};
  const left = GUTTER + SIDE;
  if (!wrapped) {
    // Nothing wraps: O0 and data share one column per DT, types sit above their instances.
    let cursor = left;
    for (const instance of inLane("O0")) {
      if (aside(instance)) continue;
      const data = inLane("data").find((d) => d.anchors.includes(instance.id));
      const own = containerWidth.get(instance.id)!;
      const below = data ? containerWidth.get(data.id)! : 0;
      const column = Math.max(own, below);
      containers[instance.id] = { x: cursor + (column - own) / 2, y: 0, w: own, h: 0 };
      if (data) containers[data.id] = { x: cursor + (column - below) / 2, y: 0, w: below, h: 0 };
      cursor += column + CONTAINER_GAP;
    }
    for (const data of inLane("data")) {
      if (containers[data.id]) continue;
      containers[data.id] = { x: cursor, y: 0, w: containerWidth.get(data.id)!, h: 0 };
      cursor += containerWidth.get(data.id)! + CONTAINER_GAP;
    }
    for (const lane of ["O1", "O2"] as LaneId[]) {
      const wish = (id: string) => {
        const anchors = containerOf.get(id)!.anchors.filter((a) => containers[a]);
        if (!anchors.length) return Number.POSITIVE_INFINITY;
        return anchors.reduce((sum, a) => sum + centre(containers[a]), 0) / anchors.length;
      };
      const ordered = inLane(lane)
        .filter((c) => !aside(c))
        .sort((a, b) => wish(a.id) - wish(b.id) || (a.id < b.id ? -1 : 1));
      let x = left;
      for (const container of ordered) {
        const w = containerWidth.get(container.id)!;
        const wanted = wish(container.id);
        const at = Number.isFinite(wanted) ? Math.max(x, wanted - w / 2) : x;
        containers[container.id] = { x: Math.round(at), y: 0, w, h: 0 };
        x = at + w + CONTAINER_GAP;
      }
    }
  } else {
    // Shelves are centred on the widest one.
    const ownOf = (shelf: string[]) => shelf.filter((id) => !isBeside(id));
    const shelfWidth = (shelf: string[]) =>
      ownOf(shelf).reduce((sum, id) => sum + containerWidth.get(id)!, 0) + (ownOf(shelf).length - 1) * CONTAINER_GAP;
    const widest = Math.max(...[...shelves.values()].flat().map(shelfWidth));
    for (const lane of lanes) {
      for (const shelf of shelves.get(lane)!) {
        let x = left + (widest - shelfWidth(shelf)) / 2;
        for (const id of ownOf(shelf)) {
          containers[id] = { x: Math.round(x), y: 0, w: containerWidth.get(id)!, h: 0 };
          x += containerWidth.get(id)! + CONTAINER_GAP;
        }
      }
    }
  }
  const asideX = beside.length
    ? Math.max(...Object.values(containers).map((r) => r.x + r.w), left + 120) + ASIDE_GAP
    : 0;
  for (const container of beside) {
    const w = containerWidth.get(container.id)!;
    containers[container.id] = { x: Math.round(asideX + ASIDE_PAD + (asideWidth - 2 * ASIDE_PAD - ASIDE_NAME - w) / 2), y: 0, w, h: 0 };
  }
  let width = Math.max(...Object.values(containers).map((r) => r.x + r.w), left + 200, asideX + asideWidth) + SIDE + MARGIN;

  const nodes: Record<string, Rect> = {};
  const neighbourOnRight = new Map<string, string>(); // left node -> the node next to it on the same row
  for (const container of spec.containers) {
    const frame = containers[container.id];
    nodeRows.get(container.id)!.forEach((row) => {
      let x = frame.x + PAD + (frame.w - 2 * PAD - rowWidth(row)) / 2;
      row.forEach((node, index) => {
        const size = sizes.get(node.id)!;
        nodes[node.id] = { x: Math.round(x), y: 0, ...size };
        rows[rowOfNode.get(node.id)!].nodes.push(node.id);
        if (index < row.length - 1) neighbourOnRight.set(node.id, row[index + 1].id);
        x += size.w + gapAfter(node);
      });
    });
  }
  for (const row of rows) row.nodes.sort((a, b) => nodes[a].x - nodes[b].x);
  const rectOf = (id: string): Rect => nodes[id] ?? containers[id];
  const spanOf = (id: string): [number, number] => {
    const row = rowOfNode.get(id);
    return row !== undefined ? [row, row] : [firstRow.get(id)!, lastRow.get(id)!];
  };

  // A reference between neighbours stays a straight line only if wrapping kept them side by side.
  const directPairs = new Map<string, GEdge[]>();
  for (const [edge, leftId] of neighbourEdges) {
    const other = edge.from === leftId ? edge.to : edge.from;
    if (neighbourOnRight.get(leftId) === other) directPairs.set(leftId, [...(directPairs.get(leftId) ?? []), edge]);
  }
  const directIds = new Set([...directPairs.values()].flat().map((e) => e.id));

  // -- plans: which sides and which gaps every connector uses
  const busSize = new Map<string, number>();
  for (const edge of spec.edges) {
    if (edge.bus) busSize.set(`${edge.kind}>${edge.to}`, (busSize.get(`${edge.kind}>${edge.to}`) ?? 0) + 1);
  }
  const range = (from: number, to: number) => {
    const out: number[] = [];
    for (let g = from; from <= to ? g <= to : g >= to; g += from <= to ? 1 : -1) out.push(g);
    return out;
  };
  const plans: Plan[] = [];
  for (const edge of spec.edges) {
    if (!rectOf(edge.from) || !rectOf(edge.to)) continue;
    const [aFirst, aLast] = spanOf(edge.from);
    const [bFirst, bLast] = spanOf(edge.to);
    const bus = `${edge.kind}>${edge.to}`;
    const shared = edge.bus && (busSize.get(bus) ?? 0) >= 3 && Math.abs(aLast - bFirst) === 1 && aFirst > bLast;
    const plan: Plan = {
      edge,
      connector: shared ? bus : edge.id,
      from: edge.from,
      to: edge.to,
      fromSide: "bottom",
      toSide: "bottom",
      gaps: [],
      direct: directIds.has(edge.id),
    };
    if (plan.direct) {
      // drawn from side to side
    } else if (aLast < bFirst) {
      plan.toSide = "top";
      plan.gaps = range(aLast + 1, bFirst);
    } else if (bLast < aFirst) {
      plan.fromSide = "top";
      plan.gaps = range(aFirst, bLast + 1);
    } else {
      // Same rows: out of the bottom of both, joined in the gap below the lower one.
      plan.gaps = aLast <= bLast ? range(aLast + 1, bLast + 1) : [aLast + 1, ...range(aLast, bLast + 1)];
    }
    plans.push(plan);
  }

  // -- ports: every connector has its own point on a side, ordered by its other end
  const nudges = new Map<string, number>();
  const portX = new Map<string, number>();
  const portKey = (plan: Plan, which: "from" | "to") => {
    const end = plan[which];
    const side = which === "from" ? plan.fromSide : plan.toSide;
    const key = which === "to" && plan.connector !== plan.edge.id ? plan.connector : plan.edge.id;
    // A relation of an element with itself leaves and comes back on the same side: two points, a loop.
    return `${end}|${side}|${key}${plan.from === plan.to ? `>${which}` : ""}`;
  };
  const assignPorts = () => {
    const sides = new Map<string, { key: string; other: number }[]>();
    for (const plan of plans) {
      if (plan.direct) continue;
      for (const which of ["from", "to"] as const) {
        const slot = portKey(plan, which);
        const side = slot.slice(0, slot.lastIndexOf("|"));
        const list = sides.get(side) ?? [];
        if (!list.some((p) => p.key === slot)) {
          list.push({ key: slot, other: centre(rectOf(which === "from" ? plan.to : plan.from)) });
        }
        sides.set(side, list);
      }
    }
    for (const [side, list] of sides) {
      const rect = rectOf(side.split("|")[0]);
      list.sort((a, b) => a.other - b.other || (a.key < b.key ? -1 : 1));
      const step = Math.min(PORT_STEP, (rect.w - 20) / Math.max(1, list.length));
      list.forEach((port, index) => {
        const x = centre(rect) + (index - (list.length - 1) / 2) * step + (nudges.get(port.key) ?? 0);
        portX.set(port.key, Math.min(rect.x + rect.w - 6, Math.max(rect.x + 6, x)));
      });
    }
  };
  const portOf = (plan: Plan, which: "from" | "to") =>
    portX.get(portKey(plan, which)) ?? centre(rectOf(plan[which]));

  // -- channels: the free space of a row, between its nodes
  const intervalsOf = (row: number): [number, number][] => {
    const taken = rows[row].nodes.map((id) => nodes[id]);
    const out: [number, number][] = [];
    let from = GUTTER + 4;
    for (const rect of taken) {
      out.push([from, rect.x]);
      from = rect.x + rect.w;
    }
    out.push([from, width - 8]);
    return out.filter(([lo, hi]) => hi - lo >= 20);
  };
  const framesIn = (row: number) =>
    spec.containers.filter((c) => firstRow.get(c.id)! <= row && row <= lastRow.get(c.id)!).map((c) => c.id);

  // -- vertical lines: every one has an x of its own in the gaps it touches
  //
  // A port touches the gap its side faces; a connector crossing a row touches
  // the gaps above and below it. Two lines of different connectors that touch
  // the same gap are kept apart, so they can never share a stretch.
  const CLEAR = 5;
  const gapOfPort = (plan: Plan, which: "from" | "to") => {
    const [first, last] = spanOf(plan[which]);
    return (which === "from" ? plan.fromSide : plan.toSide) === "top" ? first : last + 1;
  };

  let result: Layout = { width, height: 0, lanes: [], containers, nodes, edges: [], rows: {}, grid: {}, band: {} };
  for (let attempt = 0; attempt < 6; attempt++) {
    assignPorts();
    const taken = new Map<number, { x: number; connector: string }[]>();
    const isFree = (x: number, gaps: number[], connector: string) =>
      gaps.every((gap) =>
        (taken.get(gap) ?? []).every((line) => line.connector === connector || Math.abs(line.x - x) >= CLEAR),
      );
    const take = (x: number, gaps: number[], connector: string) => {
      for (const gap of gaps) taken.set(gap, [...(taken.get(gap) ?? []), { x, connector }]);
    };
    /** The free x closest to `wanted` within [lo, hi], or null. */
    const freeNear = (wanted: number, lo: number, hi: number, gaps: number[], connector: string) => {
      const start = Math.min(hi, Math.max(lo, wanted));
      for (let offset = 0; offset <= hi - lo; offset += 1) {
        for (const x of offset === 0 ? [start] : [start + offset, start - offset]) {
          if (x >= lo && x <= hi && isFree(x, gaps, connector)) return x;
        }
      }
      return null;
    };

    // Ports first: they can only move along the side of their node.
    const seenPorts = new Set<string>();
    for (const plan of plans) {
      if (plan.direct) continue;
      for (const which of ["from", "to"] as const) {
        const key = portKey(plan, which);
        if (seenPorts.has(key)) continue;
        seenPorts.add(key);
        const rect = rectOf(plan[which]);
        const connector = which === "to" ? plan.connector : plan.edge.id;
        const gaps = [gapOfPort(plan, which)];
        const x = freeNear(portX.get(key)!, rect.x + 6, rect.x + rect.w - 6, gaps, connector) ?? portX.get(key)!;
        portX.set(key, x);
        take(x, gaps, connector);
        // the line a connector shares with its bus is also its own
        if (connector !== plan.edge.id) take(x, gaps, plan.edge.id);
      }
    }

    // Waypoints (x only): source port, one free space per crossed row, target port.
    const waypoints = new Map<string, number[]>();
    const crowd = new Map<string, number>();
    let starved = false;
    const longestLast = [...plans].sort((p, q) => p.gaps.length - q.gaps.length);
    for (const plan of longestLast) {
      if (plan.direct) continue;
      const target = portOf(plan, "to");
      const xs = [portOf(plan, "from")];
      for (let i = 0; i < plan.gaps.length - 1; i++) {
        const row = Math.min(plan.gaps[i], plan.gaps[i + 1]);
        const touched = [row, row + 1];
        const previous = xs[xs.length - 1];
        const own = new Set([plan.from, plan.to, nodeById.get(plan.from)?.container, nodeById.get(plan.to)?.container]);
        const foreign = framesIn(row).filter((id) => !own.has(id)).map((id) => containers[id]);
        let best: { x: number; cost: number; slot: number } | null = null;
        intervalsOf(row).forEach(([lo, hi], slot) => {
          const x = freeNear(previous, lo + 8, hi - 8, touched, plan.edge.id);
          if (x === null) return;
          const inside = foreign.some((r) => x > r.x && x < r.x + r.w);
          const cost =
            Math.abs(x - previous) +
            0.4 * Math.abs(x - target) +
            (inside ? 160 : 0) +
            12 * (crowd.get(`${row}|${slot}`) ?? 0);
          if (!best || cost < best.cost) best = { x, cost, slot };
        });
        const chosen = best as { x: number; slot: number } | null;
        // No free line left in this row: share one, but never run through a node.
        const spaces = intervalsOf(row).map(([lo, hi]) => Math.min(hi - 8, Math.max(lo + 8, previous)));
        const nearest = spaces.reduce((a, b) => (Math.abs(b - previous) < Math.abs(a - previous) ? b : a), spaces[0]);
        const x = chosen?.x ?? nearest ?? previous;
        if (!chosen) starved = true;
        if (chosen) crowd.set(`${row}|${chosen.slot}`, (crowd.get(`${row}|${chosen.slot}`) ?? 0) + 1);
        take(x, touched, plan.edge.id);
        xs.push(x);
      }
      xs.push(target);
      waypoints.set(plan.edge.id, xs);
    }

    if (starved && attempt < 5) {
      // A row had no free line left: make room at the side and route again.
      width += 48;
      continue;
    }

    // Tracks: one per connector in every gap it runs through.
    const runs = new Map<number, Run[]>();
    for (const plan of plans) {
      if (plan.direct) continue;
      const xs = waypoints.get(plan.edge.id)!;
      plan.gaps.forEach((gap, index) => {
        const last = index === plan.gaps.length - 1;
        const connector = last ? plan.connector : plan.edge.id;
        const [a, b] = [xs[index], xs[index + 1]];
        if (Math.abs(a - b) < 0.5 && connector === plan.edge.id) return; // straight: no run
        runs.set(gap, [...(runs.get(gap) ?? []), { connector, x1: Math.min(a, b), x2: Math.max(a, b) }]);
      });
    }
    const tracks = new Map<number, Map<string, number>>();
    const trackTop: number[] = [];

    // Vertical positions. A gap holds, from the top: the padding below the
    // frames that end there, the tracks, and the titles of the frames that start.
    let y = MARGIN;
    for (let gap = 0; gap <= rows.length; gap++) {
      const assigned = assignTracks(runs.get(gap) ?? []);
      tracks.set(gap, assigned);
      const count = Math.max(0, ...[...assigned.values()].map((t) => t + 1));
      const opens = gap < rows.length && rows[gap].first;
      if (gap > 0) y += PAD;
      trackTop[gap] = y + 9;
      const zone = count ? 18 + (count - 1) * TRACK : 0;
      if (gap > 0) y += Math.max(zone, gap === rows.length ? 0 : opens ? 18 : 8);
      if (gap === rows.length) break;
      if (opens) y += TITLE + PAD;
      const row = rows[gap];
      row.y = y;
      row.h = Math.max(HEADER, ...row.nodes.map((id) => nodes[id].h));
      for (const id of row.nodes) nodes[id].y = y;
      y += row.h;
    }
    const height = y + MARGIN;
    for (const container of spec.containers) {
      const top = rows[firstRow.get(container.id)!];
      const bottom = rows[lastRow.get(container.id)!];
      containers[container.id].y = top.y - TITLE - PAD;
      containers[container.id].h = bottom.y + bottom.h + PAD - containers[container.id].y;
    }
    const laneRects: LLane[] = lanes.map((lane) => {
      const frames = inLane(lane).map((c) => containers[c.id]);
      const top = Math.min(...frames.map((r) => r.y));
      return { id: lane, y: top, h: Math.max(...frames.map((r) => r.y + r.h)) - top };
    });
    const trackY = (gap: number, connector: string) => trackTop[gap] + (tracks.get(gap)?.get(connector) ?? 0) * TRACK;

    const edges: LEdge[] = [];
    const arrowed = new Set<string>();
    for (const plan of plans) {
      const a = rectOf(plan.from);
      const b = rectOf(plan.to);
      let points: Point[];
      if (plan.direct) {
        const pair = directPairs.get(a.x < b.x ? plan.from : plan.to) ?? [];
        const lineY = a.y + 16 + pair.indexOf(plan.edge) * 9;
        points = a.x < b.x ? [[a.x + a.w, lineY], [b.x, lineY]] : [[a.x, lineY], [b.x + b.w, lineY]];
      } else {
        const xs = waypoints.get(plan.edge.id)!;
        const sideY = (r: Rect, side: string) => (side === "top" ? r.y : r.y + r.h);
        points = [[xs[0], sideY(a, plan.fromSide)]];
        plan.gaps.forEach((gap, index) => {
          const last = index === plan.gaps.length - 1;
          const [from, to] = [xs[index], xs[index + 1]];
          if (Math.abs(from - to) < 0.5 && !(last && plan.connector !== plan.edge.id)) return;
          const lineY = trackY(gap, last ? plan.connector : plan.edge.id);
          points.push([from, lineY], [to, lineY]);
        });
        // A jog too short to draw was left out: the line goes on straight, to the same x.
        const [endX, lastX] = [xs[xs.length - 1], points[points.length - 1][0]];
        points.push([Math.abs(endX - lastX) < 0.5 ? lastX : endX, sideY(b, plan.toSide)]);
      }
      const arrow = !arrowed.has(plan.connector);
      arrowed.add(plan.connector);
      edges.push({ id: plan.edge.id, connector: plan.connector, points: simplify(points), arrow });
    }

    result = {
      width,
      height,
      lanes: laneRects,
      containers,
      nodes,
      edges,
      rows: Object.fromEntries([...nodeRows].map(([id, own]) => [id, own.map((row) => row.map((node) => node.id))])),
      grid: Object.fromEntries(lanes.map((lane) => [lane, rows.filter((row) => row.lane === lane).map(({ y, h }) => ({ y, h }))])),
      band: bandRows,
    };
    if (beside.length) {
      const frames = beside.map((c) => containers[c.id]);
      const top = Math.min(...frames.map((r) => r.y)) - ASIDE_PAD;
      const bottom = Math.max(...frames.map((r) => r.y + r.h)) + ASIDE_PAD;
      result.aside = { x: asideX, y: top, w: asideWidth, h: bottom - top };
    }
    const clashes = clashesOf(result);
    if (!clashes.length) break;
    // Safety net: if two connectors still share a stretch, move a port and retry.
    for (const clash of clashes) {
      const plan = plans.find((p) => p.edge.id === clash.second && !p.direct);
      if (!plan || !clash.vertical) continue;
      const key = portKey(plan, attempt % 2 === 0 ? "from" : "to");
      nudges.set(key, (nudges.get(key) ?? 0) + NUDGE);
    }
  }

  placeLabels(result, spec, measure);
  // Too narrow for a band at the side: the other models go below, among the rest.
  if (beside.length && options.width && result.width > options.width + 96) return layout(spec, { ...options, inline: true });
  return result;
}

/**
 * The layout that shows largest in a canvas of the given size: the width to
 * wrap at is chosen so that the diagram uses the height available too.
 */
export function layoutToFit(
  spec: GraphSpec,
  size: { width: number; height: number },
  options: LayoutOptions = {},
  maxScale = 1.25,
): Layout {
  const scaleOf = (candidate: Layout) =>
    Math.min(maxScale, (size.width - 32) / candidate.width, (size.height - 32) / candidate.height);
  let best = layout(spec, options);
  for (const scale of [1.25, 1.1, 1, 0.9, 0.8, 0.7, 0.6, 0.5]) {
    const candidate = layout(spec, { ...options, width: (size.width - 32) / scale });
    // The band at the side is kept whenever a width allows it: it is what tells the other models apart.
    if (Boolean(candidate.aside) !== Boolean(best.aside)) {
      if (candidate.aside) best = candidate;
      continue;
    }
    if (scaleOf(candidate) > scaleOf(best) + 0.005) best = candidate;
  }
  return best;
}

// -- labels: above the lines, on the candidate position that covers the least

function placeLabels(result: Layout, spec: GraphSpec, measure: (text: string) => number): void {
  const byId = new Map(spec.edges.map((e) => [e.id, e]));
  const placed: Rect[] = [];
  const labelled = new Set<string>();
  const verticals = result.edges.flatMap((edge) =>
    segmentsOf(edge).filter((s) => s.vertical).map((s) => ({ ...s, connector: edge.connector })),
  );
  const nodeRects = Object.values(result.nodes);
  for (const edge of result.edges) {
    const text = byId.get(edge.id)?.label;
    if (!text) continue;
    const key = `${edge.connector}|${text}`;
    if (labelled.has(key)) continue;
    labelled.add(key);
    const w = Math.round(measure(text) + 12);
    const segments = segmentsOf(edge);
    // Every stretch of the line is a place for its label, the longest first:
    // the first candidate that covers the least is kept.
    const candidates: Rect[] = [];
    for (const horizontal of segments.filter((s) => !s.vertical).sort((a, b) => b.length - a.length)) {
      if (horizontal.length < 24) continue;
      for (const fraction of [0.5, 0.3, 0.7, 0.15, 0.85]) {
        const cx = horizontal.from + (horizontal.to - horizontal.from) * fraction;
        candidates.push({ x: cx - w / 2, y: horizontal.at - LABEL_H / 2, w, h: LABEL_H });
      }
    }
    for (const vertical of segments.filter((s) => s.vertical).sort((a, b) => b.length - a.length)) {
      for (const fraction of [0.5, 0.3, 0.7]) {
        const cy = vertical.from + (vertical.to - vertical.from) * fraction;
        candidates.push({ x: vertical.at + 5, y: cy - LABEL_H / 2, w, h: LABEL_H });
        candidates.push({ x: vertical.at - 5 - w, y: cy - LABEL_H / 2, w, h: LABEL_H });
      }
    }
    if (!candidates.length) continue;
    const cost = (rect: Rect) =>
      1000 * placed.filter((other) => rectsOverlap(rect, other)).length +
      1000 * nodeRects.filter((other) => rectsOverlap(rect, other)).length +
      verticals.filter(
        (s) =>
          s.connector !== edge.connector &&
          s.at > rect.x && s.at < rect.x + rect.w && s.to > rect.y && s.from < rect.y + rect.h,
      ).length;
    const best = candidates.reduce((a, b) => (cost(b) < cost(a) ? b : a));
    edge.label = { ...best, text };
    placed.push(best);
  }
}

// -- geometry, shared with the tests ----------------------------------------

export interface Segment {
  vertical: boolean;
  at: number; // x of a vertical segment, y of a horizontal one
  from: number;
  to: number;
  length: number;
}

export function segmentsOf(edge: LEdge): Segment[] {
  const out: Segment[] = [];
  for (let i = 0; i < edge.points.length - 1; i++) {
    const [x1, y1] = edge.points[i];
    const [x2, y2] = edge.points[i + 1];
    const vertical = Math.abs(x1 - x2) < 0.01;
    const [from, to] = vertical ? [Math.min(y1, y2), Math.max(y1, y2)] : [Math.min(x1, x2), Math.max(x1, x2)];
    out.push({ vertical, at: vertical ? x1 : y1, from, to, length: to - from });
  }
  return out;
}

export function rectsOverlap(a: Rect, b: Rect, slack = 0): boolean {
  return a.x < b.x + b.w - slack && b.x < a.x + a.w - slack && a.y < b.y + b.h - slack && b.y < a.y + a.h - slack;
}

interface Clash {
  first: string;
  second: string;
  vertical: boolean;
  at: number;
}

function clashesOf(result: Layout): Clash[] {
  const all = result.edges.flatMap((edge) => segmentsOf(edge).map((s) => ({ ...s, edge })));
  const out: Clash[] = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      if (a.edge.connector === b.edge.connector || a.vertical !== b.vertical) continue;
      if (Math.abs(a.at - b.at) > 3) continue;
      if (Math.min(a.to, b.to) - Math.max(a.from, b.from) > 1) {
        out.push({ first: a.edge.id, second: b.edge.id, vertical: b.vertical, at: b.at });
      }
    }
  }
  return out;
}

/** Pairs of connectors that share a stretch of line. */
export function collinearOverlaps(result: Layout): [string, string][] {
  return clashesOf(result).map((clash) => [clash.first, clash.second]);
}

/** Connectors that run through a node (the nodes they attach to excluded). */
export function edgesThroughNodes(result: Layout): [string, string][] {
  const out: [string, string][] = [];
  for (const edge of result.edges) {
    for (const segment of segmentsOf(edge)) {
      for (const [id, r] of Object.entries(result.nodes)) {
        const inside = segment.vertical
          ? segment.at > r.x + 1 && segment.at < r.x + r.w - 1 && segment.to > r.y + 1 && segment.from < r.y + r.h - 1
          : segment.at > r.y + 1 && segment.at < r.y + r.h - 1 && segment.to > r.x + 1 && segment.from < r.x + r.w - 1;
        if (inside) out.push([edge.id, id]);
      }
    }
  }
  return out;
}

export function overlappingNodes(result: Layout): [string, string][] {
  const out: [string, string][] = [];
  for (const group of [result.nodes, result.containers]) {
    const entries = Object.entries(group);
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        if (rectsOverlap(entries[i][1], entries[j][1])) out.push([entries[i][0], entries[j][0]]);
      }
    }
  }
  return out;
}

/** Labels that cover a node or another label. */
export function labelCollisions(result: Layout): [string, string][] {
  const labels = result.edges.filter((e) => e.label).map((e) => [e.id, e.label as Rect] as const);
  const out: [string, string][] = [];
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      if (rectsOverlap(labels[i][1], labels[j][1])) out.push([labels[i][0], labels[j][0]]);
    }
    for (const [id, rect] of Object.entries(result.nodes)) {
      if (rectsOverlap(labels[i][1], rect)) out.push([labels[i][0], id]);
    }
  }
  return out;
}
