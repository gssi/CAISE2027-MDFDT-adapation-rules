/**
 * A new version of a model a DT weaves is not drift in itself: a
 * correspondence holds as long as the element it uses is still there with the
 * type, unit and meaning it states. Drift is when that is no longer so.
 */
import { describe, expect, it } from "vitest";

import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import { incomingDrift } from "@/engine/assistant/session";
import { cloneFederation, findLink } from "@/engine/federation";
import { addDevice, addSensor, linkParameter } from "@/engine/modeling/parts";
import { extract, gateFor } from "@/engine/modelset";
import { BROKEN, HOLDS, checkCorrespondences } from "@/engine/weaving/checks";
import { settle } from "@/server/settle";

import { baseline, newRepo } from "./helpers";

const statusOf = (fed: ReturnType<typeof baseline>, id: string) =>
  checkCorrespondences(fed).find((status) => status.correspondence === id)!;

describe("a new version of a woven model", () => {
  it("leaves a correspondence valid when only the version it was verified against is older", () => {
    const fed = baseline();
    findLink(fed, "c-r1-occupancy")!.props.expects.typeVersion = "room1@7";
    expect(statusOf(fed, "c-r1-occupancy")).toMatchObject({ status: HOLDS, reasons: [] });
    expect(gateFor(fed, "building")).toEqual([]);
  });

  it("is not drift for the initiating DT when what it uses is unchanged", () => {
    const repo = newRepo();
    const fed = cloneFederation(repo.federation());
    const simulated = connectorInfo("simulated")!;
    const hub = addDevice(fed, "room2", simulated)!;
    const sensor = addSensor(fed, "room2", hub, simulated, sensorKind("simulated", "presence")!, "presence")!;
    linkParameter(fed, "room2", sensor, "detected", "occupancy.occupied");
    expect(settle(repo, "room2", { kind: "edit", files: extract(fed, "room2") }, { decision: "accept" })).toBe(2);

    const head = repo.federation();
    expect(head.models.room2.typedBy).toBe("room2@2");
    expect(findLink(head, "c-r2-occupancy")!.props.expects.typeVersion).toBe("room2@1");
    expect(statusOf(head, "c-r2-occupancy").status).toBe(HOLDS);
    expect(incomingDrift(repo.versions(), "building")).toBeNull();
    expect(gateFor(head, "building")).toEqual([]);
    expect(repo.head("building")).toBe(1);
  });

  it("is drift when the element no longer means what the correspondence states", () => {
    const repo = newRepo();
    const fed = cloneFederation(repo.federation());
    fed.models["room2@1"].eClasses.Occupancy.eAttributes.occupied.meaning = "door-open";
    fed.capabilities.room2.occupied.meaning = "door-open";
    settle(repo, "room2", { kind: "edit", files: extract(fed, "room2") }, { decision: "accept" });

    const status = statusOf(repo.federation(), "c-r2-occupancy");
    expect(status.status).toBe(BROKEN);
    // the version is said next to what is wrong, as context
    expect(status.reasons[0]).toBe("expects room2@1, but room2 conforms to room2@2");
    expect(status.reasons.join("; ")).toContain("expects meaning occupancy");
    const incoming = incomingDrift(repo.versions(), "building");
    expect(incoming?.drift.links.map((l) => l.props.correspondence)).toEqual(["c-r2-occupancy"]);
  });
});
