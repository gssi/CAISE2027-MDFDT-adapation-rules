/**
 * A1: a participating DT evolves (Room 1 replaces its sensor). With a model per
 * DT this takes two decisions: Room 1 accepts its next version, then Building,
 * which did not change, finds its correspondence broken and adapts.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { PlanError } from "@/engine/assistant/adaptation";
import { incomingDrift } from "@/engine/assistant/session";
import { findLink } from "@/engine/federation";
import { gateFor } from "@/engine/modelset";
import { project } from "@/engine/runtime/projection";
import { emit, receive } from "@/engine/runtime/simulator";
import { HOLDS, checkCorrespondences, gate, validateWModel } from "@/engine/weaving/checks";
import { linksOfType } from "@/engine/weaving/model";
import { settle } from "@/server/settle";

import { a1Batch, afterA1, afterRoom1Evolves, newRepo, run } from "./helpers";

const observed = () => ({ kind: "observations" as const, batch: a1Batch() });

describe("A1, in the model of Room 1", () => {
  it("step 1: change set", () => {
    const { changeset } = run(newRepo(), "room1", observed());
    expect(changeset.trigger).toBe("runtime_observation");
    expect([changeset.originDT, changeset.origin, changeset.originLevel]).toEqual(["Room 1", "room1", "data"]);
    expect(new Set(changeset.changes.map((c) => `${c.kind} ${c.element}`))).toEqual(
      new Set(["added room1@data#count", "removed room1@data#occupied"]),
    );
  });

  it("step 2: classified drift", () => {
    const result = run(newRepo(), "room1", observed());
    const vertical = linksOfType(result.drift, "VerticalDrift");
    expect(new Set(vertical.map((l) => l.props.origin))).toEqual(new Set(["bottom-up"]));
    expect(new Set(vertical.map((l) => `${l.ends.lower} ${l.ends.upper}`))).toEqual(
      new Set(["room1@data#occupied room1@1#Occupancy.occupied", "room1@data#count room1@1"]),
    );
    expect(result.drift.props.proposedEvolution).toEqual({
      type: "room1",
      from: 1,
      to: 2,
      instance: "room1",
      replaces: ["Occupancy -> PeopleCount", "Presence -> PeopleCounter"],
    });
    const proposed = result.candidate.models["room1@2"];
    expect(new Set(Object.keys(proposed.eClasses))).toEqual(new Set(["PeopleCounter", "PeopleCount"]));
    expect(proposed.eClasses.PeopleCount.eAttributes.count.eType).toBe("EInt");
    // the type of Room 2 is another model: nothing proposes to change it
    expect(result.candidate.models["room2@2"]).toBeUndefined();

    const horizontal = linksOfType(result.drift, "HorizontalDrift");
    expect(horizontal.map((h) => [h.props.status, h.props.correspondence])).toEqual([["broken", "c-r1-occupancy"]]);
    expect(result.drift.props.holding).toEqual(["c-r2-occupancy"]);
    expect(validateWModel(result.candidate, result.drift)).toEqual([]);
    expect(validateWModel(result.candidate, result.impact)).toEqual([]);
  });

  it("step 3: the impact reaches Building, not Room 2", () => {
    const { impact } = run(newRepo(), "room1", observed());
    const targets = impact.links.map((l) => l.ends.target);
    expect(targets).toEqual(expect.arrayContaining(["building#occupancy_r1.occupied", "building#policy"]));
    expect(new Set(impact.props.affectedDTs)).toEqual(new Set(["Building", "Room 1"]));
    expect(impact.props.unaffectedDTs).toEqual(["Room 2"]);
    expect(new Set(impact.links.map((l) => l.props.direction))).toEqual(new Set(["peer", "vertical"]));
  });

  it("step 4: the correspondence is for the modeler of Building to resolve", () => {
    const { plan } = run(newRepo(), "room1", observed());
    expect(plan.resolutions.map((r) => [r.owner, r.correspondence])).toEqual([["building", "c-r1-occupancy"]]);
    expect(plan.interim.map((i) => [i.element, i.behaviour])).toEqual([["building#policy", "exclude_input"]]);
  });

  it("the assistant never commits; a rejection leaves the model as it was", () => {
    const repo = newRepo();
    run(repo, "room1", observed());
    expect(repo.head("room1")).toBe(1);
    expect(settle(repo, "room1", observed(), { decision: "reject" })).toBeNull();
    expect(repo.head("room1")).toBe(1);
  });

  it("refuses a report that comes from another DT", () => {
    expect(() => settle(newRepo(), "room2", observed(), { decision: "accept" })).toThrow(PlanError);
  });

  it("accepting commits Room 1 alone, and leaves Building in drift", () => {
    const repo = afterRoom1Evolves();
    expect(repo.models().map((m) => repo.head(m))).toEqual([1, 2, 1, 1]);
    const fed = repo.federation();
    expect(fed.models.room1.typedBy).toBe("room1@2");
    expect(Object.keys(fed.models.room1.objects)).toEqual(["people_count", "people_counter"]);
    expect(fed.models.room2.typedBy).toBe("room2@1");
    expect(gateFor(fed, "room1")).toEqual([]);
    expect(gateFor(fed, "room2")).toEqual([]);
    expect(gateFor(fed, "building").map((i) => i.check)).toEqual(["correspondence:broken"]);
    const dir = repo.versionDir("room1", 2);
    expect(fs.existsSync(path.join(dir, "process", "4-adaptation-plan.yaml"))).toBe(true);
    expect(fs.existsSync(path.join(dir, "process", "5-decision.yaml"))).toBe(true);
    expect(repo.changes("room1", 2)).toContain("+room1.PeopleCount:EClass {");
  });
});

describe("A1, in the model of Building", () => {
  it("the evolution of Room 1 arrives as horizontal drift", () => {
    const repo = afterRoom1Evolves();
    const result = run(repo, "building", { kind: "incoming" });
    expect(result.changeset.originDT).toBe("Room 1");
    expect(linksOfType(result.drift, "VerticalDrift")).toEqual([]);
    const horizontal = linksOfType(result.drift, "HorizontalDrift");
    expect(horizontal.map((h) => [h.props.status, h.props.correspondence])).toEqual([["broken", "c-r1-occupancy"]]);
    expect(horizontal[0].props.reasons.some((r: string) => r.includes("expects room1@1"))).toBe(true);
    const options = result.plan.resolutions[0].options;
    expect(options.map((o) => [o.id, o.kind, o.automatic])).toEqual([
      ["a", "derive", true],
      ["b", "adapt", false],
    ]);
    expect(options[0].params.mapping).toBe("count > 0");
    expect(options[0].params.participating).toBe("room1#people_count.count");
    expect(options[1].description).toContain("Building");
  });

  it("adapt needs the modeler", () => {
    const repo = afterRoom1Evolves();
    expect(() => settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "b" })).toThrow(
      PlanError,
    );
    expect(repo.head("building")).toBe(1);
  });

  it("accepting the derivation commits Building alone and ends the drift", () => {
    const repo = afterA1();
    expect(repo.models().map((m) => repo.head(m))).toEqual([1, 2, 1, 2]);
    const fed = repo.federation();
    expect(gate(fed)).toEqual([]);
    expect(checkCorrespondences(fed).every((s) => s.status === HOLDS)).toBe(true);
    const link = findLink(fed, "c-r1-occupancy")!;
    expect(link.props.mapping).toBe("count > 0");
    expect(link.props.expects.typeVersion).toBe("room1@2");
    expect(fed.models.building.typedBy).toBe("building@2");
    expect(repo.info("building", 2).context).toEqual({ core: 1, room1: 2, room2: 1 });
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
    expect(repo.changes("building", 2)).toContain("+    mapping: count > 0");

    // Projection: the policy is evaluable again, from regenerated configuration.
    const config = project(fed);
    expect(config.dts.room1.emits[0].key).toBe("count");
    expect(config.dts.building.dependents[0].status).toBe("active");
    expect(receive(config, [a1Batch(), emit("room2", { occupied: false }, 100)])).toEqual({
      "building#occupancy_r1.occupied": true,
      "building#occupancy_r2.occupied": false,
    });
  });
});
