/** The diagram layout on the real models of the scenarios (rules of core:diagrams). */
import { describe, expect, it } from "vitest";

import { type ProcessResult } from "@/engine/assistant/process";
import { type Federation } from "@/engine/federation";
import { checkCorrespondences } from "@/engine/weaving/checks";
import { EDGE_KINDS, buildGraph, type EdgeKind, type GraphSpec } from "@/diagram/graph";
import {
  collinearOverlaps,
  edgesThroughNodes,
  labelCollisions,
  layout,
  layoutToFit,
  overlappingNodes,
} from "@/diagram/layout";
import { K_FIT_MIN, K_MAX, K_MIN, fitClear, fitView, zoomView } from "@/diagram/view";

import { HIDDEN_COUNT, a1Batch, afterA1, afterA2, afterBind, baseline, newRepo, run, runA2 } from "./helpers";

const ALL = new Set<EdgeKind>(EDGE_KINDS);
const DEFAULT = new Set<EdgeKind>(EDGE_KINDS.filter((k) => k !== "typing"));

function plainGraph(fed: Federation, kinds = ALL): GraphSpec {
  return buildGraph(fed, null, kinds, { statuses: checkCorrespondences(fed) });
}

function processGraph(result: ProcessResult, kinds = ALL): GraphSpec {
  return buildGraph(result.candidate, result.head, kinds, {
    statuses: checkCorrespondences(result.candidate),
    drift: result.drift,
    impact: result.impact,
  });
}

const runA1 = () => run(newRepo(), "room1", { kind: "observations", batch: a1Batch() });

/** One model open, as in the modeler: what it is woven with stands at the side. */
function focusGraph(fed: Federation, focus: string, kinds = DEFAULT): GraphSpec {
  return buildGraph(fed, null, kinds, { statuses: checkCorrespondences(fed) }, { focus });
}

function focusProcess(result: ProcessResult, focus: string): GraphSpec {
  return buildGraph(
    result.candidate,
    result.head,
    DEFAULT,
    { statuses: checkCorrespondences(result.candidate), drift: result.drift, impact: result.impact },
    { focus },
  );
}

function committedA2(variant?: string): Federation {
  return (variant ? afterBind() : afterA2()).federation();
}

const cases: [string, () => GraphSpec][] = [
  ["A0 baseline", () => plainGraph(baseline())],
  ["A0 baseline, default layers", () => plainGraph(baseline(), DEFAULT)],
  ["A1 proposal", () => processGraph(runA1())],
  ["A1 committed", () => plainGraph(afterA1().federation())],
  ["A2 proposal", () => processGraph(runA2(afterA1()))],
  ["A2 proposal, default layers", () => processGraph(runA2(afterA1()), DEFAULT)],
  ["A2 committed, change request", () => plainGraph(committedA2())],
  ["A2 committed, bind", () => plainGraph(committedA2(HIDDEN_COUNT))],
  ["Building alone", () => focusGraph(baseline(), "building")],
  ["Room 1 alone", () => focusGraph(baseline(), "room1")],
  ["Room 1 alone, A1 proposal", () => focusProcess(runA1(), "room1")],
  ["Building alone, A2 committed", () => focusGraph(committedA2(HIDDEN_COUNT), "building")],
];

// Unlimited width (every DT is a column), then widths that force wrapping.
const widths: (number | undefined)[] = [undefined, 1400, 1000, 700];
const matrix = cases.flatMap(([name, build]) =>
  widths.map((width) => [`${name}, ${width ? `${width}px wide` : "unlimited"}`, build, width] as const),
);

