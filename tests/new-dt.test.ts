/** The model of a new DT: an empty type and instance, committed as version 1 next to the others. */
import { describe, expect, it } from "vitest";

import { checkConformance } from "@/engine/conformance";
import { addDT, modelProblem } from "@/engine/modeling/models";
import { gateFor, modelIds } from "@/engine/modelset";
import { buildGraph } from "@/diagram/graph";
import { layout, overlappingNodes } from "@/diagram/layout";
import { checkCorrespondences } from "@/engine/weaving/checks";

import { baseline, newRepo } from "./helpers";

describe("a new DT", () => {
  it("has an empty type, typed by the shared concepts, and an empty instance", () => {
    const fed = baseline();
    expect(addDT(fed, "room3", "Room 3")).toBeNull();
    expect(fed.models["room3@1"]).toMatchObject({ level: "O1", version: 1, typedBy: "core", eClasses: {} });
    expect(fed.models.room3).toMatchObject({ level: "O0", typedBy: "room3@1", dt: "Room 3", objects: {} });
    expect(gateFor(fed, "room3")).toEqual([]);
    expect(checkConformance(fed)).toEqual(checkConformance(baseline()));
  });

  it("is named after its model when it is given no name", () => {
    const fed = baseline();
    addDT(fed, "lab", "  ");
    expect(fed.models.lab.dt).toBe("lab");
  });

  it("refuses a name that is taken or is not a name", () => {
    const fed = baseline();
    expect(modelProblem(fed, "room1")).toMatch(/already used/);
    expect(modelProblem(fed, "core")).toMatch(/already used/);
    expect(modelProblem(fed, "3rd floor")).toMatch(/letters, digits/);
    expect(addDT(fed, "room1", "Again")).not.toBeNull();
    expect(Object.keys(fed.models)).toEqual(Object.keys(baseline().models));
  });

  it("is committed as version 1 and leaves the other models as they are", () => {
    const repo = newRepo();
    const before = repo.versions().length;
    const candidate = repo.federation();
    addDT(candidate, "room3", "Room 3");
    expect(repo.commit("room3", candidate, "initial model")).toBe(1);
    expect(repo.models()).toEqual(["core", "room1", "room2", "building", "room3"]);
    expect(repo.versions().length).toBe(before + 1);
    expect(modelIds(repo.federation())).toContain("room3");
    expect(repo.head("room1")).toBe(1);
  });

  it("is drawn, empty, without breaking the layout", () => {
    const fed = baseline();
    addDT(fed, "room3", "Room 3");
    const spec = buildGraph(fed, null, new Set(), { statuses: checkCorrespondences(fed) }, { focus: "room3" });
    expect(spec.containers.map((c) => c.id)).toEqual(expect.arrayContaining(["room3@1", "room3"]));
    const drawn = layout(spec, { width: 900 });
    expect(overlappingNodes(drawn)).toEqual([]);
    for (const rect of Object.values(drawn.containers)) {
      expect(Number.isFinite(rect.x + rect.y + rect.w + rect.h)).toBe(true);
      expect(rect.w).toBeGreaterThan(0);
    }
  });
});
