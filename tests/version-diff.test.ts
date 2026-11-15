/**
 * What a version changed, in the diagram: only what changed is marked. A commit
 * gives the type of a model its next number even when the type says the same.
 */
import { describe, expect, it } from "vitest";

import { EDGE_KINDS, buildGraph } from "@/diagram/graph";
import { assembleAt, headsOf } from "@/engine/assistant/session";

import { afterA1 } from "./helpers";

describe("the diagram of what a version changed", () => {
  // Building v2 after A1: only its correspondence with Room 1 changed.
  const repo = afterA1();
  const versions = repo.versions();
  const at = { ...headsOf(versions), ...repo.info("building", 2).context, building: 2 };
  const spec = buildGraph(assembleAt(versions, at), assembleAt(versions, { ...at, building: 1 }), new Set(EDGE_KINDS), {}, { focus: "building" });

  it("does not draw a type that only got its next number as replaced", () => {
    expect(spec.containers.map((c) => c.id)).not.toContain("building@1");
    expect(spec.containers.find((c) => c.id === "building@2")?.mark).toBeUndefined();
    expect(spec.containers.find((c) => c.id === "building")?.mark).toBeUndefined();
    expect(spec.nodes.filter((n) => n.container.startsWith("building") && n.mark)).toEqual([]);
    expect(spec.edges.filter((e) => e.kind === "evolution")).toEqual([]);
  });

  it("marks the correspondence that changed and says what changed in it", () => {
    const changed = spec.edges.find((e) => e.id === "correspondence:c-r1-occupancy");
    expect(changed?.mark).toBe("modified");
    expect(changed?.label).toContain("changed");
    expect(changed?.detail).toContain("expects.typeVersion: room1@1 → room1@2");
    expect(changed?.detail).toContain("mapping: none → count > 0");
    expect(spec.edges.find((e) => e.id === "correspondence:c-r2-occupancy")?.mark).toBeUndefined();
  });
});
