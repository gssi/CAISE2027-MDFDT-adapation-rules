/**
 * Moving the shapes of a diagram by hand: a node goes to another place among
 * the nodes of its container, and the layout keeps its promises around it.
 */
import { describe, expect, it } from "vitest";

import { type Federation } from "@/engine/federation";
import { checkCorrespondences } from "@/engine/weaving/checks";
import {
  NO_MANUAL,
  bandTarget,
  dropTarget,
  fromStable,
  isManual,
  moveNode,
  parseArrangements,
  rowsWithout,
  sameRows,
  toStable,
  type Arrangement,
} from "@/diagram/arrange";
import { EDGE_KINDS, buildGraph, type EdgeKind, type GraphSpec } from "@/diagram/graph";
import {
  collinearOverlaps,
  edgesThroughNodes,
  labelCollisions,
  layout,
  layoutToFit,
  overlappingNodes,
} from "@/diagram/layout";

import { afterA1, afterBind, baseline, HIDDEN_COUNT } from "./helpers";

const DEFAULT = new Set<EdgeKind>(EDGE_KINDS.filter((k) => k !== "typing"));
const focusGraph = (fed: Federation, focus: string): GraphSpec =>
  buildGraph(fed, null, DEFAULT, { statuses: checkCorrespondences(fed) }, { focus });
const plainGraph = (fed: Federation): GraphSpec =>
  buildGraph(fed, null, new Set(EDGE_KINDS), { statuses: checkCorrespondences(fed) });

describe("moving a node among the rows of its container", () => {
  const rows = [["a", "b", "c"], ["d"]];

  it("puts it on a row, where it is dropped", () => {
    expect(moveNode(rows, "a", { row: 0, index: 2, fresh: false })).toEqual([["b", "c", "a"], ["d"]]);
    expect(moveNode(rows, "c", { row: 1, index: 0, fresh: false })).toEqual([["a", "b"], ["c", "d"]]);
    // past the end of a row is its end
    expect(moveNode(rows, "b", { row: 1, index: 9, fresh: false })).toEqual([["a", "c"], ["d", "b"]]);
  });

  it("gives it a row of its own, above, between or below the others", () => {
    expect(moveNode(rows, "b", { row: 0, index: 0, fresh: true })).toEqual([["b"], ["a", "c"], ["d"]]);
    expect(moveNode(rows, "b", { row: 1, index: 0, fresh: true })).toEqual([["a", "c"], ["b"], ["d"]]);
    expect(moveNode(rows, "b", { row: 2, index: 0, fresh: true })).toEqual([["a", "c"], ["d"], ["b"]]);
  });

  it("drops the row a node leaves empty, and counts rows without the node that moves", () => {
    expect(rowsWithout(rows, "d")).toEqual([["a", "b", "c"]]);
    // `d` was alone on the second row: without it there is one row, and row 1 is past the end
    expect(moveNode(rows, "d", { row: 0, index: 1, fresh: false })).toEqual([["a", "d", "b", "c"]]);
    expect(moveNode(rows, "d", { row: 1, index: 0, fresh: false })).toEqual(rows);
  });

  it("changes nothing when a node is dropped where it was", () => {
    expect(sameRows(moveNode(rows, "b", { row: 0, index: 1, fresh: false }), rows)).toBe(true);
    expect(sameRows(moveNode(rows, "d", { row: 1, index: 0, fresh: true }), rows)).toBe(true);
  });
});

/** Arrangements to try on a graph: every container turned around, split in rows of one, put on one row. */
function arrangementsOf(spec: GraphSpec): [string, Arrangement][] {
  const base = layout(spec, { width: 1000 }).rows;
  const each = (change: (ids: string[]) => string[][]): Arrangement =>
    Object.fromEntries(Object.entries(base).map(([id, rows]) => [id, change(rows.flat())]));
  return [
    ["turned around", each((ids) => [[...ids].reverse()])],
    ["one node per row", each((ids) => ids.map((id) => [id]))],
    ["two rows, the first node last", each((ids) => (ids.length > 2 ? [ids.slice(1, 2), [...ids.slice(2), ids[0]]] : [ids]))],
  ];
}

const graphs: [string, () => GraphSpec][] = [
  ["Building alone", () => focusGraph(baseline(), "building")],
  ["Room 1 alone", () => focusGraph(baseline(), "room1")],
  ["Building alone, after A2", () => focusGraph(afterBind().federation(), "building")],
  ["Room 1 alone, after A1", () => focusGraph(afterA1(HIDDEN_COUNT).federation(), "room1")],
  ["the whole federation", () => plainGraph(baseline())],
];

