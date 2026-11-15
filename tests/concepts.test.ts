/**
 * The shared concepts are a model like the others: its modeler adds, renames
 * and removes concepts. A commit of the concepts never changes the model of a
 * DT. A DT whose type instantiates a concept that is gone is in vertical drift,
 * top-down, until its own modeler follows.
 */
import { describe, expect, it } from "vitest";

import { incomingDrift } from "@/engine/assistant/session";
import { TOP_DOWN, VERTICAL } from "@/engine/assistant/drift";
import { type Federation } from "@/engine/federation";
import { removeConcept, renameConcept } from "@/engine/modeling/rename";
import { extract, gateFor } from "@/engine/modelset";
import { linksOfType } from "@/engine/weaving/model";
import { type Repository } from "@/server/repository";
import { settle } from "@/server/settle";

import { newRepo, run } from "./helpers";

/** The modeler of the concepts edits them and accepts: the next version of `core`. */
function commitConcepts(repo: Repository, change: (fed: Federation) => void) {
  const fed = repo.federation();
  change(fed);
  const trigger = { kind: "edit" as const, files: extract(fed, "core") };
  const result = run(repo, "core", trigger);
  settle(repo, "core", trigger, { decision: "accept" });
  return result;
}

const rename = (fed: Federation) => expect(renameConcept(fed, "core", "Observation", "Measurement")).toBeNull();
const vertical = (drift: Parameters<typeof linksOfType>[0]) => linksOfType(drift, VERTICAL);

describe("a new concept", () => {
  it("is committed and reaches no DT as drift", () => {
    const repo = newRepo();
    const result = commitConcepts(repo, (fed) => {
      fed.models.core.eClasses.Zone = { name: "Zone", instanceOf: null, eAttributes: {}, eReferences: {}, properties: {} };
    });
    expect(result.changeset.originLevel).toBe("O2");
    expect(result.drift.links).toEqual([]);
    expect(repo.head("core")).toBe(2);
    for (const model of ["room1", "room2", "building"]) expect(incomingDrift(repo.versions(), model)).toBeNull();
  });
});

describe("a concept renamed while DT types instantiate it", () => {
  it("touches the concepts alone", () => {
    const fed = newRepo().federation();
    rename(fed);
    expect(Object.keys(fed.models.core.eClasses)).toContain("Measurement");
    expect(fed.models["room1@1"].eClasses.Occupancy.instanceOf).toBe("Observation");
    expect(renameConcept(fed, "core", "Measurement", "Entity")).toMatch(/already used/);
  });

  it("is vertical drift, top-down, in every DT that uses it, with its impact and a plan for their modelers", () => {
    const repo = newRepo();
    const result = commitConcepts(repo, rename);
    const drift = vertical(result.drift);
    expect(drift.map((l) => l.ends.lower).sort()).toEqual([
      "building@1#RoomOccupancy",
      "room1@1#Occupancy",
      "room2@1#Occupancy",
    ]);
    for (const link of drift) {
      expect(link.props.origin).toBe(TOP_DOWN);
      expect(link.ends.upper).toBe("core#Observation");
    }
    // the objects of those classes, and what depends on them
    const affected = result.impact.links.map((l) => l.ends.target);
    expect(affected).toEqual(expect.arrayContaining(["room1#occupancy", "building#occupancy_r1", "building#policy"]));
    expect(result.impact.props.affectedDTs).toEqual(["Room 1", "Room 2", "Building"]);
    // one resolution per class, owned by the model of its DT
    expect(result.plan.resolutions.map((r) => [r.owner, r.element, r.options[0].kind, r.options[0].automatic]).sort()).toEqual([
      ["building", "building@1#RoomOccupancy", "adapt", true],
      ["room1", "room1@1#Occupancy", "adapt", true],
      ["room2", "room2@1#Occupancy", "adapt", true],
    ]);
  });

  it("is committed for the concepts and leaves every DT model as it was", () => {
    const repo = newRepo();
    commitConcepts(repo, rename);
    expect(repo.head("core")).toBe(2);
    for (const model of ["room1", "room2", "building"]) expect(repo.head(model)).toBe(1);
    const fed = repo.federation();
    expect(fed.models["room1@1"].eClasses.Occupancy.instanceOf).toBe("Observation");
    expect(gateFor(fed, "room1").map((i) => i.check)).toEqual(["O1->O2"]);
  });

  it("reaches each DT, whose modeler follows with a version of its own model", () => {
    const repo = newRepo();
    commitConcepts(repo, rename);
    const incoming = run(repo, "room1", { kind: "incoming" });
    // a DT is shown its own vertical drift, not that of the others
    expect(vertical(incoming.drift).map((l) => l.ends.lower)).toEqual(["room1@1#Occupancy"]);
    const mine = incoming.plan.resolutions.filter((r) => r.owner === "room1");
    expect(mine).toHaveLength(1);
    expect(mine[0].options[0].description).toBe(
      "retype room1@1#Occupancy to Measurement: the concept Observation is now Measurement",
    );

    settle(repo, "room1", { kind: "incoming" }, { decision: "accept", option: "a" });
    expect(repo.head("room1")).toBe(2);
    const fed = repo.federation();
    expect(fed.models["room1@2"].eClasses.Occupancy.instanceOf).toBe("Measurement");
    expect(gateFor(fed, "room1")).toEqual([]);
    expect(incomingDrift(repo.versions(), "room1")).toBeNull();
    // the others are still to follow
    expect(incomingDrift(repo.versions(), "room2")).not.toBeNull();
    expect(repo.head("room2")).toBe(1);
  });
});

