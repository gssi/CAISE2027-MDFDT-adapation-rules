/**
 * The walk on simulated devices (docs/walk.md): from version 1 of every model
 * to a federation that has drifted and been brought back, one decision at a
 * time. Every step is taken from the files shipped under `scenarios/building/walk-*`,
 * as the modeler takes it with **Apply** and **Send to the modeling layer**.
 */
import path from "node:path";
import { describe, expect, it } from "vitest";

import { type ObservationBatch } from "@/engine/assistant/change";
import { BOTTOM_UP, HORIZONTAL, TOP_DOWN, VERTICAL } from "@/engine/assistant/drift";
import { type ProcessResult } from "@/engine/assistant/process";
import { incomingDrift, type Trigger } from "@/engine/assistant/session";
import { applyEdit, asNextVersion, extract, gateFor } from "@/engine/modelset";
import { HOLDS, checkCorrespondences } from "@/engine/weaving/checks";
import { linksOfType } from "@/engine/weaving/model";
import { GateError, readDir, type Repository } from "@/server/repository";
import { settle } from "@/server/settle";

import { SCENARIO, newRepo, readYaml, run } from "./helpers";

/** The working copy of `model` with the edits of the steps applied, in order. */
function applied(repo: Repository, model: string, ...steps: string[]): Trigger {
  let fed = repo.federation();
  for (const step of steps) fed = applyEdit(fed, model, readDir(path.join(SCENARIO, step, "edit", model)));
  return { kind: "edit", files: extract(fed, model) };
}

const reported = (step: string): Trigger => ({
  kind: "observations",
  batch: readYaml<ObservationBatch>(SCENARIO, step, "observations.yaml"),
});

const vertical = (result: ProcessResult) => linksOfType(result.drift, VERTICAL).map((l) => [l.props.origin, l.ends.lower]);
const horizontal = (result: ProcessResult) => linksOfType(result.drift, HORIZONTAL).map((l) => l.props.correspondence);
/** Whether what the modeler would commit passes the gate of the model. */
const gate = (repo: Repository, model: string, result: ProcessResult) =>
  gateFor(asNextVersion(result.candidate, result.head, model, (repo.head(model) ?? 0) + 1), model);
const save = (repo: Repository, model: string, trigger: Trigger) => settle(repo, model, trigger, { decision: "edit" });

/** Steps 1 to 3: the rooms change how they sense. */
function sensing(): Repository {
  const repo = newRepo();
  save(repo, "room1", applied(repo, "room1", "walk-1-room1-presence"));
  save(repo, "room1", applied(repo, "room1", "walk-2-room1-indicator"));
  save(repo, "room2", applied(repo, "room2", "walk-3-room2-presence"));
  return repo;
}

/** Steps 4a and 4b: Room 1 counts people, and is committed. */
function room1Counts(): Repository {
  const repo = sensing();
  save(repo, "room1", applied(repo, "room1", "walk-4a-room1-type", "walk-4b-room1-instance"));
  return repo;
}

/** Step 5b: Room 2 follows its data, and is committed. */
function bothCount(): Repository {
  const repo = room1Counts();
  save(repo, "room2", applied(repo, "room2", "walk-5-room2-count"));
  return repo;
}

describe("steps 1, 2, 3: a room changes how it senses", () => {
  it("is no drift, for the room or for Building", () => {
    const repo = newRepo();
    for (const [model, step] of [
      ["room1", "walk-1-room1-presence"],
      ["room1", "walk-2-room1-indicator"],
      ["room2", "walk-3-room2-presence"],
    ]) {
      const trigger = applied(repo, model, step);
      const result = run(repo, model, trigger);
      expect(result.drift.links).toEqual([]);
      expect(result.impact.links).toEqual([]);
      expect(result.plan.resolutions).toEqual([]);
      save(repo, model, trigger);
    }
    expect([repo.head("room1"), repo.head("room2"), repo.head("building")]).toEqual([3, 2, 1]);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
    const room1 = repo.federation().models.room1;
    expect(room1.objects.occupancy.bindings).toEqual({ occupied: "detected" });
    expect(Object.values(room1.objects).filter((o) => o.slots.operation === "set")).toHaveLength(2);
  });
});

