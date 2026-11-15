/**
 * Rearranging a diagram by hand, as pure functions.
 *
 * Connectors are routed on rows of nodes, so a node is not dropped anywhere:
 * it is moved to a place among the nodes of its container, on one of its rows
 * or on a row of its own, and the layout draws the diagram again around it.
 */
import { type GContainer, type GraphSpec } from "./graph";
import { type Layout, type Rect } from "./layout";

/** The rows of nodes chosen for containers, by container id. */
export type Arrangement = Record<string, string[][]>;
/** The row of its lane chosen for a container of the band at the side, by container id. */
export type Band = Record<string, number>;
/** What a modeler arranged by hand in a diagram. */
export interface Manual {
  rows: Arrangement;
  band: Band;
}
export const NO_MANUAL: Manual = { rows: {}, band: {} };
export const isManual = (manual: Manual | undefined) =>
  Boolean(manual && (Object.keys(manual.rows).length || Object.keys(manual.band).length));

export interface Drop {
  container: string;
  /** Among the rows of the container without the node that moves. */
  row: number;
  /** Where on that row; 0 when `fresh`. */
  index: number;
  /** On a row of its own, placed before `row`. */
  fresh: boolean;
  /** Where the node will go, to show while it is dragged. */
  marker: Rect;
}

const MARK = 4; // thickness of the marker
const REACH = 10; // how far above and below a row still counts as that row

/** The rows of a container without `node`; a row that held nothing else is gone. */
export function rowsWithout(rows: string[][], node: string): string[][] {
  return rows.map((row) => row.filter((id) => id !== node)).filter((row) => row.length);
}

/** `node` moved to `drop`: on a row among the others, or on a row of its own. */
export function moveNode(rows: string[][], node: string, drop: Pick<Drop, "row" | "index" | "fresh">): string[][] {
  const base = rowsWithout(rows, node);
  const at = Math.min(Math.max(drop.row, 0), base.length);
  if (drop.fresh || at === base.length) return [...base.slice(0, at), [node], ...base.slice(at)];
  const index = Math.min(Math.max(drop.index, 0), base[at].length);
  return base.map((row, r) => (r === at ? [...row.slice(0, index), node, ...row.slice(index)] : row));
}

export const sameRows = (a: string[][], b: string[][]) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Where `node` would go if dropped at `point` (in diagram coordinates): among
 * the nodes of its own container, which it cannot leave. Null for a node that
 * is not in the layout.
 */
export function dropTarget(result: Layout, spec: GraphSpec, node: string, point: { x: number; y: number }): Drop | null {
  const container = spec.nodes.find((n) => n.id === node)?.container;
  const frame = container ? result.containers[container] : undefined;
  if (!container || !frame || !result.nodes[node]) return null;
  const base = rowsWithout(result.rows[container] ?? [], node);
  const across = (y: number): Rect => ({ x: frame.x + 6, y: y - MARK / 2, w: frame.w - 12, h: MARK });
  if (!base.length) return { container, row: 0, index: 0, fresh: true, marker: across(result.nodes[node].y) };

  const bands = base.map((row) => {
    const rects = row.map((id) => result.nodes[id]);
    return { top: Math.min(...rects.map((r) => r.y)), bottom: Math.max(...rects.map((r) => r.y + r.h)) };
  });
  // Above the first row, below the last one, or in the gap between two: a row of its own.
  const first = bands[0];
  const last = bands[bands.length - 1];
  if (point.y < first.top - REACH) return { container, row: 0, index: 0, fresh: true, marker: across(first.top - 9) };
  if (point.y > last.bottom + REACH) {
    return { container, row: base.length, index: 0, fresh: true, marker: across(last.bottom + 9) };
  }
  for (let r = 0; r < bands.length; r++) {
    const next = bands[r + 1];
    const reach = next ? Math.min(REACH, (next.top - bands[r].bottom) / 3) : REACH;
    if (point.y <= bands[r].bottom + reach) {
      if (point.y < bands[r].top - (r ? Math.min(REACH, (bands[r].top - bands[r - 1].bottom) / 3) : REACH)) {
        return { container, row: r, index: 0, fresh: true, marker: across((bands[r - 1].bottom + bands[r].top) / 2) };
      }
      // on this row, before the first node whose middle is to the right of the pointer
      const rects = base[r].map((id) => result.nodes[id]);
      let index = rects.findIndex((rect) => point.x < rect.x + rect.w / 2);
      if (index === -1) index = rects.length;
      const before = rects[index - 1];
      const after = rects[index];
      const x = before && after ? (before.x + before.w + after.x) / 2 : after ? after.x - 9 : before.x + before.w + 9;
      return {
        container,
        row: r,
        index,
        fresh: false,
        marker: { x: x - MARK / 2, y: bands[r].top - 4, w: MARK, h: bands[r].bottom - bands[r].top + 8 },
      };
    }
  }
  return null;
}

