/** Reactions: when something a DT observes becomes true, a part of its device is asked to act. */
import { describe, expect, it } from "vitest";

import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import {
  addDevice,
  addReaction,
  addSensor,
  ensureConcept,
  hasConcept,
  linkParameter,
} from "@/components/workbench/edits";
import { runTrigger } from "@/engine/assistant/session";
import { devicesOf, toBatch } from "@/engine/devices";
import { cloneFederation, type Federation } from "@/engine/federation";
import { extract, gateFor } from "@/engine/modelset";
import { liveValues } from "@/engine/runtime/live";
import { actorOf, fire, holds, reactionsOf } from "@/engine/runtime/reactions";
import { invokeOperation, readDevice } from "@/server/connectors";
import { simulatedCalls } from "@/server/connectors/simulated";
import { settle } from "@/server/settle";

import { baseline, newRepo } from "./helpers";

const simulatedInfo = connectorInfo("simulated")!;

/** Room 2 with a presence sensor that feeds `occupied`, a buzzer, and "when occupied, beep". */
function withReaction(when = "occupied"): { fed: Federation; reaction: string } {
  const fed = cloneFederation(baseline());
  const device = addDevice(fed, "room2", simulatedInfo)!;
  const presence = addSensor(fed, "room2", device, simulatedInfo, sensorKind("simulated", "presence")!)!;
  addSensor(fed, "room2", device, simulatedInfo, sensorKind("simulated", "buzzer")!);
  delete fed.models.room2.objects.occupancy.bindings.occupied;
  linkParameter(fed, "room2", presence, "detected", "occupancy.occupied");
  const reaction = addReaction(fed, "room2", {
    input: "occupancy.occupied",
    when,
    target: "buzzer",
    operation: "beep",
    args: { duration: 150 },
  })!;
  return { fed, reaction };
}

const occupied = (value: unknown) => ({ "room2#occupancy.occupied": value === undefined ? {} : { value } });

describe("a reaction in the model", () => {
  it("is an object of the DT model that refers to what it observes and to what acts", () => {
    const { fed, reaction } = withReaction();
    const type = fed.models["room2@1"];
    expect(reaction).toBe("occupied_beep");
    expect(type.eClasses.OccupiedBeep.instanceOf).toBe("Reaction");
    expect(Object.keys(type.eClasses.OccupiedBeep.eAttributes)).toEqual(["when", "operation", "duration"]);
    expect(type.eClasses.OccupiedBeep.eReferences.input.eType).toBe("Occupancy");
    expect(type.eClasses.OccupiedBeep.eReferences.target.eType).toBe("Buzzer");
    expect(fed.models.room2.objects[reaction].slots).toEqual({
      input: "occupancy",
      target: "buzzer",
      when: "occupied",
      operation: "beep",
      duration: 150,
    });
    expect(gateFor(fed, "room2")).toEqual([]);
    expect(reactionsOf(fed, "room2")).toEqual([
      {
        model: "room2",
        id: "occupied_beep",
        input: "occupancy",
        types: { occupied: "EBoolean" },
        when: "occupied",
        target: "buzzer",
        operation: "beep",
        args: { duration: 150 },
      },
    ]);
    expect(actorOf(fed, reactionsOf(fed, "room2")[0])?.part.id).toBe("buzzer");
  });

  it("is saved as a version like any other change", () => {
    const repo = newRepo();
    const { fed } = withReaction();
    settle(repo, "room2", { kind: "edit", files: extract(fed, "room2") }, { decision: "accept" });
    expect(repo.changes("room2", 2)).toContain("+room2.occupied_beep:OccupiedBeep {");
    expect(reactionsOf(repo.federation(), "room2")).toHaveLength(1);
  });

  it.each([
    ["a condition that is not Boolean", (f: Federation): void => void (f.models.room2.objects.occupied_beep.slots.when = "occupied + 1"), "invalid condition"],
    ["a condition on an attribute the input does not have", (f: Federation): void => void (f.models.room2.objects.occupied_beep.slots.when = "count > 3"), "has no attribute count"],
    ["no condition", (f: Federation): void => void (f.models.room2.objects.occupied_beep.slots.when = ""), "no condition"],
    ["an operation the target does not have", (f: Federation): void => void (f.models.room2.objects.occupied_beep.slots.operation = "explode"), "no operation 'explode'"],
    ["an argument of the wrong type", (f: Federation): void => void (f.models.room2.objects.occupied_beep.slots.duration = 0.5), "duration must be EInt"],
    ["a missing argument", (f: Federation): void => void delete f.models.room2.objects.occupied_beep.slots.duration, "duration is missing"],
    ["a target that is not a part of a device", (f: Federation): void => void delete f.models.room2.objects.buzzer.slots.device, "not a part of a device"],
  ] as const)("the gate rejects %s", (_, change, message) => {
    const { fed } = withReaction();
    change(fed);
    const issues = gateFor(fed, "room2").filter((i) => i.check === "reaction" || i.check === "O0->O1");
    expect(issues.some((i) => i.message.includes(message))).toBe(true);
  });

  it("can read a number: the condition is any Boolean expression over the input", () => {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room2", simulatedInfo)!;
    addSensor(fed, "room2", device, simulatedInfo, sensorKind("simulated", "buzzer")!);
    fed.models["room2@1"].eClasses.Occupancy.eAttributes.level = {
      name: "level",
      eType: "EInt",
      unit: "ppm",
      meaning: null,
      upperBound: 1,
    };
    fed.models.room2.objects.occupancy.slots.level = 0;
    addReaction(fed, "room2", { input: "occupancy.level", when: "level > 1000 and occupied", target: "buzzer", operation: "beep", args: { duration: 1 } });
    expect(gateFor(fed, "room2")).toEqual([]);
    const [reaction] = reactionsOf(fed, "room2");
    const at = (level: number, present: boolean) => ({
      "room2#occupancy.level": { value: level },
      "room2#occupancy.occupied": { value: present },
    });
    expect(holds(reaction, at(1200, true))).toBe(true);
    expect(holds(reaction, at(1200, false))).toBe(false);
    expect(holds(reaction, at(800, true))).toBe(false);
  });

  it("offers to add the concept to shared concepts that lack it", () => {
    const fed = cloneFederation(baseline());
    delete fed.models.core.eClasses.Reaction;
    expect(hasConcept(fed, "reaction")).toBe(false);
    expect(addReaction(fed, "room2", { input: "occupancy.occupied", when: "occupied", target: "x", operation: "y", args: {} })).toBeNull();
    expect(ensureConcept(fed, "reaction")).toBe("core");
    expect(fed.models.core.eClasses.Reaction.properties).toEqual({ dependent: true, reaction: true });
    expect(hasConcept(fed, "reaction")).toBe(true);
  });
});

