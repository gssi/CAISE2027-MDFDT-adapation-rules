/**
 * Renaming a class or an object: the model follows inside, and the other DTs
 * find the change as drift they can resolve, because the rename is traced.
 */
import { describe, expect, it } from "vitest";

import { EVOLUTION, cloneFederation, links } from "@/engine/federation";
import { renameAttribute, renameClass, renameObject } from "@/engine/modeling/rename";
import { extract, gateFor } from "@/engine/modelset";
import { settle } from "@/server/settle";

import { baseline, newRepo, run } from "./helpers";

const edit = (repo: ReturnType<typeof newRepo>, model: string, change: (fed: ReturnType<typeof baseline>) => void) => {
  const fed = cloneFederation(repo.federation());
  change(fed);
  return { kind: "edit" as const, files: extract(fed, model) };
};

describe("renaming", () => {
  it("renames an object with what refers to it in its model", () => {
    const fed = baseline();
    expect(renameObject(fed, "room1", "presence", "people")).toBeNull();
    const room = fed.models.room1;
    expect(Object.keys(room.objects)).toEqual(Object.keys(baseline().models.room1.objects).map((n) => (n === "presence" ? "people" : n)));
    expect(room.objects.people.name).toBe("people");
    expect(room.objects.occupancy.slots.source).toBe("people");
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("renames the ends of the correspondences the model initiates, not those of other DTs", () => {
    const fed = baseline();
    renameObject(fed, "building", "occupancy_r1", "first_room");
    renameObject(fed, "room1", "occupancy", "busy");
    const link = fed.weaving["building-weaving"].links.find((l) => l.id === "c-r1-occupancy");
    expect(link?.ends.initiating).toBe("building#first_room.occupied");
    expect(link?.ends.participating).toBe("room1#occupancy.occupied");
  });

  it("renames an attribute with the values and bindings its objects give it", () => {
    const fed = baseline();
    const bound = { ...fed.models.room1.objects.occupancy.bindings };
    expect(renameAttribute(fed, "room1", "Occupancy", "occupied", "busy")).toBeNull();
    const occupancy = fed.models.room1.objects.occupancy;
    expect(Object.keys(occupancy.bindings)).toEqual(Object.keys(bound).map((n) => (n === "occupied" ? "busy" : n)));
    expect(occupancy.bindings.busy).toBe(bound.occupied);
    expect(gateFor(fed, "room1")).toEqual([]);
    // the correspondence of Building is Building's to follow
    const link = fed.weaving["building-weaving"].links.find((l) => l.id === "c-r1-occupancy");
    expect(link?.ends.participating).toBe("room1#occupancy.occupied");
    expect(renameAttribute(fed, "room1", "Occupancy", "busy", "source")).toMatch(/already used in Occupancy/);
  });

  it("renames a class with its objects and the references to it", () => {
    const fed = baseline();
    expect(renameClass(fed, "room1", "Presence", "People")).toBeNull();
    const type = fed.models["room1@1"];
    expect(type.eClasses.People.name).toBe("People");
    expect("Presence" in type.eClasses).toBe(false);
    expect(type.eClasses.Occupancy.eReferences.source.eType).toBe("People");
    expect(fed.models.room1.objects.presence.instanceOf).toBe("People");
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("refuses a name that is taken or is not a name", () => {
    const fed = baseline();
    expect(renameObject(fed, "room1", "presence", "occupancy")).toMatch(/already used/);
    expect(renameObject(fed, "room1", "presence", "two words")).toMatch(/letters, digits/);
    expect(renameClass(fed, "room1", "Presence", "Occupancy")).toMatch(/already used/);
    expect(renameClass(fed, "room1", "Presence", "")).toMatch(/letters, digits/);
    expect(fed.models.room1).toEqual(baseline().models.room1);
  });

  it("traces a renamed class as the same class in the next version", () => {
    const repo = newRepo();
    settle(repo, "room1", edit(repo, "room1", (f) => void renameClass(f, "room1", "Occupancy", "Busy")), { decision: "accept" });
    const fed = repo.federation();
    const trace = links(fed, EVOLUTION).map((l) => `${l.ends.from} -> ${l.ends.to}`);
    expect(trace).toContain("room1@1#Occupancy -> room1@2#Busy");
    expect(trace).toContain("room1@1#Presence -> room1@2#Presence");
    expect(fed.models["room1@1"].eClasses.Occupancy).toBeDefined();
  });

  it("lets the initiating DT follow a class and an object renamed in a model it weaves", () => {
    const repo = newRepo();
    settle(
      repo,
      "room1",
      edit(repo, "room1", (f) => {
        renameClass(f, "room1", "Occupancy", "Busy");
        renameObject(f, "room1", "occupancy", "busy");
      }),
      { decision: "accept" },
    );
    const incoming = run(repo, "building", { kind: "incoming" });
    const resolution = incoming.plan.resolutions.find((r) => r.correspondence === "c-r1-occupancy");
    expect(resolution?.options[0].automatic).toBe(true);
    settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: resolution?.options[0].id });
    const link = repo.federation().weaving["building-weaving"].links.find((l) => l.id === "c-r1-occupancy");
    expect(link?.ends.participating).toBe("room1#busy.occupied");
    expect(link?.props.mapping ?? "").toBe("");
    expect(gateFor(repo.federation(), "building")).toEqual([]);
  });
});