describe.each(
  graphs.flatMap(([name, build]) => {
    const spec = build();
    return arrangementsOf(spec).flatMap(([how, arrangement]) =>
      ([undefined, 1400, 800] as const).map((width) => [`${name}, ${how}, ${width ?? "unlimited"}`, spec, arrangement, width] as const),
    );
  }),
)("layout of %s", (_, spec, arrangement, width) => {
  const result = layout(spec, { width, arrangement });

  it("stands the nodes on the rows it was given", () => {
    for (const [container, rows] of Object.entries(arrangement)) {
      expect(result.rows[container]).toEqual(rows);
      const ys = rows.map((row) => row.map((id) => result.nodes[id].y));
      // one height per row, rows from the top, nodes of a row from the left
      for (const row of ys) expect(new Set(row).size).toBe(1);
      for (let r = 1; r < ys.length; r++) expect(ys[r][0]).toBeGreaterThan(ys[r - 1][0]);
      for (const row of rows) {
        for (let i = 1; i < row.length; i++) expect(result.nodes[row[i]].x).toBeGreaterThan(result.nodes[row[i - 1]].x);
      }
    }
  });

  it("keeps the promises of the layout", () => {
    expect(Object.keys(result.nodes)).toHaveLength(spec.nodes.length);
    expect(result.edges).toHaveLength(spec.edges.length);
    expect(overlappingNodes(result)).toEqual([]);
    expect(collinearOverlaps(result)).toEqual([]);
    expect(edgesThroughNodes(result)).toEqual([]);
    expect(labelCollisions(result)).toEqual([]);
    for (const node of spec.nodes) {
      const n = result.nodes[node.id];
      const c = result.containers[node.container];
      expect(n.x >= c.x && n.x + n.w <= c.x + c.w && n.y >= c.y && n.y + n.h <= c.y + c.h).toBe(true);
    }
  });
});

describe("an arrangement given to the layout", () => {
  const spec = focusGraph(baseline(), "building");
  const type = "building@1";

  it("leaves the other containers to the layout", () => {
    const auto = layout(spec);
    const arranged = layout(spec, { arrangement: { [type]: [[...auto.rows[type].flat()].reverse()] } });
    for (const [id, rows] of Object.entries(auto.rows)) if (id !== type) expect(arranged.rows[id]).toEqual(rows);
  });

  it("ignores what is not a node of the container and keeps its other nodes on a last row", () => {
    const ids = layout(spec).rows[type].flat();
    const result = layout(spec, { arrangement: { [type]: [["nobody", ids[1]], [], [ids[1], ids[0]]], elsewhere: [["x"]] } });
    expect(result.rows[type]).toEqual([[ids[1]], [ids[0]], ids.slice(2)]);
  });

  it("is kept when the diagram is fitted to a canvas", () => {
    const rows = layout(spec).rows[type].flat().map((id) => [id]);
    expect(layoutToFit(spec, { width: 900, height: 600 }, { arrangement: { [type]: rows } }).rows[type]).toEqual(rows);
  });
});

describe("where a dragged node would go", () => {
  const spec = focusGraph(baseline(), "building");
  const result = layout(spec, { width: 1000 });
  const type = "building@1";
  const rows = result.rows[type];
  const [first, second] = rows[0];
  const rect = (id: string) => result.nodes[id];
  const middle = (id: string) => ({ x: rect(id).x + rect(id).w / 2, y: rect(id).y + rect(id).h / 2 });

  it("is where it already is, when it has not left its place", () => {
    const drop = dropTarget(result, spec, first, middle(first))!;
    expect(drop.container).toBe(type);
    expect(sameRows(moveNode(rows, first, drop), rows)).toBe(true);
  });

  it("is after a node, when dropped on its right half", () => {
    const at = { x: rect(second).x + rect(second).w - 4, y: middle(second).y };
    const drop = dropTarget(result, spec, first, at)!;
    expect(drop).toMatchObject({ row: 0, fresh: false });
    const next = moveNode(rows, first, drop);
    expect(next[0].indexOf(first)).toBe(next[0].indexOf(second) + 1);
    // the marker stands on the row, upright
    expect(drop.marker.h).toBeGreaterThan(drop.marker.w);
  });

  it("is a row of its own, above the first row or below the last", () => {
    const frame = result.containers[type];
    const above = dropTarget(result, spec, second, { x: middle(second).x, y: rect(first).y - 14 })!;
    expect(above).toMatchObject({ row: 0, fresh: true });
    expect(moveNode(rows, second, above)[0]).toEqual([second]);
    const last = rows[rows.length - 1][0];
    const below = dropTarget(result, spec, first, { x: middle(first).x, y: rect(last).y + rect(last).h + 14 })!;
    expect(below.fresh).toBe(true);
    expect(moveNode(rows, first, below).at(-1)).toEqual([first]);
    // the marker lies across the container
    for (const drop of [above, below]) {
      expect(drop.marker.w).toBeGreaterThan(drop.marker.h);
      expect(drop.marker.x >= frame.x && drop.marker.x + drop.marker.w <= frame.x + frame.w).toBe(true);
    }
  });

  it("never leaves its container, wherever the pointer goes", () => {
    for (const point of [{ x: -500, y: -500 }, { x: 5000, y: 5000 }, middle("building#policy")]) {
      expect(dropTarget(result, spec, first, point)?.container).toBe(type);
    }
    expect(dropTarget(result, spec, "nobody", { x: 0, y: 0 })).toBeNull();
  });

  it("gives, after the move, a diagram that keeps its promises", () => {
    const drop = dropTarget(result, spec, first, { x: middle(first).x, y: rect(first).y - 40 })!;
    const moved = layout(spec, { width: 1000, arrangement: { [type]: moveNode(rows, first, drop) } });
    expect(overlappingNodes(moved)).toEqual([]);
    expect(collinearOverlaps(moved)).toEqual([]);
    expect(edgesThroughNodes(moved)).toEqual([]);
  });
});