describe("when a reaction fires", () => {
  const reactions = () => reactionsOf(withReaction().fed, "room2");

  it("fires when its condition becomes true", () => {
    expect(fire(reactions(), occupied(false), occupied(true)).map((r) => r.id)).toEqual(["occupied_beep"]);
  });

  it("does not fire while the condition stays true, stays false, or becomes false", () => {
    expect(fire(reactions(), occupied(true), occupied(true))).toEqual([]);
    expect(fire(reactions(), occupied(false), occupied(false))).toEqual([]);
    expect(fire(reactions(), occupied(true), occupied(false))).toEqual([]);
  });

  it("takes a first reading as the reference: nothing fires for what is already true", () => {
    expect(fire(reactions(), {}, occupied(true))).toEqual([]);
  });

  it("fires again once the condition has been false in between", () => {
    const steps = [false, true, true, false, true].map(occupied);
    const fired = steps.slice(1).map((now, i) => fire(reactions(), steps[i], now).length);
    expect(fired).toEqual([1, 0, 0, 1]);
  });

  it("does not fire on a value that is missing or failed", () => {
    const failed = { "room2#occupancy.occupied": { error: "the sensor does not answer" } };
    expect(fire(reactions(), occupied(false), failed)).toEqual([]);
    expect(fire(reactions(), failed, occupied(true))).toEqual([]);
    expect(holds(reactions()[0], failed)).toBeUndefined();
  });

  it("goes from the sensor to the buzzer through the model", async () => {
    const { fed } = withReaction();
    const [device] = devicesOf(fed, "room2");
    const presence = device.sensors.find((part) => part.kind === "presence")!;
    const read = async (value: string) => {
      presence.settings.value = value;
      return liveValues(fed, { room2: await readDevice(device) });
    };
    const calls = simulatedCalls.length;
    const before = await read("false");
    const now = await read("true");
    for (const reaction of fire(reactionsOf(fed, "room2"), before, now)) {
      const actor = actorOf(fed, reaction)!;
      await invokeOperation(actor.device, actor.part.id, reaction.operation, reaction.args);
    }
    expect(simulatedCalls.slice(calls)).toEqual([{ part: "buzzer", operation: "beep", args: { duration: 150 } }]);
  });

  it("lets a reaction of an initiating DT observe what it receives from another DT", () => {
    const { fed } = withReaction();
    const device = addDevice(fed, "building", simulatedInfo)!;
    addSensor(fed, "building", device, simulatedInfo, sensorKind("simulated", "buzzer")!);
    addReaction(fed, "building", { input: "occupancy_r2.occupied", when: "occupied", target: "buzzer", operation: "beep", args: { duration: 50 } });
    expect(gateFor(fed, "building")).toEqual([]);
    const values = (present: boolean) =>
      liveValues(fed, { room2: [{ sensor: "presence2", parameter: "detected", key: "detected", value: present }] });
    expect(fire(reactionsOf(fed, "building"), values(false), values(true)).map((r) => r.id)).toEqual(["occupied_beep"]);
  });
});

describe("a reaction and drift", () => {
  it("is affected, like any dependent element, when what it observes loses its data", async () => {
    const repo = newRepo();
    const { fed } = withReaction();
    settle(repo, "room2", { kind: "edit", files: extract(fed, "room2") }, { decision: "accept" });
    const head = repo.federation();
    const [device] = devicesOf(head, "room2");
    device.sensors.find((part) => part.kind === "presence")!.settings.value = "fail";
    const batch = toBatch(head, "room2", await readDevice(device), 100);
    const result = runTrigger(repo.versions(), "room2", { kind: "observations", batch })!;
    expect(result.impact.links.map((l) => l.ends.target)).toContain("room2#occupied_beep");
  });
});