describe("step 4: the same change, seen from the data", () => {
  it("is vertical drift, bottom-up, and breaks the correspondence of Building", () => {
    const repo = sensing();
    const result = run(repo, "room1", reported("walk-4-room1-from-data"));
    expect(result.changeset.trigger).toBe("runtime_observation");
    expect(vertical(result)).toEqual([
      [BOTTOM_UP, "room1@data#detected"],
      [BOTTOM_UP, "room1@data#count"],
    ]);
    expect(horizontal(result)).toEqual(["c-r1-occupancy"]);
    expect(result.drift.props.proposedEvolution).toMatchObject({ from: 3, to: 4 });
    // for Building to decide: derive the Boolean from the count, or consume the count
    const [resolution] = result.plan.resolutions;
    expect(resolution.owner).toBe("building");
    expect(resolution.options.map((o) => o.kind)).toEqual(["derive", "adapt"]);
    expect(resolution.options[0].description).toMatch(/count > 0/);
  });

  it("proposes a version that does not pass its checks: the reactions still read occupied", () => {
    const repo = sensing();
    const trigger = reported("walk-4-room1-from-data");
    expect(gate(repo, "room1", run(repo, "room1", trigger)).length).toBeGreaterThan(0);
    expect(() => settle(repo, "room1", trigger, { decision: "accept" })).toThrow(GateError);
    expect(repo.head("room1")).toBe(3);
  });
});

describe("step 4a: the type of Room 1 changes, alone", () => {
  it("is vertical drift, top-down, and cannot be committed", () => {
    const repo = sensing();
    const trigger = applied(repo, "room1", "walk-4a-room1-type");
    const result = run(repo, "room1", trigger);
    expect(result.changeset.originLevel).toBe("O1");
    expect(vertical(result)).toEqual([[TOP_DOWN, "room1#occupancy.occupied"]]);
    expect(linksOfType(result.drift, VERTICAL)[0].props.reasons).toEqual([
      "key 'detected' provides EBoolean, the type expects EInt",
    ]);
    expect(horizontal(result)).toEqual(["c-r1-occupancy"]);
    expect(gate(repo, "room1", result).length).toBeGreaterThan(0);
    expect(() => save(repo, "room1", trigger)).toThrow(GateError);
  });
});

describe("step 4b: the instance follows", () => {
  it("leaves the horizontal drift alone, and Room 1 is committed", () => {
    const repo = sensing();
    const trigger = applied(repo, "room1", "walk-4a-room1-type", "walk-4b-room1-instance");
    const result = run(repo, "room1", trigger);
    expect(vertical(result)).toEqual([]);
    expect(horizontal(result)).toEqual(["c-r1-occupancy"]);
    expect(result.plan.resolutions[0].options.map((o) => o.kind)).toEqual(["change_request"]);
    expect(result.plan.interim.map((i) => [i.element, i.behaviour])).toEqual([["building#policy", "exclude_input"]]);
    expect(gate(repo, "room1", result)).toEqual([]);
    save(repo, "room1", trigger);
    expect(repo.head("room1")).toBe(4);
    expect(incomingDrift(repo.versions(), "building")).not.toBeNull();
  });
});

describe("steps 5a and 5b: Room 2 reports something else, and its model follows", () => {
  it("is vertical drift, bottom-up, while the data are ahead of the model", () => {
    const repo = room1Counts();
    const result = run(repo, "room2", reported("walk-5-room2-count"));
    expect(vertical(result)).toEqual([
      [BOTTOM_UP, "room2@data#detected"],
      [BOTTOM_UP, "room2@data#count"],
    ]);
    expect(horizontal(result).sort()).toEqual(["c-r1-occupancy", "c-r2-occupancy"]);
  });

  it("is horizontal drift on both correspondences once the model follows", () => {
    const repo = room1Counts();
    const trigger = applied(repo, "room2", "walk-5-room2-count");
    const result = run(repo, "room2", trigger);
    expect(vertical(result)).toEqual([]);
    expect(horizontal(result).sort()).toEqual(["c-r1-occupancy", "c-r2-occupancy"]);
    save(repo, "room2", trigger);
    expect(repo.head("room2")).toBe(3);
  });
});

describe("step 6: Building decides", () => {
  it("derives the occupancy from the count on both correspondences, and the drift is resolved", () => {
    const repo = bothCount();
    const result = run(repo, "building", { kind: "incoming" });
    expect(result.plan.resolutions.map((r) => [r.correspondence, r.options.map((o) => o.kind)])).toEqual([
      ["c-r1-occupancy", ["derive", "adapt"]],
      ["c-r2-occupancy", ["derive", "adapt"]],
    ]);
    settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "a" });
    expect(repo.head("building")).toBe(2);
    const fed = repo.federation();
    expect(checkCorrespondences(fed).map((s) => s.status)).toEqual([HOLDS, HOLDS]);
    expect(gateFor(fed, "building")).toEqual([]);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
    // no value coercion across meanings: the count is read through the mapping
    const link = fed.weaving["building-weaving"]?.links.find((l) => l.id === "c-r1-occupancy");
    expect(link?.props.mapping).toBe("occupied > 0");
  });
});
