/**
 * The widths of the two side panes of the workbench, around the diagram.
 * Pure: the workbench keeps them in state, the modeler drags the handles.
 */
export interface Panes {
  /** Models and versions, on the left. */
  left: number;
  /** Properties, checks, changes, process, runtime and YAML, on the right. */
  right: number;
}

export type Side = keyof Panes;

export const DEFAULT_PANES: Panes = { left: 224, right: 496 };
/** Below these a pane no longer shows its content whole. */
export const MIN_PANE: Panes = { left: 168, right: 320 };
/** What the diagram keeps, whatever the panes ask for. */
export const MIN_CENTER = 280;
/** The width of a handle between two panes. */
export const HANDLE = 9;
/** One press of an arrow key on a handle; five times as much with Shift. */
export const STEP = 16;

/** The widest `side` can be in a workbench `total` wide, the other pane as it is. */
export function maxPane(panes: Panes, side: Side, total: number): number {
  const other = side === "left" ? panes.right : panes.left;
  return Math.max(MIN_PANE[side], total - other - MIN_CENTER - 2 * HANDLE);
}

/** `side` set to `width`, kept between what its content needs and what the diagram leaves. */
export function resizePane(panes: Panes, side: Side, width: number, total: number): Panes {
  const clamped = Math.min(Math.max(Math.round(width), MIN_PANE[side]), maxPane(panes, side, total));
  return clamped === panes[side] ? panes : { ...panes, [side]: clamped };
}

/**
 * The panes as they fit a workbench `total` wide: a window made narrower takes
 * from the right pane first, then from the left one, never from below their minimum.
 * With no width known yet (`total` 0) the panes are returned as they are.
 */
export function fitPanes(panes: Panes, total: number): Panes {
  let left = Math.max(panes.left, MIN_PANE.left);
  let right = Math.max(panes.right, MIN_PANE.right);
  if (total > 0) {
    let excess = left + right + MIN_CENTER + 2 * HANDLE - total;
    if (excess > 0) {
      const fromRight = Math.min(excess, right - MIN_PANE.right);
      right -= fromRight;
      excess -= fromRight;
      left -= Math.min(excess, left - MIN_PANE.left);
    }
  }
  return left === panes.left && right === panes.right ? panes : { left, right };
}

/** Panes read back from where a browser kept them; anything else gives the defaults. */
export function parsePanes(text: string | null): Panes {
  try {
    const data: unknown = JSON.parse(text ?? "");
    if (typeof data === "object" && data !== null) {
      const { left, right } = data as Record<string, unknown>;
      if (typeof left === "number" && typeof right === "number" && Number.isFinite(left) && Number.isFinite(right)) {
        return fitPanes({ left: Math.round(left), right: Math.round(right) }, 0);
      }
    }
  } catch {
    // not JSON: the defaults
  }
  return DEFAULT_PANES;
}
