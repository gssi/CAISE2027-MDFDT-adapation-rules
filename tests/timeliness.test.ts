/** Timeliness is checked at runtime and re-enters the process as a change. */
import { describe, expect, it } from "vitest";

import { type Trigger } from "@/engine/assistant/session";
import { project } from "@/engine/runtime/projection";
import { checkTimeliness, emit } from "@/engine/runtime/simulator";
import { PENDING, checkCorrespondences, gate, validateWModel } from "@/engine/weaving/checks";
import { linksOfType } from "@/engine/weaving/model";
import { settle } from "@/server/settle";

import { afterBind, run } from "./helpers";

const room2 = (timestamp: number) => emit("room2", { count: 1, occupied: true }, timestamp);

describe("timeliness", () => {
  it("timely observations raise nothing", () => {
    const config = project(afterBind().federation());
    expect(checkTimeliness(config, [emit("room1", { count: 3 }, 100), room2(104)], 110)).toEqual([]);
  });

  it("a stale observation violates the maximum age", () => {
    const config = project(afterBind().federation());
    const violations = checkTimeliness(config, [emit("room1", { count: 3 }, 100), room2(20)], 110);
    expect(new Set(violations.map((v) => `${v.violation} ${v.correspondence}`))).toEqual(
      new Set(["maxAge c-r2-occupancy", "maxAge c-r2-count"]),
    );
  });

  it("unsynchronized observations violate the tolerance", () => {
    const config = project(afterBind().federation());
    const violations = checkTimeliness(config, [emit("room1", { count: 3 }, 100), room2(80)], 110);
    expect(new Set(violations.map((v) => v.violation))).toEqual(new Set(["syncTolerance"]));
    expect(new Set(violations.map((v) => v.source))).toEqual(new Set(["room2@data#occupied", "room2@data#count"]));
  });

  it("a violation re-enters the process, in the model of the initiating DT", () => {
    const repo = afterBind();
    const trigger: Trigger = { kind: "timeliness", batches: [emit("room1", { count: 3 }, 100), room2(20)], now: 110 };
    const result = run(repo, "building", trigger);

    expect(result.changeset.trigger).toBe("timeliness_violation");
    expect([result.changeset.originDT, result.changeset.originLevel]).toEqual(["Room 2", "data"]);
    expect(new Set(linksOfType(result.drift, "HorizontalDrift").map((h) => h.props.status))).toEqual(new Set(["broken"]));
    expect(linksOfType(result.drift, "VerticalDrift")).toEqual([]);
    expect(validateWModel(result.candidate, result.drift)).toEqual([]);
    expect(result.impact.links.map((l) => l.ends.target)).toEqual(
      expect.arrayContaining(["building#policy", "building#total", "building#safety"]),
    );
    for (const resolution of result.plan.resolutions) {
      expect(resolution.options.map((o) => o.kind)).toEqual(["change_request"]);
    }

    const before = repo.head("room2");
    settle(repo, "building", trigger, { decision: "accept", option: "a" });
    expect(repo.head("room2")).toBe(before);
    const fed = repo.federation();
    expect(gate(fed)).toEqual([]);
    const statuses = Object.fromEntries(checkCorrespondences(fed).map((s) => [s.correspondence, s.status]));
    expect(statuses["c-r2-count"]).toBe(PENDING);
    expect(statuses["c-r2-occupancy"]).toBe(PENDING);
    const dependents = Object.fromEntries(
      (project(fed).dts.building.dependents as { element: string; status: string }[]).map((d) => [d.element, d.status]),
    );
    expect(dependents).toEqual({
      "building#policy": "scoped",
      "building#total": "scoped",
      "building#safety": "scoped",
    });
  });
});
