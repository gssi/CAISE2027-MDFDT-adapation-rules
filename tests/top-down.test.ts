/**
 * Top-down vertical drift: the type of a DT evolves and what its instance
 * holds does not follow yet.
 */
import { describe, expect, it } from "vitest";

import { cloneFederation } from "@/engine/federation";
import { extract, gateFor } from "@/engine/modelset";

import { newRepo, run } from "./helpers";

const typeOnly = (repo: ReturnType<typeof newRepo>) => {
  const fed = cloneFederation(repo.federation());
  const occupied = fed.models["room1@1"].eClasses.Occupancy.eAttributes.occupied;
  Object.assign(occupied, { eType: "EInt", unit: "person", meaning: "people-count" });
  return { kind: "edit" as const, files: extract(fed, "room1") };
};

describe("top-down vertical drift", () => {
  it("is what an instance holds against its evolved type", () => {
    const repo = newRepo();
    const result = run(repo, "room1", typeOnly(repo));
    const vertical = result.drift.links.filter((l) => l.type === "VerticalDrift");
    expect(vertical.map((l) => [l.props.origin, l.ends.upper, l.ends.lower, l.props.reasons])).toEqual([
      ["top-down", "room1@1#Occupancy.occupied", "room1#occupancy.occupied", ["key 'occupied' provides EBoolean, the type expects EInt"]],
    ]);
    // the same change reaches Building as horizontal drift, and the gate refuses the version
    expect(result.drift.links.filter((l) => l.type === "HorizontalDrift").map((l) => l.props.correspondence)).toEqual(["c-r1-occupancy"]);
    expect(gateFor(result.candidate, "room1").map((i) => i.check)).toContain("O0->data");
  });

  it("is not raised when type and instance change together", () => {
    const repo = newRepo();
    const fed = cloneFederation(repo.federation());
    fed.models["room1@1"].eClasses.Occupancy.eAttributes.occupied.meaning = "presence";
    const result = run(repo, "room1", { kind: "edit", files: extract(fed, "room1") });
    expect(result.drift.links.filter((l) => l.type === "VerticalDrift")).toEqual([]);
  });
});
