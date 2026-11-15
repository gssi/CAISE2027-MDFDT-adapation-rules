/**
 * What a DT is made of: an entity of its model, and the DT that is the twin of
 * that entity. Stated in the weaving of the model that has the entity.
 */
import { describe, expect, it } from "vitest";

import { REPRESENTATION, links } from "@/engine/federation";
import { renameObject } from "@/engine/modeling/rename";
import { gateFor } from "@/engine/modelset";
import { validateWeaving } from "@/engine/weaving/checks";
import { wlink } from "@/engine/weaving/model";
import { representationOf, setRepresentation } from "@/components/workbench/edits";

import { afterA1, afterBind, baseline } from "./helpers";

const messages = (fed: ReturnType<typeof baseline>) => validateWeaving(fed).map((issue) => issue.message);

describe("representation", () => {
  it("states that Building is made of the rooms the room DTs are twins of", () => {
    const fed = baseline();
    const type = fed.models["building@1"];
    expect(type.eClasses.Building.eReferences.rooms).toMatchObject({ eType: "Room", containment: true, upperBound: -1 });
    expect(links(fed, REPRESENTATION).map((l) => [l.ends.entity, l.ends.dt])).toEqual([
      ["building#room_1", "room1"],
      ["building#room_2", "room2"],
    ]);
    expect(gateFor(fed, "building")).toEqual([]);
  });

  it("is kept through the scenarios", () => {
    for (const repo of [afterA1(), afterBind()]) {
      const fed = repo.federation();
      expect(representationOf(fed, "building#room_1")).toBe("room1");
      expect(representationOf(fed, "building#room_2")).toBe("room2");
      expect(gateFor(fed, "building")).toEqual([]);
    }
  });

  it.each([
    ["a DT that does not exist", "building#room_1", "room9", "unknown model"],
    ["an entity that does not exist", "building#room_9", "room1", "is not an object of a DT model"],
    ["an attribute instead of an object", "building#occupancy_r1.occupied", "room1", "is not an object of a DT model"],
    ["an element instead of a DT", "building#room_1", "room1#occupancy", "is not a DT model"],
    ["the model of the entity itself", "building#room_1", "building", "of its own model"],
  ])("refuses %s", (_, entity, dt, message) => {
    const fed = baseline();
    const weaving = fed.weaving["building-weaving"];
    weaving.links = weaving.links.filter((l) => l.type !== REPRESENTATION);
    weaving.links.push(wlink("r-x", REPRESENTATION, { entity, dt }));
    expect(messages(fed).join("; ")).toContain(message);
  });

  it("refuses two twins for one entity", () => {
    const fed = baseline();
    fed.weaving["building-weaving"].links.push(wlink("r-again", REPRESENTATION, { entity: "building#room_1", dt: "room2" }));
    expect(messages(fed).join("; ")).toContain("already represented by a DT");
  });

  it("is set, changed and removed by the modeler, in the weaving of the model of the entity", () => {
    const fed = baseline();
    setRepresentation(fed, "building#room_1", null);
    expect(representationOf(fed, "building#room_1")).toBeNull();
    setRepresentation(fed, "building#room_1", "room2");
    setRepresentation(fed, "building#room_1", "room1");
    const mine = fed.weaving["building-weaving"].links.filter((l) => l.ends.entity === "building#room_1");
    expect(mine.map((l) => l.ends.dt)).toEqual(["room1"]);
    expect(validateWeaving(fed)).toEqual([]);

    setRepresentation(fed, "room1#presence", "building");
    expect(fed.weaving["room1-weaving"].links.map((l) => [l.type, l.ends.dt])).toEqual([[REPRESENTATION, "building"]]);
    expect(fed.weaving["room1-weaving"].woven).toEqual(["room1", "building"]);
  });

  it("follows the entity when it is renamed", () => {
    const fed = baseline();
    expect(renameObject(fed, "building", "room_1", "north_room")).toBeNull();
    expect(representationOf(fed, "building#north_room")).toBe("room1");
    expect(gateFor(fed, "building")).toEqual([]);
  });
});
