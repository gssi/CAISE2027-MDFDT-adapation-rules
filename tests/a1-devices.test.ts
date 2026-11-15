/**
 * A1 with a device in the model: the motion detector of Room 1 is replaced by
 * an NFC reader that counts people from taps. The change comes from the
 * device, bottom-up, and reaches Building, which did not change.
 */
import { describe, expect, it } from "vitest";

import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import { addDevice, addReaction, addSensor } from "@/components/workbench/edits";
import { type ProcessResult } from "@/engine/assistant/process";
import { devicesOf, toBatch, type AttachedPart, type Reading } from "@/engine/devices";
import { findLink } from "@/engine/federation";
import { extract, gateFor } from "@/engine/modelset";
import { liveValues } from "@/engine/runtime/live";
import { reactionsOf } from "@/engine/runtime/reactions";
import { HOLDS, checkCorrespondences } from "@/engine/weaving/checks";
import { linksOfType } from "@/engine/weaving/model";
import { type Repository } from "@/server/repository";
import { settle } from "@/server/settle";

import { newRepo, run } from "./helpers";

const tinkerforge = connectorInfo("tinkerforge")!;
const kind = (name: string) => sensorKind("tinkerforge", name)!;

/** Room 1 as it is modelled on the hardware: motion feeds the occupancy, and a beep follows. */
function modelled(): Repository {
  const repo = newRepo();
  const fed = repo.federation();
  const device = addDevice(fed, "room1", tinkerforge, { host: "192.0.2.10" })!;
  addSensor(fed, "room1", device, tinkerforge, kind("motion_detector_v2"), "Mot1");
  addSensor(fed, "room1", device, tinkerforge, kind("piezo_speaker_v2"), "Spk1");
  fed.models.room1.objects.occupancy.bindings = { occupied: "motion_detected" };
  delete fed.capabilities.room1.occupied;
  addReaction(fed, "room1", {
    input: "occupancy.occupied",
    when: "occupied",
    target: "piezo_speaker_v2",
    operation: "beep",
    args: { frequency: 1000, volume: 1, duration: 200 },
  });
  settle(repo, "room1", { kind: "edit", files: extract(fed, "room1") }, { decision: "accept" });
  // Building has nothing to decide: what it uses of Room 1 is still there, with the same meaning.
  return repo;
}

/** What the device reports once the motion detector is gone and an NFC reader is attached. */
function replaced(repo: Repository) {
  const head = repo.federation();
  const readings: Reading[] = [
    { sensor: "motion_detector_v2", parameter: "motion_detected", key: "motion_detected", error: "does not answer" },
  ];
  const attached: AttachedPart[] = [{ device: "tinkerforge_device", uid: "Nfc1", kind: kind("nfc") }];
  return toBatch(head, "room1", readings, 100, attached);
}

const observed = (repo: Repository): ProcessResult => run(repo, "room1", { kind: "observations", batch: replaced(repo) });

