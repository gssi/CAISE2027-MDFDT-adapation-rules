/** The widths of the side panes of the workbench, as the modeler resizes them. */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_PANES,
  HANDLE,
  MIN_CENTER,
  MIN_PANE,
  fitPanes,
  maxPane,
  parsePanes,
  resizePane,
} from "@/components/workbench/panes";

const WIDE = 1512;

describe("the side panes of the workbench", () => {
  it("takes the width the modeler drags a pane to", () => {
    expect(resizePane(DEFAULT_PANES, "left", 300, WIDE)).toEqual({ left: 300, right: DEFAULT_PANES.right });
    expect(resizePane(DEFAULT_PANES, "right", 700.4, WIDE)).toEqual({ left: DEFAULT_PANES.left, right: 700 });
  });

  it("keeps a pane wide enough for its content", () => {
    expect(resizePane(DEFAULT_PANES, "left", 10, WIDE).left).toBe(MIN_PANE.left);
    expect(resizePane(DEFAULT_PANES, "right", -50, WIDE).right).toBe(MIN_PANE.right);
  });

  it("leaves the diagram its room, whichever pane grows", () => {
    for (const side of ["left", "right"] as const) {
      const panes = resizePane(DEFAULT_PANES, side, 5000, WIDE);
      expect(panes[side]).toBe(maxPane(DEFAULT_PANES, side, WIDE));
      expect(WIDE - panes.left - panes.right - 2 * HANDLE).toBe(MIN_CENTER);
    }
  });

  it("returns the same panes when nothing changes, so nothing is drawn again", () => {
    expect(resizePane(DEFAULT_PANES, "left", DEFAULT_PANES.left, WIDE)).toBe(DEFAULT_PANES);
    expect(fitPanes(DEFAULT_PANES, WIDE)).toBe(DEFAULT_PANES);
    expect(fitPanes(DEFAULT_PANES, 0)).toBe(DEFAULT_PANES);
  });

  it("fits a narrower window by taking from the right pane first, then from the left", () => {
    const wide = { left: 400, right: 800 };
    const total = 1100;
    const fitted = fitPanes(wide, total);
    expect(fitted).toEqual({ left: 400, right: total - 400 - MIN_CENTER - 2 * HANDLE });
    const narrow = fitPanes(wide, 900);
    expect(narrow.right).toBe(MIN_PANE.right);
    expect(narrow.left).toBe(900 - MIN_PANE.right - MIN_CENTER - 2 * HANDLE);
    // narrower than everything at its minimum: the minimums, and the page scrolls
    expect(fitPanes(wide, 300)).toEqual(MIN_PANE);
  });

  it("never offers a maximum below the minimum", () => {
    expect(maxPane(DEFAULT_PANES, "left", 300)).toBe(MIN_PANE.left);
    expect(resizePane(DEFAULT_PANES, "right", 900, 300).right).toBe(MIN_PANE.right);
  });

  it("reads back what a browser kept, and falls back to the defaults", () => {
    expect(parsePanes(JSON.stringify({ left: 300, right: 640 }))).toEqual({ left: 300, right: 640 });
    expect(parsePanes(JSON.stringify({ left: 1, right: 2 }))).toEqual(MIN_PANE);
    for (const text of [null, "", "nonsense", "[]", JSON.stringify({ left: "a", right: 3 }), JSON.stringify({ left: 300 })]) {
      expect(parsePanes(text)).toBe(DEFAULT_PANES);
    }
  });
});