/**
 * The row of its lane a container of the band would start on if dropped at
 * `point`: the row the pointer is nearest to, or one past the last, which
 * makes the lane taller. Null for a container that is not in the band.
 */
export function bandTarget(
  result: Layout,
  spec: GraphSpec,
  container: string,
  point: { x: number; y: number },
): { container: string; row: number } | null {
  const lane = spec.containers.find((c) => c.id === container)?.lane;
  const grid = lane ? result.grid[lane] : undefined;
  if (!lane || !grid?.length || result.band[container] === undefined) return null;
  const last = grid[grid.length - 1];
  if (point.y > last.y + last.h + 2 * REACH) return { container, row: grid.length };
  let row = 0;
  grid.forEach((line, index) => {
    const middle = (r: { y: number; h: number }) => r.y + r.h / 2;
    if (Math.abs(point.y - middle(line)) < Math.abs(point.y - middle(grid[row]))) row = index;
  });
  return { container, row };
}

// -- keeping an arrangement across versions ----------------------------------

/** A container by a name that does not change with the version of its model. */
function stableContainer(container: GContainer): string {
  if (container.proxy) return container.id;
  return `${container.lane}:${container.id.replace(/@data$/, "").split("@")[0]}`;
}

/** A node by its name inside its container. */
const stableNode = (id: string) => id.slice(id.indexOf("#") + 1);

/** What was arranged by hand, by names that outlive a version: what a browser keeps. */
export function toStable(spec: GraphSpec, manual: Manual): Manual {
  const rows: Arrangement = {};
  const band: Band = {};
  for (const container of spec.containers) {
    const own = manual.rows[container.id];
    if (own) rows[stableContainer(container)] = own.map((row) => row.map(stableNode));
    // a container of the band stands for another model: its id has no version in it
    if (manual.band[container.id] !== undefined) band[container.id] = manual.band[container.id];
  }
  return { rows, band };
}

/** What was kept by name, for the containers and nodes of this graph. */
export function fromStable(spec: GraphSpec, stable: Manual | undefined): Manual {
  const rows: Arrangement = {};
  const band: Band = {};
  for (const container of spec.containers) {
    if (stable?.band[container.id] !== undefined) band[container.id] = stable.band[container.id];
    const kept = stable?.rows[stableContainer(container)];
    if (!kept) continue;
    const ids = new Map(spec.nodes.filter((n) => n.container === container.id).map((n) => [stableNode(n.id), n.id]));
    const own = kept.map((row) => row.flatMap((name) => (ids.has(name) ? [ids.get(name)!] : []))).filter((row) => row.length);
    if (own.length) rows[container.id] = own;
  }
  return { rows, band };
}

/** What a browser kept, by model; anything it cannot read gives nothing. */
export function parseArrangements(text: string | null): Record<string, Manual> {
  const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every((v) => typeof v === "string");
  const record = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);
  const out: Record<string, Manual> = {};
  try {
    const data: unknown = JSON.parse(text ?? "");
    if (!record(data)) return out;
    for (const [model, kept] of Object.entries(data)) {
      if (!record(kept)) continue;
      // before the band could be arranged, a model kept its rows alone
      const rowsKept = "rows" in kept || "band" in kept ? kept.rows : kept;
      const manual: Manual = { rows: {}, band: {} };
      for (const [container, rows] of Object.entries(record(rowsKept) ? rowsKept : {})) {
        if (Array.isArray(rows) && rows.every(strings)) manual.rows[container] = rows;
      }
      for (const [container, row] of Object.entries(record(kept.band) ? kept.band : {})) {
        if (typeof row === "number" && Number.isFinite(row) && row >= 0) manual.band[container] = Math.round(row);
      }
      out[model] = manual;
    }
  } catch {
    // not JSON: nothing kept
  }
  return out;
}