describe.each(matrix)("layout of %s", (_, build, width) => {
  const spec = build();
  const result = layout(spec, { width });

  it("stays within the width it is given, give or take a channel at the side", () => {
    if (width) expect(result.width).toBeLessThanOrEqual(width + 96);
  });

  it("places every element", () => {
    expect(Object.keys(result.nodes)).toHaveLength(spec.nodes.length);
    expect(Object.keys(result.containers)).toHaveLength(spec.containers.length);
    expect(result.edges).toHaveLength(spec.edges.length);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("has no overlapping nodes or containers", () => {
    expect(overlappingNodes(result)).toEqual([]);
  });

  it("keeps every node inside its container and its lane", () => {
    for (const node of spec.nodes) {
      const n = result.nodes[node.id];
      const c = result.containers[node.container];
      expect(n.x >= c.x && n.x + n.w <= c.x + c.w && n.y >= c.y && n.y + n.h <= c.y + c.h).toBe(true);
    }
    for (const container of spec.containers) {
      const lane = result.lanes.find((l) => l.id === container.lane)!;
      const c = result.containers[container.id];
      expect(c.y >= lane.y && c.y + c.h <= lane.y + lane.h).toBe(true);
    }
  });

  it("has no two connectors sharing a stretch of line", () => {
    expect(collinearOverlaps(result)).toEqual([]);
  });

  it("has no connector running through a node", () => {
    expect(edgesThroughNodes(result)).toEqual([]);
  });

  it("has orthogonal connectors only", () => {
    for (const edge of result.edges) {
      for (let i = 0; i < edge.points.length - 1; i++) {
        const [x1, y1] = edge.points[i];
        const [x2, y2] = edge.points[i + 1];
        expect(Math.abs(x1 - x2) < 0.01 || Math.abs(y1 - y2) < 0.01).toBe(true);
      }
    }
  });

  it("has labels that cover neither nodes nor other labels", () => {
    expect(labelCollisions(result)).toEqual([]);
  });
});

describe("structure of the diagram", () => {
  it("stacks the levels and puts a DT in one column", () => {
    const result = layout(plainGraph(baseline()));
    expect(result.lanes.map((l) => l.id)).toEqual(["O2", "O1", "O0", "data"]);
    for (let i = 1; i < result.lanes.length; i++) {
      expect(result.lanes[i].y).toBeGreaterThan(result.lanes[i - 1].y + result.lanes[i - 1].h);
    }
    const mid = (id: string) => result.containers[id].x + result.containers[id].w / 2;
    expect(mid("room1@data")).toBeCloseTo(mid("room1"), 0);
    expect(mid("room2@data")).toBeCloseTo(mid("room2"), 0);
  });

  it("shows what a proposal removes and adds", () => {
    const spec = processGraph(runA1());
    const mark = (id: string) => spec.nodes.find((n) => n.id === id)?.mark;
    expect(mark("room1#occupancy")).toBe("removed");
    expect(mark("room1#people_count")).toBe("added");
    expect(mark("room1@data#occupied")).toBe("removed");
    expect(mark("room1@data#count")).toBe("added");
    expect(spec.containers.find((c) => c.id === "room1@2")?.mark).toBe("added");
    const broken = spec.edges.find((e) => e.id === "correspondence:c-r1-occupancy");
    expect(broken?.tone).toBe("broken");
    expect(spec.nodes.find((n) => n.id === "building#policy")?.impact).toBe("medium");
  });

  it("merges many typing connectors into a bus", () => {
    const spec = plainGraph(afterA1().federation());
    const result = layout(spec);
    const bus = result.edges.filter((e) => e.connector === "typing>core#Observation");
    expect(bus.length).toBeGreaterThanOrEqual(3);
    expect(bus.filter((e) => e.arrow)).toHaveLength(1);
  });
});

describe("use of the canvas", () => {
  const committed = () => plainGraph(committedA2());
  const canvas = { width: 870, height: 780 };
  const scaleIn = (r: { width: number; height: number }) =>
    Math.min(1.25, (canvas.width - 32) / r.width, (canvas.height - 32) / r.height);

  it("wraps models and nodes onto several rows when the width is limited", () => {
    const wide = layout(committed());
    const narrow = layout(committed(), { width: 900 });
    expect(narrow.width).toBeLessThan(wide.width);
    expect(narrow.height).toBeGreaterThan(wide.height);
    // the two versions of a type no longer sit side by side with everything else
    const tops = new Set(Object.values(narrow.containers).map((c) => c.y));
    expect(tops.size).toBeGreaterThan(new Set(Object.values(wide.containers).map((c) => c.y)).size);
  });

  it("fills a canvas much better than a single strip", () => {
    const strip = layout(committed());
    const fitted = layoutToFit(committed(), canvas);
    expect(scaleIn(strip)).toBeLessThan(0.3);
    expect(scaleIn(fitted)).toBeGreaterThan(2 * scaleIn(strip));
    // the diagram now uses most of the height of the canvas
    expect(fitted.height * scaleIn(fitted)).toBeGreaterThan(canvas.height * 0.6);
    expect(strip.height * scaleIn(strip)).toBeLessThan(canvas.height * 0.3);
  });

  it("keeps the single strip when the canvas is wide enough for it", () => {
    const spec = plainGraph(baseline());
    const strip = layout(spec);
    const fitted = layoutToFit(spec, { width: strip.width + 200, height: strip.height + 100 });
    expect(fitted.width).toBe(strip.width);
  });

  it.each(cases)("obeys every rule when fitted to the canvas: %s", (_, build) => {
    const fitted = layoutToFit(build(), canvas);
    expect(overlappingNodes(fitted)).toEqual([]);
    expect(collinearOverlaps(fitted)).toEqual([]);
    expect(edgesThroughNodes(fitted)).toEqual([]);
    expect(labelCollisions(fitted)).toEqual([]);
  });
});

describe("view", () => {
  it("fits the diagram in the canvas, within the zoom limits", () => {
    const view = fitView({ width: 1500, height: 600 }, { width: 1000, height: 800 });
    expect(view.k).toBeCloseTo((1000 - 32) / 1500, 5);
    expect(view.x).toBeCloseTo(16, 5);
    expect(fitView({ width: 100, height: 100 }, { width: 1000, height: 800 }).k).toBe(K_MAX);
    // too large to stay readable: it starts at the top-left corner and is panned
    const large = fitView({ width: 90000, height: 100 }, { width: 1000, height: 800 });
    expect(large.k).toBe(K_FIT_MIN);
    expect(large.x).toBe(16);
  });

  it("zooms around a point and respects the limits", () => {
    const view = { k: 1, x: 0, y: 0 };
    const at = { x: 400, y: 300 };
    const zoomed = zoomView(view, 1.2, at);
    expect(zoomed.k).toBeCloseTo(1.2, 5);
    // the diagram point under `at` stays under it
    expect((at.x - zoomed.x) / zoomed.k).toBeCloseTo(at.x, 5);
    expect(zoomView(view, 100, at).k).toBe(K_MAX);
    expect(zoomView(view, 0.001, at).k).toBe(K_MIN);
  });
});

describe.each([
  ["Building", () => focusGraph(baseline(), "building"), ["proxy:room1", "proxy:room2", "proxy:room1:O1", "proxy:room2:O1"]],
  ["Room 1", () => focusGraph(baseline(), "room1"), ["proxy:building", "proxy:building:O1"]],
  ["Room 1, A1 proposal", () => focusProcess(runA1(), "room1"), ["proxy:building", "proxy:building:O1"]],
] as const)("what %s is woven with", (_, build, expected) => {
  const spec = build();

  it.each([undefined, 1400, 1000, 700])("stands in a band at the side, on its level (width %s)", (width) => {
    const result = layout(spec, { width });
    const beside = spec.containers.filter((c) => c.proxy);
    expect(beside.map((c) => c.id).sort()).toEqual([...expected].sort());
    const band = result.aside!;
    // on a canvas too narrow for the band, the other models stay among the rest
    if (width && !band) return expect(result.width).toBeLessThanOrEqual(width + 96);
    expect(band).toBeDefined();
    for (const container of spec.containers) {
      const r = result.containers[container.id];
      if (container.proxy) {
        // inside the band, on the level of what it holds: objects among the instances, classes among the types
        expect(r.x >= band.x && r.x + r.w <= band.x + band.w && r.y >= band.y && r.y + r.h <= band.y + band.h).toBe(true);
        const lane = result.lanes.find((l) => l.id === container.lane)!;
        expect(r.y >= lane.y && r.y + r.h <= lane.y + lane.h).toBe(true);
        const kinds = spec.nodes.filter((n) => n.container === container.id).map((n) => n.kind);
        expect(new Set(kinds)).toEqual(new Set([container.lane === "O1" ? "class" : "object"]));
      } else {
        // the model itself is clear of the band
        expect(r.x + r.w).toBeLessThan(band.x);
      }
    }
  });

  it("has no band when the whole federation is shown", () => {
    expect(layout(plainGraph(baseline())).aside).toBeUndefined();
  });
});

describe("a correspondence among the types", () => {
  const spec = focusGraph(baseline(), "building");

  it("is read from the correspondence between objects, between their classes", () => {
    const derived = spec.edges.filter((e) => e.derived && e.kind === "correspondence");
    expect(derived.map((e) => [e.id, e.from, e.to])).toEqual([
      ["correspondence:c-r1-occupancy@types", "room1@1#Occupancy", "building@1#RoomOccupancy"],
      ["correspondence:c-r2-occupancy@types", "room2@1#Occupancy", "building@1#RoomOccupancy"],
    ]);
    expect(spec.containers.find((c) => c.id === "proxy:room1:O1")).toMatchObject({ lane: "O1", title: "room1@1", proxy: true });
  });

  it("is not drawn when the whole federation is shown, nor without the correspondences", () => {
    expect(plainGraph(baseline()).edges.filter((e) => e.derived)).toEqual([]);
    expect(focusGraph(baseline(), "building", new Set<EdgeKind>(["reference"])).edges.filter((e) => e.derived)).toEqual([]);
  });
});

describe("what a model is made of", () => {
  it("draws a containment as such, among the types and among the instances", () => {
    const parts = focusGraph(baseline(), "building").edges.filter((e) => e.containment);
    expect(parts.map((e) => [e.from, e.to]).sort()).toEqual([
      ["building#building", "building#room_1"],
      ["building#building", "building#room_2"],
      ["building@1#Building", "building@1#Room"],
    ]);
  });

  it("joins an entity to the DT that is its twin, in the band, and reads it among the types", () => {
    const spec = focusGraph(baseline(), "building");
    const twins = spec.edges.filter((e) => e.kind === "representation");
    expect(twins.map((e) => [e.id, e.from, e.to])).toEqual([
      ["representation:r-room1", "building#room_1", "proxy:room1"],
      ["representation:r-room1@types", "building@1#Room", "proxy:room1:O1"],
      ["representation:r-room2", "building#room_2", "proxy:room2"],
      ["representation:r-room2@types", "building@1#Room", "proxy:room2:O1"],
    ]);
  });

  it("shows, in the model of the twin, the entity it stands for", () => {
    const spec = focusGraph(baseline(), "room1");
    const twins = spec.edges.filter((e) => e.kind === "representation");
    expect(twins.map((e) => [e.from, e.to])).toEqual([
      ["building#room_1", "room1"],
      ["building@1#Room", "room1@1"],
    ]);
    expect(spec.nodes.find((n) => n.id === "building#room_1")).toMatchObject({ container: "proxy:building", proxy: true });
  });

  it("gives the twin a box in the band even when no correspondence reaches it", () => {
    const spec = focusGraph(baseline(), "building", new Set<EdgeKind>(["representation"]));
    expect(spec.containers.filter((c) => c.proxy).map((c) => c.id).sort()).toEqual([
      "proxy:room1",
      "proxy:room1:O1",
      "proxy:room2",
      "proxy:room2:O1",
    ]);
    const result = layout(spec);
    expect(result.aside).toBeDefined();
    for (const id of ["proxy:room1", "proxy:room2"]) expect(result.containers[id].w).toBeGreaterThan(0);
  });
});

describe("a diagram fitted under the buttons laid over its corner", () => {
  const size = { width: 1000, height: 800 };
  const corner = { width: 160, height: 64 };
  const bounds = { width: 1400, height: 1100 };
  const under = (view: { k: number; x: number; y: number }, shape: { x: number; y: number; w: number; h: number }) =>
    view.x + (shape.x + shape.w) * view.k > size.width - corner.width && view.y + shape.y * view.k < corner.height;

  it("takes the whole canvas when nothing would be hidden", () => {
    const shapes = [{ x: 40, y: 40, w: 300, h: 200 }, { x: 900, y: 600, w: 400, h: 300 }];
    expect(fitClear(bounds, size, shapes, corner)).toEqual(fitView(bounds, size));
    expect(fitClear(bounds, size, [], corner)).toEqual(fitView(bounds, size));
  });

  it("goes below them when a shape would be hidden, whole and no larger than the room left", () => {
    const shapes = [{ x: 1000, y: 20, w: 380, h: 200 }];
    const plain = fitView(bounds, size);
    expect(under(plain, shapes[0])).toBe(true);
    const view = fitClear(bounds, size, shapes, corner);
    expect(under(view, shapes[0])).toBe(false);
    expect(view.y).toBeGreaterThanOrEqual(corner.height);
    expect(view.y + bounds.height * view.k).toBeLessThanOrEqual(size.height);
    expect(view.k).toBeLessThanOrEqual(plain.k);
  });

  it("is the plain fit with no buttons, or with buttons as tall as the canvas", () => {
    const shapes = [{ x: 1000, y: 20, w: 380, h: 200 }];
    expect(fitClear(bounds, size, shapes, { width: 0, height: 0 })).toEqual(fitView(bounds, size));
    expect(fitClear(bounds, size, shapes, { width: 160, height: 900 })).toEqual(fitView(bounds, size));
  });

  it("keeps a real diagram clear of them at the sizes of a canvas", () => {
    const spec = focusGraph(baseline(), "building");
    for (const canvas of [{ width: 830, height: 840 }, { width: 1100, height: 700 }, { width: 600, height: 500 }]) {
      const result = layoutToFit(spec, canvas);
      const shapes = [...Object.values(result.containers), ...(result.aside ? [result.aside] : [])];
      const view = fitClear({ width: result.width, height: result.height }, canvas, shapes, corner);
      for (const shape of shapes) {
        expect(view.x + (shape.x + shape.w) * view.k > canvas.width - corner.width && view.y + shape.y * view.k < corner.height).toBe(false);
      }
    }
  });
});