describe("the containers of the band at the side", () => {
  const spec = focusGraph(baseline(), "building");
  // narrow enough for Building to wrap onto several rows
  const result = layout(spec, { width: 700 });
  const rowOf = (id: string, of = result) => of.band[id];

  it("start next to what they are linked to, one below the other", () => {
    expect(result.aside).toBeDefined();
    for (const lane of ["O1", "O0"] as const) {
      const own = spec.containers.find((c) => c.lane === lane && !c.proxy)!;
      const beside = spec.containers.filter((c) => c.lane === lane && c.proxy);
      const frame = result.containers[own.id];
      const frames = beside.map((c) => result.containers[c.id]).sort((a, b) => a.y - b.y);
      expect(beside.length).toBe(2);
      // one below the other, and the lane no taller than the model when the model is the taller
      for (let i = 1; i < frames.length; i++) expect(frames[i].y).toBeGreaterThanOrEqual(frames[i - 1].y + frames[i - 1].h);
      if (result.rows[own.id].length >= beside.length) {
        expect(result.lanes.find((l) => l.id === lane)!.h).toBe(frame.h);
        for (const r of frames) expect(r.y >= frame.y && r.y + r.h <= frame.y + frame.h).toBe(true);
      }
    }
    // among the instances each room stands on the row of the occupancy it provides, or right next to it
    const grid = result.grid.O0;
    for (const [proxy, fed] of [["proxy:room1", "building#occupancy_r1"], ["proxy:room2", "building#occupancy_r2"]] as const) {
      const fedRow = grid.findIndex((row) => row.y === result.nodes[fed].y);
      expect(Math.abs(rowOf(proxy) - fedRow)).toBeLessThanOrEqual(1);
    }
  });

  it("go to the row the modeler chooses, and the one whose row is taken goes below", () => {
    const moved = layout(spec, { width: 700, band: { "proxy:room2": 0 } });
    expect(rowOf("proxy:room2", moved)).toBe(0);
    expect(rowOf("proxy:room1", moved)).toBeGreaterThan(0);
    expect(moved.containers["proxy:room2"].y).toBeLessThan(moved.containers["proxy:room1"].y);
    // the same row for both: the one put there by hand takes it
    const same = layout(spec, { width: 700, band: { "proxy:room2": rowOf("proxy:room1") } });
    expect(rowOf("proxy:room2", same)).toBeLessThan(rowOf("proxy:room1", same));
  });

  it("can be put one row past the end of the lane, which grows, and no further", () => {
    const rows = result.grid.O0.length;
    const past = layout(spec, { width: 700, band: { "proxy:room2": 99 } });
    expect(past.grid.O0.length).toBe(rows + 1);
    expect(rowOf("proxy:room2", past)).toBe(rows);
  });

  it.each([
    ["the second one first", { "proxy:room2": 0, "proxy:room2:O1": 0 }],
    ["both on the last row", { "proxy:room1": 9, "proxy:room2": 9, "proxy:room1:O1": 9 }],
    ["one past the end", { "proxy:room1": 99 }],
  ])("keep the promises of the layout with %s", (_, band) => {
    for (const width of [undefined, 1400, 700]) {
      const moved = layout(spec, { width, band });
      expect(overlappingNodes(moved)).toEqual([]);
      expect(collinearOverlaps(moved)).toEqual([]);
      expect(edgesThroughNodes(moved)).toEqual([]);
      expect(labelCollisions(moved)).toEqual([]);
      expect(Object.keys(moved.nodes)).toHaveLength(spec.nodes.length);
      expect(moved.edges).toHaveLength(spec.edges.length);
    }
  });

  it("are dropped on the row the pointer is nearest to", () => {
    const grid = result.grid.O0;
    const x = result.containers["proxy:room1"].x + 10;
    grid.forEach((row, index) => {
      expect(bandTarget(result, spec, "proxy:room1", { x, y: row.y + row.h / 2 })).toEqual({ container: "proxy:room1", row: index });
    });
    const last = grid[grid.length - 1];
    expect(bandTarget(result, spec, "proxy:room1", { x, y: last.y + last.h + 200 })?.row).toBe(grid.length);
    expect(bandTarget(result, spec, "proxy:room1", { x, y: -500 })?.row).toBe(0);
    // only what stands in the band is moved this way
    expect(bandTarget(result, spec, "building", { x, y: 0 })).toBeNull();
    expect(bandTarget(result, spec, "nobody", { x, y: 0 })).toBeNull();
  });
});

