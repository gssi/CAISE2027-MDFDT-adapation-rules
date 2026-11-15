/** A0: one model per DT, each passing its own gate; no drift. */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { incomingDrift } from "@/engine/assistant/session";
import { checkConformance } from "@/engine/conformance";
import { dependents, findLink } from "@/engine/federation";
import { targets } from "@/engine/kernel/model";
import { assemble, extract, gateFor, modelIds, wovenBy } from "@/engine/modelset";
import { BROKEN, HOLDS, checkCorrespondences, gate, validateWeaving } from "@/engine/weaving/checks";
import { GateError, Repository } from "@/server/repository";

import { baseline, newRepo, scenarioModels, tempDir } from "./helpers";

describe("A0 baseline", () => {
  it("has one model per DT, and only the concepts in common", () => {
    const fed = baseline();
    expect(modelIds(fed)).toEqual(["building", "core", "room1", "room2"]);
    expect(fed.models.core.level).toBe("O2");
    expect(fed.models.room1.typedBy).toBe("room1@1");
    expect(fed.models.room2.typedBy).toBe("room2@1");
    expect(fed.models["room1@1"].eClasses.Occupancy.instanceOf).toBe("Observation");
    expect(targets(fed.models.building.objects.policy, "inputs")).toEqual(["occupancy_r1", "occupancy_r2"]);
    expect(wovenBy(fed, "building")).toEqual(["room1", "room2"]);
    expect(wovenBy(fed, "room1")).toEqual([]);
  });

  it("takes a model apart into its own files and puts it together again", () => {
    const fed = baseline();
    const again = assemble(modelIds(fed).map((model) => ({ model, version: 1, files: extract(fed, model) })));
    expect(again).toEqual(fed);
    expect(Object.keys(extract(fed, "building")).sort()).toEqual([
      "capabilities.yaml",
      "instance.mlm.yaml",
      "type.mlm.yaml",
      "weaving.wm.yaml",
    ]);
  });

  it("passes all checks, model by model", () => {
    const fed = baseline();
    expect(checkConformance(fed)).toEqual([]);
    expect(validateWeaving(fed)).toEqual([]);
    const statuses = checkCorrespondences(fed);
    expect(statuses.map((s) => s.correspondence)).toEqual(["c-r1-occupancy", "c-r2-occupancy"]);
    expect(statuses.every((s) => s.status === HOLDS)).toBe(true);
    expect(gate(fed)).toEqual([]);
    for (const model of modelIds(fed)) expect(gateFor(fed, model)).toEqual([]);
  });

  it("derives the dependencies from the model", () => {
    const fed = baseline();
    expect(dependents(fed, fed.models.building, "occupancy_r1").map(([obj]) => obj.name)).toEqual(["policy"]);
  });

  it("starts a repository with a version of its own for every model", () => {
    const repo = newRepo();
    expect(repo.models()).toEqual(["core", "room1", "room2", "building"]);
    for (const model of repo.models()) expect(repo.head(model)).toBe(1);
    expect(repo.info("building", 1).context).toEqual({ core: 1, room1: 1, room2: 1 });
    expect(gate(repo.federation())).toEqual([]);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
    expect(fs.existsSync(path.join(repo.versionDir("room1", 1), "type.mlm.yaml"))).toBe(true);
  });

  it("rejects a non-conforming instance, and only for the model it belongs to", () => {
    const fed = baseline();
    fed.models.room1.objects.occupancy.instanceOf = "PeopleCount";
    expect(gateFor(fed, "room1").some((i) => i.check === "O0->O1")).toBe(true);
    expect(gateFor(fed, "room2")).toEqual([]);
    const repo = new Repository(tempDir());
    expect(() => repo.commit("room1", fed, "broken")).toThrow(GateError);
  });

  it("rejects a type that does not conform to O2", () => {
    const fed = baseline();
    fed.models["room1@1"].eClasses.Occupancy.instanceOf = "Measurement";
    expect(gateFor(fed, "room1").some((i) => i.check === "O1->O2")).toBe(true);
  });

  it("rejects a binding without a capability", () => {
    const fed = baseline();
    delete fed.capabilities.room1.occupied;
    expect(gateFor(fed, "room1").some((i) => i.check === "O0->data")).toBe(true);
  });

  it("checks a correspondence in the model that owns it", () => {
    const fed = baseline();
    const link = findLink(fed, "c-r1-occupancy")!;
    link.props.expects.typeVersion = "room1@2";
    link.props.expects.eType = "EInt";
    const status = checkCorrespondences(fed)[0];
    expect(status.status).toBe(BROKEN);
    expect(status.reasons).toHaveLength(2);
    expect(gateFor(fed, "building").map((i) => i.check)).toEqual(["correspondence:broken"]);
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("requires a correspondence to be a peer relation", () => {
    const fed = baseline();
    findLink(fed, "c-r1-occupancy")!.ends.participating = "room1@1#Occupancy.occupied";
    expect(gateFor(fed, "building").some((i) => i.message.includes("peer"))).toBe(true);
  });

  it("reads the models of the scenario from one folder each", () => {
    expect(scenarioModels().map((m) => m.model).sort()).toEqual(["building", "core", "room1", "room2"]);
  });
});
