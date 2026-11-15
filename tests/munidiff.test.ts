/** Differences between two versions of a model, in the Munidiff syntax. */
import { describe, expect, it } from "vitest";

import { assembleAt, headsOf } from "@/engine/assistant/session";
import { cloneFederation } from "@/engine/federation";
import { munidiff } from "@/engine/munidiff";

import { afterA1, afterBind, baseline } from "./helpers";

describe("munidiff", () => {
  it("is empty when nothing changed", () => {
    expect(munidiff(baseline(), baseline(), "room1")).toBe("");
  });

  it("prints a changed element with only what changed, the new value first", () => {
    const before = baseline();
    const after = cloneFederation(before);
    after.models["building@1"].eClasses.LightingVentilationPolicy.properties.onDrift = "suspend";
    expect(munidiff(before, after, "building", { from: "a", to: "b" })).toBe(
      [
        "--- a",
        "+++ b",
        "@@ @@",
        " building.LightingVentilationPolicy:EClass {",
        "+    onDrift: suspend",
        "-    onDrift: exclude_input",
        " }",
      ].join("\n"),
    );
  });

  it("prints an added element with its features, and its parts as elements of their own", () => {
    const before = baseline();
    const after = cloneFederation(before);
    after.models["room1@1"].eClasses.Temperature = {
      name: "Temperature",
      instanceOf: "Observation",
      eAttributes: { value: { name: "value", eType: "EDouble", unit: "celsius", meaning: null, upperBound: 1 } },
      eReferences: {},
      properties: {},
    };
    expect(munidiff(before, after, "room1", { from: "a", to: "b" })).toBe(
      [
        "--- a",
        "+++ b",
        "@@ @@",
        "+room1.Temperature:EClass {",
        "+    instanceOf --> core.Observation:EClass",
        "+    eAttributes *-->  [",
        "+        room1.Temperature.value:EAttribute",
        "+    ]",
        "+}",
        "@@ @@",
        "+room1.Temperature.value:EAttribute {",
        "+    eType: EDouble",
        "+    unit: celsius",
        "+}",
      ].join("\n"),
    );
  });

  it("prints a removed element with a minus on every line", () => {
    const before = baseline();
    const after = cloneFederation(before);
    delete after.models.room1.objects.occupancy;
    expect(munidiff(before, after, "room1", { from: "a", to: "b" })).toBe(
      [
        "--- a",
        "+++ b",
        "@@ @@",
        "-room1.occupancy:Occupancy {",
        "-    bindings:  [",
        "-        occupied <- occupied",
        "-    ]",
        "-    source --> room1.presence:Presence",
        "-}",
      ].join("\n"),
    );
  });

  it("diffs a multi-valued feature value by value", () => {
    const before = baseline();
    const after = cloneFederation(before);
    after.models.building.objects.policy.slots.inputs = ["occupancy_r2"];
    expect(munidiff(before, after, "building", { from: "a", to: "b" })).toBe(
      [
        "--- a",
        "+++ b",
        "@@ @@",
        " building.policy:LightingVentilationPolicy {",
        "     inputs -->  [",
        "-        building.occupancy_r1:RoomOccupancy",
        "         building.occupancy_r2:RoomOccupancy",
        "     ]",
        " }",
      ].join("\n"),
    );
  });

  it("only reports the model it is asked about", () => {
    const before = baseline();
    const after = cloneFederation(before);
    delete after.models.room1.objects.occupancy;
    expect(munidiff(before, after, "room2")).toBe("");
    expect(munidiff(before, after, "building")).toBe("");
  });

  // The diffs of the scenarios, kept as files so they can be read and reviewed.
  it.each([
    ["a1-room1-v2", () => afterA1(), "room1", 2],
    ["a1-building-v2", () => afterA1(), "building", 2],
    ["a2-building-v3", () => afterBind(), "building", 3],
    ["a2-room2-v2", () => afterBind(), "room2", 2],
    ["a2-building-v4", () => afterBind(), "building", 4],
  ] as const)("matches the reviewed diff %s", async (name, build, model, version) => {
    const repo = build();
    const stored = repo.changes(model, version);
    const versions = repo.versions();
    const at = (v: number) => ({ ...headsOf(versions), [model]: v });
    // what the repository stored is what the two versions give
    const context = repo.info(model, version).context;
    const recomputed = munidiff(
      assembleAt(versions, { ...at(version - 1), ...context }),
      assembleAt(versions, { ...at(version), ...context }),
      model,
      { from: `${model}/versions/000${version - 1}`, to: `${model}/versions/000${version}` },
    );
    expect(recomputed).toBe(stored);
    await expect(stored).toMatchFileSnapshot(`expected/${name}.munidiff`);
  });
});
