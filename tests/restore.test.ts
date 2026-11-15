/**
 * Going back to an earlier version of a model: the versions after it leave the
 * repository, and a model that was committed against one of them goes back first.
 */
import fs from "node:fs";

import { describe, expect, it } from "vitest";

import { restoreBlockers } from "@/engine/assistant/session";
import { settle } from "@/server/settle";

import { a1Batch, afterA1, afterRoom1Evolves, newRepo } from "./helpers";

describe("restoring a version", () => {
  it("makes it current again and removes the versions after it", () => {
    const repo = afterRoom1Evolves();
    const before = repo.read("room1", 1).files;
    expect(repo.head("room1")).toBe(2);

    expect(repo.restore("room1", 1)).toEqual([2]);

    expect(repo.head("room1")).toBe(1);
    expect(fs.existsSync(repo.versionDir("room1", 2))).toBe(false);
    expect(repo.history("room1").map((info) => info.id)).toEqual([1]);
    expect(repo.read("room1", 1).files).toEqual(before);
    expect(repo.head("building")).toBe(1);
  });

  it("is refused while another model was committed against a removed version", () => {
    const repo = afterA1();
    expect(restoreBlockers(repo.versions(), "room1", 1)).toEqual([{ model: "building", version: 2, against: 2 }]);
    expect(() => repo.restore("room1", 1)).toThrow(/building v2 was committed against room1 v2/);
    expect(repo.head("room1")).toBe(2);
    expect(fs.existsSync(repo.versionDir("room1", 2))).toBe(true);
  });

  it("goes through in the reverse order of the commits", () => {
    const repo = afterA1();
    repo.restore("building", 1);
    repo.restore("room1", 1);
    expect([repo.head("room1"), repo.head("building")]).toEqual([1, 1]);
    // The scenario can be played again from there, with the same version numbers and nothing stale.
    settle(repo, "room1", { kind: "observations", batch: a1Batch() }, { decision: "accept", message: "again" });
    expect(repo.info("room1", 2).message).toBe("again");
    expect(repo.federation().weaving).toBeDefined();
  });

  it("only goes back, to a version that exists", () => {
    const repo = newRepo();
    expect(() => repo.restore("room1", 1)).toThrow(/no version 1 before/);
    expect(() => repo.restore("room1", 0)).toThrow();
    expect(() => repo.restore("nobody", 1)).toThrow(/unknown model/);
  });
});
