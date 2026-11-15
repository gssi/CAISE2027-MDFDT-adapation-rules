/** A2: the initiating DT evolves (Building needs a people count per room). */
import { describe, expect, it } from "vitest";

import { incomingRequests } from "@/engine/assistant/adaptation";
import { incomingDrift } from "@/engine/assistant/session";
import { findLink } from "@/engine/federation";
import { gateFor } from "@/engine/modelset";
import { project } from "@/engine/runtime/projection";
import { emit, receive } from "@/engine/runtime/simulator";
import { HOLDS, PENDING, checkCorrespondences, gate, validateWModel } from "@/engine/weaving/checks";
import { linksOfType } from "@/engine/weaving/model";
import { settle } from "@/server/settle";

import { HIDDEN_COUNT, a2Trigger, afterA1, afterA2, afterBind, run, runA2 } from "./helpers";

describe("A2 new count requirement", () => {
  it("step 1: change set", () => {
    const { changeset } = runA2(afterA1());
    expect(changeset.trigger).toBe("model_edit");
    expect([changeset.originDT, changeset.origin, changeset.originLevel]).toEqual(["Building", "building@2", "O1"]);
    expect(new Set(changeset.changes.map((c) => c.level))).toEqual(new Set(["O1", "O0", "weaving"]));
  });

  it("step 2: classified drift", () => {
    const result = runA2(afterA1());
    const vertical = linksOfType(result.drift, "VerticalDrift");
    expect(vertical.map((v) => [v.props.origin, v.props.dt])).toEqual([["top-down", "Building"]]);
    expect(vertical[0].ends).toEqual({ upper: "building@2#RoomCount.count", lower: "building#count_r2.count" });
    const horizontal = linksOfType(result.drift, "HorizontalDrift");
    expect(horizontal.map((h) => [h.props.status, h.props.correspondence])).toEqual([["missing", "c-r2-count"]]);
    expect(horizontal[0].ends.participating).toBe("room2");
    expect(result.drift.props.holding).toContain("c-r1-count");
    expect(validateWModel(result.candidate, result.drift)).toEqual([]);
  });

  it("step 3: impact report", () => {
    const { impact } = runA2(afterA1());
    const targets = impact.links.map((l) => l.ends.target);
    expect(targets).toEqual(
      expect.arrayContaining(["building#count_r2.count", "building#total", "building#safety"]),
    );
    expect(targets).not.toContain("building#policy");
    expect(impact.props.unaffectedDTs).toEqual(["Room 1"]);
  });

  it("without the capability the plan is a change request", () => {
    const repo = afterA1();
    const options = runA2(repo).plan.resolutions[0].options;
    expect(options.map((o) => [o.id, o.kind])).toEqual([["a", "change_request"]]);
    expect(options[0].params.request).toContain("new data source in room2");
    expect(options[0].params.interim).toEqual([
      { element: "building#total", behaviour: "exclude_input" },
      { element: "building#safety", behaviour: "exclude_input" },
    ]);

    expect(settle(repo, "building", a2Trigger(repo), { decision: "accept", option: "a" })).toBe(3);
    const fed = repo.federation();
    expect(gate(fed)).toEqual([]);
    expect(repo.head("room2")).toBe(1); // nobody but its modeler changes Room 2
    const statuses = Object.fromEntries(checkCorrespondences(fed).map((s) => [s.correspondence, s.status]));
    expect(statuses["c-r2-count"]).toBe(PENDING);
    expect(statuses["c-r1-count"]).toBe(HOLDS);

    // Room 2 sees the request, but the assistant has no version to propose.
    const requests = incomingRequests(fed, "room2");
    expect(requests.map((r) => [r.from, r.correspondence, r.proposal])).toEqual([["building", "c-r2-count", null]]);

    // In the meantime the goal is scoped to the rooms that provide a count.
    type State = { element: string; status: string; excluded?: string[] };
    const dependents = Object.fromEntries((project(fed).dts.building.dependents as State[]).map((d) => [d.element, d]));
    expect(dependents["building#total"].status).toBe("scoped");
    expect(dependents["building#total"].excluded).toEqual(["building#count_r2"]);
    expect(dependents["building#safety"].status).toBe("scoped");
    expect(dependents["building#policy"].status).toBe("active");
  });

  it("with a hidden capability the request comes with a version for Room 2 to accept", () => {
    const repo = afterA1(HIDDEN_COUNT);
    const options = runA2(repo).plan.resolutions[0].options;
    expect(options.map((o) => o.kind)).toEqual(["change_request"]);
    expect(options[0].params.request).toContain("model the observation key 'count' that room2 already provides");
    settle(repo, "building", a2Trigger(repo), { decision: "accept", option: "a" });

    const [request] = incomingRequests(repo.federation(), "room2");
    expect(request.from).toBe("building");
    expect(request.proposal).not.toBeNull();
    const proposed = run(repo, "room2", { kind: "request", correspondence: "c-r2-count" });
    expect(proposed.changeset.originDT).toBe("Room 2");
    expect(Object.keys(proposed.candidate.models["room2@2"].eClasses)).toEqual([
      "Presence",
      "Occupancy",
      "PeopleCount",
      "PeopleCounter",
    ]);
    expect(gateFor(proposed.candidate, "room2")).toEqual([]);
  });

  it("Room 2 accepts, then Building binds the count", () => {
    const repo = afterA2(HIDDEN_COUNT);
    expect(settle(repo, "room2", { kind: "request", correspondence: "c-r2-count" }, { decision: "accept" })).toBe(2);
    const room2 = repo.federation().models.room2;
    expect(room2.typedBy).toBe("room2@2");
    expect(room2.objects.people_count.bindings).toEqual({ count: "count" });
    expect(room2.objects.occupancy.bindings).toEqual({ occupied: "occupied" }); // what it had stays
    expect(repo.changes("room2", 2)).toContain("+room2.PeopleCount:EClass {");

    // For Building the new version of Room 2 brings one thing to decide: the
    // pending correspondence can now be bound. The occupancy it already used
    // is still there with the same meaning, so that correspondence holds.
    const incoming = run(repo, "building", { kind: "incoming" });
    expect(incoming.plan.resolutions.map((r) => [r.correspondence, r.options[0].kind, r.options[0].automatic])).toEqual([
      ["c-r2-count", "adapt", true],
    ]);
    expect(settle(repo, "building", { kind: "incoming" }, { decision: "accept", option: "a" })).toBe(4);
  });

  it("the variant ends with every correspondence holding", () => {
    const repo = afterBind();
    const fed = repo.federation();
    expect(gate(fed)).toEqual([]);
    expect(checkCorrespondences(fed).every((s) => s.status === HOLDS)).toBe(true);
    const count = findLink(fed, "c-r2-count")!;
    expect(count.ends.participating).toBe("room2#people_count.count");
    expect("mapping" in count.props).toBe(false);
    expect("status" in count.props).toBe(false);
    expect(incomingRequests(fed, "room2")).toEqual([]);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();

    const config = project(fed);
    expect((config.dts.building.dependents as { status: string }[]).every((d) => d.status === "active")).toBe(true);
    const received = receive(config, [
      emit("room1", { count: 3 }, 100),
      emit("room2", { count: 0, occupied: false }, 100),
    ]);
    expect(received["building#count_r2.count"]).toBe(0);
    expect(received["building#occupancy_r2.occupied"]).toBe(false);
  });
});
