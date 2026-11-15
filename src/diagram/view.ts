/** Pan and zoom of a diagram, as pure functions. */

export interface View {
  k: number; // scale
  x: number; // translation, in screen pixels
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export const K_MIN = 0.3;
export const K_MAX = 1.25;
/** Below this scale the text is unreadable: the diagram is panned instead of shrunk. */
export const K_FIT_MIN = 0.6;

/** The view that shows the whole diagram, centred, as large as allowed. A
 * diagram too large to stay readable starts at its top-left corner. */
export function fitView(bounds: Size, size: Size, margin = 16, kMin = K_FIT_MIN, kMax = K_MAX): View {
  const free = { width: Math.max(1, size.width - 2 * margin), height: Math.max(1, size.height - 2 * margin) };
  const k = Math.min(kMax, Math.max(kMin, Math.min(free.width / bounds.width, free.height / bounds.height)));
  return {
    k,
    x: Math.max(margin, (size.width - bounds.width * k) / 2),
    y: Math.max(margin, (size.height - bounds.height * k) / 2),
  };
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The view that shows the whole diagram and leaves the top-right corner of the
 * canvas free where something is laid over it (the zoom buttons). The diagram
 * takes the whole canvas when none of its `shapes` would end up under that
 * corner; otherwise it is fitted below it.
 */
export function fitClear(bounds: Size, size: Size, shapes: Box[], corner: Size, margin = 16): View {
  const view = fitView(bounds, size, margin);
  if (corner.width <= 0 || corner.height <= 0 || corner.height >= size.height) return view;
  const left = size.width - corner.width;
  const covered = shapes.some((s) => view.x + (s.x + s.w) * view.k > left && view.y + s.y * view.k < corner.height);
  if (!covered) return view;
  const lower = fitView(bounds, { width: size.width, height: size.height - corner.height }, margin);
  return { ...lower, y: lower.y + corner.height };
}

/** Zoom by `factor` around the screen point `at` (the canvas centre for the buttons). */
export function zoomView(
  view: View,
  factor: number,
  at: { x: number; y: number },
  kMin = K_MIN,
  kMax = K_MAX,
): View {
  const k = Math.min(kMax, Math.max(kMin, view.k * factor));
  const ratio = k / view.k;
  return { k, x: at.x - (at.x - view.x) * ratio, y: at.y - (at.y - view.y) * ratio };
}