describe("what was arranged, kept in a browser", () => {
  it("outlives a new version of the model, by the names of its elements", () => {
    const before = focusGraph(baseline(), "building");
    const classes = layout(before).rows["building@1"].flat();
    const stable = toStable(before, { rows: { "building@1": [[...classes].reverse()] }, band: { "proxy:room2": 0 } });
    expect(Object.keys(stable.rows)).toEqual(["O1:building"]);
    expect(stable.rows["O1:building"][0]).toEqual([...classes].reverse().map((id) => id.split("#")[1]));
    expect(stable.band).toEqual({ "proxy:room2": 0 });

    const after = focusGraph(afterBind().federation(), "building");
    const type = after.containers.find((c) => c.lane === "O1" && !c.proxy)!.id;
    expect(type).not.toBe("building@1");
    const back = fromStable(after, stable);
    expect(back.rows[type][0]).toEqual([...classes].reverse().map((id) => `${type}#${id.split("#")[1]}`));
    expect(back.band).toEqual({ "proxy:room2": 0 });
    // what the new version added is not named: the layout puts it on a last row
    const arranged = layout(after, { arrangement: back.rows, band: back.band });
    expect(arranged.rows[type][0]).toEqual(back.rows[type][0]);
    expect(arranged.rows[type].flat()).toHaveLength(after.nodes.filter((n) => n.container === type).length);
    expect(arranged.band["proxy:room2"]).toBe(0);
  });

  it("names nothing for the containers it does not know, and drops names that are gone", () => {
    const spec = focusGraph(baseline(), "room1");
    expect(fromStable(spec, undefined)).toEqual(NO_MANUAL);
    const kept = { rows: { "O1:room1": [["Gone"], ["Occupancy"]], "O0:other": [["x"]] }, band: { "proxy:building": 1, "proxy:gone": 2 } };
    expect(fromStable(spec, kept)).toEqual({ rows: { "room1@1": [["room1@1#Occupancy"]] }, band: { "proxy:building": 1 } });
    expect(isManual(NO_MANUAL)).toBe(false);
    expect(isManual(fromStable(spec, kept))).toBe(true);
    expect(isManual({ rows: {}, band: { "proxy:building": 0 } })).toBe(true);
  });

  it("is read back as it was written, and anything else gives nothing", () => {
    const kept = { room1: { rows: { "O1:room1": [["Occupancy"], ["Presence"]] }, band: { "proxy:building": 2 } } };
    expect(parseArrangements(JSON.stringify(kept))).toEqual(kept);
    // what was kept before the band could be arranged: the rows alone
    expect(parseArrangements(JSON.stringify({ room1: { "O1:room1": [["Occupancy"]] } }))).toEqual({
      room1: { rows: { "O1:room1": [["Occupancy"]] }, band: {} },
    });
    expect(
      parseArrangements(JSON.stringify({ room1: { rows: { a: [["x"], [3]], b: "no", c: [["y"]] }, band: { p: "1", q: -1, r: 2.4 } }, room2: 7 })),
    ).toEqual({ room1: { rows: { c: [["y"]] }, band: { r: 2 } } });
    for (const text of [null, "", "nonsense", "[]", "3"]) expect(parseArrangements(text)).toEqual({});
  });
});
