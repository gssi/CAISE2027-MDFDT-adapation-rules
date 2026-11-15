"use client";

import { useRef } from "react";

import { STEP } from "./panes";

/**
 * The handle between two panes: dragged, or moved with the arrow keys, it
 * changes the width of the pane on its `side`. A double click, or Enter, gives
 * that pane its default width back.
 */
export function Splitter(props: {
  /** The pane this handle resizes: the one on the left of it, or on the right. */
  side: "left" | "right";
  label: string;
  value: number;
  min: number;
  max: number;
  onResize: (width: number) => void;
  onReset: () => void;
}) {
  const { side, value, onResize } = props;
  const drag = useRef<{ x: number; width: number } | null>(null);
  const frame = useRef(0);
  // dragging to the right widens the left pane and narrows the right one
  const sign = side === "left" ? 1 : -1;

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={props.label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
      tabIndex={0}
      title="Drag to resize; double-click for the default width"
      className="group relative z-10 cursor-col-resize touch-none select-none outline-none"
      onPointerDown={(event) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, width: value };
        event.preventDefault(); // no text selection while dragging
        event.currentTarget.focus(); // which also keeps the handle from taking the focus by itself
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start) return;
        const width = start.width + sign * (event.clientX - start.x);
        // one update per frame: the diagram lays itself out again at every width
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => onResize(width));
      }}
      onPointerUp={(event) => {
        drag.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onDoubleClick={props.onReset}
      onKeyDown={(event) => {
        const step = event.shiftKey ? STEP * 5 : STEP;
        if (event.key === "ArrowLeft") onResize(value - sign * step);
        else if (event.key === "ArrowRight") onResize(value + sign * step);
        else if (event.key === "Home") onResize(props.min);
        else if (event.key === "End") onResize(props.max);
        else if (event.key === "Enter") props.onReset();
        else return;
        event.preventDefault();
      }}
    >
      {/* wider than it looks, so it is easy to grab */}
      <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-[width,background-color] group-hover:w-1 group-hover:bg-ring group-focus-visible:w-1 group-focus-visible:bg-ring group-active:w-1 group-active:bg-ring" />
    </div>
  );
}