describe("a concept removed while DT types instantiate it", () => {
  it("leaves the choice of another concept to the modeler of each DT", () => {
    const repo = newRepo();
    const result = commitConcepts(repo, (fed) => void delete fed.models.core.eClasses.Rule);
    expect(vertical(result.drift).map((l) => l.ends.lower)).toEqual(["building@1#LightingVentilationPolicy"]);
    const [resolution] = result.plan.resolutions;
    expect(resolution.owner).toBe("building");
    expect(resolution.options.map((o) => [o.kind, o.automatic])).toEqual([["adapt", false]]);
    expect(incomingDrift(repo.versions(), "room1")).toBeNull();
    expect(incomingDrift(repo.versions(), "building")).not.toBeNull();

    // the modeler of Building gives the class another concept, by hand
    const fed = repo.federation();
    fed.models["building@1"].eClasses.LightingVentilationPolicy.instanceOf = "Indicator";
    settle(repo, "building", { kind: "edit", files: extract(fed, "building") }, { decision: "edit" });
    expect(repo.head("building")).toBe(2);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
  });
});

describe("the relations between concepts", () => {
  const issues = (fed: Federation, model: string) => gateFor(fed, model).map((i) => `${i.element}: ${i.message}`);

  it("admit the references the DT types of the scenario state", () => {
    const fed = newRepo().federation();
    expect(Object.keys(fed.models.core.eClasses.Observation.eReferences)).toEqual(["source", "sensor"]);
    for (const model of ["room1", "room2", "building"]) expect(gateFor(fed, model)).toEqual([]);
  });

  it("refuse a reference between classes whose concepts are not related", () => {
    const fed = newRepo().federation();
    // an entity does not refer to an observation
    fed.models["room1@1"].eClasses.Presence.eReferences.shows = {
      name: "shows",
      eType: "Occupancy",
      lowerBound: 0,
      upperBound: 1,
      containment: false,
    };
    expect(issues(fed, "room1")).toEqual(["room1@1#Presence.shows: no relation of core leads from Entity to Observation"]);
  });

  it("refuse a reference of another kind or beyond the multiplicity of its relation", () => {
    const fed = newRepo().federation();
    const source = fed.models["room1@1"].eClasses.Occupancy.eReferences.source;
    source.upperBound = -1;
    expect(issues(fed, "room1")[0]).toBe(
      "room1@1#Occupancy.source: an Observation relates to an Entity as source (reference, at most 1), not as reference, many",
    );
    source.upperBound = 1;
    source.containment = true;
    expect(issues(fed, "room1")[0]).toMatch(/not as containment, at most 1$/);
  });

  it("require a reference of every class of a concept, when the relation has a minimum", () => {
    const fed = newRepo().federation();
    fed.models.core.eClasses.Entity.eReferences.parts.lowerBound = 1;
    expect(issues(fed, "room1")).toEqual(["room1@1#Presence: an Entity needs a reference to an Entity (parts)"]);
    expect(issues(fed, "building")).toEqual(["building@1#Room: an Entity needs a reference to an Entity (parts)"]);
  });

  it("constrain nothing when the concepts state no relation", () => {
    const fed = newRepo().federation();
    for (const concept of Object.values(fed.models.core.eClasses)) concept.eReferences = {};
    fed.models["room1@1"].eClasses.Presence.eReferences.shows = {
      name: "shows",
      eType: "Occupancy",
      lowerBound: 0,
      upperBound: 1,
      containment: false,
    };
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("lead to concepts of the same model: the gate of the concepts refuses one that does not", () => {
    const fed = newRepo().federation();
    delete fed.models.core.eClasses.Sensor;
    expect(issues(fed, "core")).toEqual([
      "core#Observation.sensor: the relation leads to 'Sensor', which is not a concept of core",
      "core#Reaction.sensor: the relation leads to 'Sensor', which is not a concept of core",
    ]);
  });

  it("follow a concept that is renamed, and go with one that is removed", () => {
    const fed = newRepo().federation();
    rename(fed);
    expect(fed.models.core.eClasses.Rule.eReferences.inputs.eType).toBe("Measurement");
    removeConcept(fed, "core", "Sensor");
    expect(Object.keys(fed.models.core.eClasses.Measurement.eReferences)).toEqual(["source"]);
    expect(gateFor(fed, "core")).toEqual([]);
  });

  it("put a DT in drift, top-down, when a relation its type uses is removed", () => {
    const repo = newRepo();
    const result = commitConcepts(repo, (fed) => void delete fed.models.core.eClasses.Rule.eReferences.inputs);
    const drift = vertical(result.drift);
    expect(drift.map((l) => [l.ends.upper, l.ends.lower, l.props.origin])).toEqual([
      ["core#Rule", "building@1#LightingVentilationPolicy.inputs", TOP_DOWN],
    ]);
    expect(result.impact.links.map((l) => l.ends.target)).toContain("building#policy");
    expect(result.plan.resolutions.map((r) => [r.owner, r.options[0].kind, r.options[0].automatic])).toEqual([
      ["building", "adapt", false],
    ]);
    expect(repo.head("core")).toBe(2);
    expect(incomingDrift(repo.versions(), "building")).not.toBeNull();
    expect(incomingDrift(repo.versions(), "room1")).toBeNull();
  });
});
