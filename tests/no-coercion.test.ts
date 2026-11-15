/** Hard requirement: occupied = true is never interpreted as count = 1. */
import { describe, expect, it } from "vitest";

import { findLink } from "@/engine/federation";
import { MappingError, evaluate, inferType } from "@/engine/mapping";
import { withWorkingCopy } from "@/engine/assistant/session";
import { project } from "@/engine/runtime/projection";
import { emit, receive } from "@/engine/runtime/simulator";
import { BROKEN, checkCorrespondences } from "@/engine/weaving/checks";
import { GateError } from "@/server/repository";

import { a2Edit, afterA1, afterA2, runA2 } from "./helpers";

const BOOLEAN_TO_NUMBER = [
  "occupied + 0",
  "occupied * 1",
  "1",
  "-occupied",
  "occupied > 0",
  "1 if occupied else 0",
  "int(occupied)",
  "occupied ? 1 : 0",
];

describe("no value coercion across meanings", () => {
  it.each(BOOLEAN_TO_NUMBER)("no mapping turns a Boolean into a number: %s", (expression) => {
    expect(() => inferType(expression, "occupied", "EBoolean")).toThrow(MappingError);
  });

  it("a Boolean mapping stays Boolean", () => {
    expect(inferType("occupied", "occupied", "EBoolean")).toBe("EBoolean");
    expect(inferType("not occupied", "occupied", "EBoolean")).toBe("EBoolean");
  });

  it("the admitted direction loses information", () => {
    expect(inferType("count > 0", "count", "EInt")).toBe("EBoolean");
    expect(evaluate("count > 0", "count", "EInt", 3)).toBe(true);
    expect(evaluate("count > 0", "count", "EInt", 0)).toBe(false);
    expect(() => evaluate("count > 0", "count", "EInt", true)).toThrow(MappingError);
  });

  const mappings = [null, "occupied", "occupied + 0", "1"];
  const cases = mappings.flatMap((mapping) => [false, true].map((rule) => ({ mapping, rule })));

  // A2, with the modeler of Building trying to feed the count from the occupancy of Room 2.
  it.each(cases)("the gate rejects occupancy as count ($mapping, rule: $rule)", ({ mapping, rule }) => {
    const repo = afterA1();
    const working = withWorkingCopy(repo.versions(), "building", a2Edit(repo));
    const link = findLink(working, "c-r2-count")!;
    link.ends.participating = "room2#occupancy.occupied";
    link.props.expects = { typeVersion: "room2@1", eType: "EBoolean", meaning: "occupancy" };
    if (mapping) link.props.mapping = mapping;
    if (rule) {
      // even an explicitly admitted derivation cannot go this way
      working.derivations.push({ source: "occupancy", target: "people-count", expression: mapping ?? "value" });
    }
    const status = checkCorrespondences(working).find((s) => s.correspondence === "c-r2-count");
    expect(status?.status).toBe(BROKEN);
    expect(() => repo.commit("building", working, "coercion")).toThrow(GateError);
  });

  it("the planner never proposes occupancy as count", () => {
    for (const resolution of runA2(afterA1()).plan.resolutions) {
      for (const option of resolution.options) {
        expect(option.kind).toBe("change_request");
        expect(String(option.params.participating ?? "")).not.toContain("occupancy");
      }
    }
  });

  it("the runtime never delivers occupancy as count", () => {
    const config = project(afterA2().federation());
    const received = receive(config, [emit("room1", { count: 2 }, 10), emit("room2", { occupied: true }, 10)]);
    expect(received["building#occupancy_r2.occupied"]).toBe(true);
    expect(received["building#count_r1.count"]).toBe(2);
    expect("building#count_r2.count" in received).toBe(false);
  });
});