describe("A1 on a device, in the model of Room 1", () => {
  it("reports what is gone and what is attached and not in the model", () => {
    const batch = replaced(modelled());
    expect(Object.keys(batch.capabilities ?? {})).toEqual(["count"]);
    expect(batch.capabilities?.count).toMatchObject({
      eType: "EInt",
      unit: "person",
      meaning: "people-count",
      observation: "PeopleCount",
      part: { device: "tinkerforge_device", uid: "Nfc1", parameter: "count" },
    });
  });

  it("does not report a part the model already has", () => {
    const repo = modelled();
    const head = repo.federation();
    const batch = toBatch(head, "room1", [], 100, [{ device: "tinkerforge_device", uid: "Mot1", kind: kind("motion_detector_v2") }]);
    expect(Object.keys(batch.capabilities ?? {})).toEqual(["motion_detected"]);
  });

  it("step 1 and 2: a change at data level, bottom-up drift, and the version that follows", () => {
    const result = observed(modelled());
    expect([result.changeset.originDT, result.changeset.originLevel]).toEqual(["Room 1", "data"]);
    expect(new Set(result.changeset.changes.map((c) => `${c.kind} ${c.element}`))).toEqual(
      new Set(["removed room1@data#motion_detected", "added room1@data#count"]),
    );
    expect(new Set(linksOfType(result.drift, "VerticalDrift").map((l) => l.props.origin))).toEqual(new Set(["bottom-up"]));
    expect(result.drift.props.proposedEvolution).toMatchObject({
      type: "room1",
      from: 2,
      to: 3,
      replaces: ["Occupancy -> PeopleCount", "MotionDetectorV2 -> Nfc"],
    });

    const type = result.candidate.models["room1@3"];
    expect(Object.keys(type.eClasses)).toEqual(
      expect.arrayContaining(["TinkerforgeDevice", "PiezoSpeakerV2", "Nfc", "PeopleCount", "OccupiedBeep"]),
    );
    expect(type.eClasses.MotionDetectorV2).toBeUndefined();
    expect(type.eClasses.Occupancy).toBeUndefined();
    expect(type.eClasses.PeopleCount.eAttributes.count).toMatchObject({ eType: "EInt", unit: "person" });
    expect(type.eClasses.PeopleCount.eReferences.source.eType).toBe("Nfc");
    expect(Object.keys(type.eClasses.Nfc.eOperations ?? {})).toEqual(["reset"]);

    const objects = result.candidate.models.room1.objects;
    expect(objects.motion_detector_v2).toBeUndefined();
    expect(objects.nfc).toMatchObject({ instanceOf: "Nfc", bindings: { count: "count" }, slots: { uid: "Nfc1" } });
    expect(objects.people_count).toMatchObject({ bindings: { count: "count" }, slots: { source: "nfc" } });
    // the sensor of the model provides the key now: the DT no longer has to report it
    expect(result.candidate.capabilities.room1).toEqual({});
    expect(devicesOf(result.candidate, "room1")[0].sensors.map((part) => part.kind)).toEqual(["piezo_speaker_v2", "nfc"]);
  });

  it("step 2 and 3: Building, which did not change, is in drift and affected", () => {
    const result = observed(modelled());
    const horizontal = linksOfType(result.drift, "HorizontalDrift");
    expect(horizontal.map((h) => [h.props.status, h.props.correspondence])).toEqual([["broken", "c-r1-occupancy"]]);
    const targets = result.impact.links.map((l) => l.ends.target);
    expect(targets).toEqual(expect.arrayContaining(["building#occupancy_r1.occupied", "building#policy"]));
    // and so is the reaction of Room 1, which observes the occupancy
    expect(targets).toContain("room1#occupied_beep");
    expect(result.plan.resolutions.map((r) => [r.owner, r.options[0].kind])).toEqual([["building", "derive"]]);
  });

  it("the reaction follows what it observed, and the gate asks for its condition to be reviewed", () => {
    const result = observed(modelled());
    const [reaction] = reactionsOf(result.candidate, "room1");
    expect([reaction.input, reaction.target]).toEqual(["people_count", "piezo_speaker_v2"]);
    expect(gateFor(result.candidate, "room1").map((i) => [i.check, i.message])).toEqual([
      ["reaction", "people_count has no attribute occupied"],
    ]);
  });

  it("the modeler reviews the reaction and Room 1 gets its next version", () => {
    const repo = modelled();
    const proposed = observed(repo).candidate;
    proposed.models.room1.objects.occupied_beep.slots.when = "count > 0";
    expect(gateFor(proposed, "room1")).toEqual([]);
    // committed as the modeler's edit of the proposal
    expect(settle(repo, "room1", { kind: "edit", files: extract(proposed, "room1") }, { decision: "accept" })).toBe(3);
    const changes = repo.changes("room1", 3);
    expect(changes).toContain("+room1.Nfc:EClass {");
    expect(changes).toContain("-room1.MotionDetectorV2:EClass {");
    expect(changes).toContain("+    when: count > 0");
  });
});

describe("A1 on a device, in the model of Building", () => {
  function afterRoom1(): Repository {
    const repo = modelled();
    const proposed = observed(repo).candidate;
    proposed.models.room1.objects.occupied_beep.slots.when = "count > 0";
    settle(repo, "room1", { kind: "edit", files: extract(proposed, "room1") }, { decision: "accept" });
    return repo;
  }

  it("the new version of Room 1 arrives as horizontal drift, resolved by deriving the occupancy from the count", () => {
    const repo = afterRoom1();
    const incoming = run(repo, "building", { kind: "incoming" });
    const options = incoming.plan.resolutions[0].options;
    expect(options.map((o) => [o.id, o.kind, o.automatic])).toEqual([
      ["a", "derive", true],
      ["b", "adapt", false],
    ]);
    expect(options[0].params).toMatchObject({ participating: "room1#people_count.count", mapping: "count > 0" });

    settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "a" });
    const fed = repo.federation();
    expect(checkCorrespondences(fed).every((s) => s.status === HOLDS)).toBe(true);
    expect(findLink(fed, "c-r1-occupancy")?.props.mapping).toBe("count > 0");

    // live: one person taps in, and Building sees the room as occupied
    const taps = (count: number) =>
      liveValues(fed, { room1: [{ sensor: "nfc", parameter: "count", key: "count", value: count }] });
    expect(taps(1)["building#occupancy_r1.occupied"]).toEqual({ value: true });
    expect(taps(0)["building#occupancy_r1.occupied"]).toEqual({ value: false });
  });
});
