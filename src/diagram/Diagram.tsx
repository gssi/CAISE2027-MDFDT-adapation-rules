"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { TYPES, type GEdge, type GNode, type GraphSpec, type LaneId, type Mark } from "./graph";
import { NO_MANUAL, bandTarget, dropTarget, isManual, moveNode, sameRows, type Manual } from "./arrange";
import { layoutToFit, type LEdge, type Layout, type Point } from "./layout";
import { fitClear, zoomView, type Box, type View } from "./view";

const LANE: Record<LaneId, { color: string; soft: string; name: string }> = {
  O2: { color: "var(--l2)", soft: "var(--l2-soft)", name: "O2 · concepts" },
  O1: { color: "var(--l1)", soft: "var(--l1-soft)", name: "O1 · types" },
  O0: { color: "var(--l0)", soft: "var(--l0-soft)", name: "O0 · instances" },
  data: { color: "var(--ld)", soft: "var(--ld-soft)", name: "data" },
};

const MARK: Record<Mark, string> = {
  added: "var(--added)",
  removed: "var(--removed)",
  modified: "var(--modified)",
};

const TONE: Record<string, string> = {
  holds: "var(--ok)",
  broken: "var(--bad)",
  ambiguous: "var(--bad)",
  missing: "var(--warn)",
  pending: "var(--wait)",
  high: "var(--bad)",
  medium: "var(--warn)",
  low: "var(--wait)",
  vertical: "var(--bad)",
};

function styleOf(edge: GEdge): { stroke: string; dash?: string; width?: number } {
  switch (edge.kind) {
    case "typing":
      return { stroke: "#9ca3af", dash: "5 4" };
    case "reference":
      return { stroke: "#374151" };
    case "binding":
      return { stroke: "var(--ld)", dash: "2 4" };
    case "evolution":
      return { stroke: "var(--evo)", dash: "7 4" };
    case "representation":
      return { stroke: "#7c3aed", dash: edge.derived ? "2 4" : "8 3 2 3", width: edge.derived ? 1.5 : 1.75 };
    case "correspondence":
      return {
        // a correspondence this version changed is drawn as a change, when nothing is wrong with it
        stroke: edge.mark && edge.mark !== "removed" && (edge.tone ?? "holds") === "holds" ? MARK[edge.mark] : (TONE[edge.tone ?? "holds"] ?? "var(--ok)"),
        dash: edge.derived ? "2 4" : edge.tone === "pending" || edge.tone === "missing" ? "6 4" : edge.mark === "added" ? "6 3" : undefined,
        width: edge.derived ? 1.5 : edge.tone === "holds" && !edge.mark ? 1.75 : 2.25,
      };
    case "drift":
      return { stroke: "var(--bad)", width: 2.5 };
    case "impact":
      return { stroke: TONE[edge.tone ?? "low"] ?? "var(--warn)", dash: "3 3", width: 2 };
  }
}

/** An orthogonal path with rounded corners. */
function pathOf(points: Point[], radius = 6): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    const r = Math.min(radius, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
    const a = [x + Math.sign(px - x) * r, y + Math.sign(py - y) * r];
    const b = [x + Math.sign(nx - x) * r, y + Math.sign(ny - y) * r];
    d += ` L ${a[0]} ${a[1]} Q ${x} ${y} ${b[0]} ${b[1]}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last[0]} ${last[1]}`;
}

function arrowOf(points: Point[], open: boolean): { d: string; fill: boolean } {
  const [x, y] = points[points.length - 1];
  const [px, py] = points[points.length - 2];
  const length = Math.hypot(x - px, y - py) || 1;
  const ux = (x - px) / length;
  const uy = (y - py) / length;
  const size = 8;
  const left = [x - ux * size - uy * size * 0.5, y - uy * size + ux * size * 0.5];
  const right = [x - ux * size + uy * size * 0.5, y - uy * size - ux * size * 0.5];
  return open
    ? { d: `M ${left[0]} ${left[1]} L ${x} ${y} L ${right[0]} ${right[1]}`, fill: false }
    : { d: `M ${x} ${y} L ${left[0]} ${left[1]} L ${right[0]} ${right[1]} Z`, fill: true };
}

/** The diamond of a containment, on the end that holds the parts. */
function diamondOf(points: Point[]): string {
  const [x, y] = points[0];
  const [nx, ny] = points[1];
  const length = Math.hypot(nx - x, ny - y) || 1;
  const ux = (nx - x) / length;
  const uy = (ny - y) / length;
  const [long, wide] = [14, 4.5];
  const mid = [x + (ux * long) / 2, y + (uy * long) / 2];
  return `M ${x} ${y} L ${mid[0] - uy * wide} ${mid[1] + ux * wide} L ${x + ux * long} ${y + uy * long} L ${mid[0] + uy * wide} ${mid[1] - ux * wide} Z`;
}

/** A live reading, short enough for the room a row keeps for it. */
function reading(live: { value?: unknown; error?: string } | null): string {
  if (live === null) return "…";
  if (live.error !== undefined) return "no data";
  const value = live.value;
  if (typeof value === "number") return String(Math.round(value * 100) / 100);
  const text = String(value);
  return text.length > 9 ? `${text.slice(0, 8)}…` : text;
}

let canvas: HTMLCanvasElement | null = null;
function measure(text: string, bold = false): number {
  if (typeof document === "undefined") return text.length * 6.6;
  canvas ??= document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return text.length * 6.6;
  context.font = `${bold ? 600 : 400} 12px ${getComputedStyle(document.body).fontFamily}`;
  return context.measureText(text).width;
}

export interface DiagramProps {
  spec: GraphSpec;
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** What the modeler arranged by hand: rows of nodes, and rows for the containers of the band. */
  arranged?: Manual;
  /**
   * When given, a node can be dragged to another place among the nodes of its
   * container, and a container of the band at the side to another row of its lane.
   */
  onArrange?: (manual: Manual) => void;
  /** Called by the button in the title of a container that has an `action`. */
  onAction?: (container: string) => void;
}

/** A shape being moved: a node among the nodes of its container, or a container of the band. */
interface Move {
  kind: "node" | "frame";
  id: string;
  /** How far the pointer has travelled, in diagram units. */
  dx: number;
  dy: number;
  /** What would be arranged if it were dropped now, as text; null when nothing would change. */
  next: string | null;
  /** The view when the move began: it does not jump while the diagram rearranges itself. */
  view: View;
}

/** How far the buttons stand from the corner of the canvas, in pixels: `right-2 top-2`. */
const BAR_INSET = 8;

/** A pointer has to travel this far, in pixels, before a press on a node becomes a move. */
const MOVE_AFTER = 5;

export function Diagram({ spec, selected, onSelect, arranged, onArrange, onAction }: DiagramProps) {
  const by = arranged ?? NO_MANUAL;
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ width: number; height: number } | null>(null);
  const [manual, setManual] = useState<View | null>(null); // null: fit automatically
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ x: number; y: number; view: View } | null>(null);
  // A shape being moved: pressed first, moving once the pointer has travelled.
  const press = useRef<{ kind: Move["kind"]; id: string; x: number; y: number; pointer: number } | null>(null);
  const [moving, setMoving] = useState<Move | null>(null);
  const latest = useRef<Move | null>(null); // the same, for the handler that ends the move
  const moved = useRef(false); // the click that ends a move selects nothing

  useLayoutEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    // the buttons change width when one appears or goes
    const buttons = new ResizeObserver(([entry]) => {
      const box = entry.target.getBoundingClientRect();
      setBar((known) => (known && known.width === box.width && known.height === box.height ? known : { width: box.width, height: box.height }));
    });
    if (toolbar.current) buttons.observe(toolbar.current);
    return () => {
      observer.disconnect();
      buttons.disconnect();
    };
  }, []);

  // The layout wraps to the proportions of the canvas, so it uses its height too.
  const result = useMemo(
    () => (size ? layoutToFit(spec, size, { measure, arrangement: by.rows, band: by.band }) : null),
    [spec, size, by],
  );
  // While a shape is moved the diagram is drawn as it would be if it were dropped now:
  // the other shapes make room and the connectors follow.
  const next = moving?.next ?? null;
  const preview = useMemo(() => {
    if (!next || !size) return null;
    const manual = JSON.parse(next) as Manual;
    return layoutToFit(spec, size, { measure, arrangement: manual.rows, band: manual.band });
  }, [spec, size, next]);
  const drawn = preview ?? result;
  // The buttons lie over the top-right corner of the canvas: a diagram fitted
  // to the canvas is kept clear of them, so they never hide a shape or a line.
  const fitted = useMemo(() => {
    if (!result || !size) return null;
    const shapes: Box[] = [
      ...Object.values(result.containers),
      ...(result.aside ? [result.aside] : []),
      ...result.edges.flatMap((edge) => [
        ...(edge.label ? [edge.label] : []),
        ...edge.points.slice(1).map((point, i) => {
          const [x1, y1] = edge.points[i];
          return { x: Math.min(x1, point[0]), y: Math.min(y1, point[1]), w: Math.abs(x1 - point[0]), h: Math.abs(y1 - point[1]) };
        }),
      ]),
    ];
    const corner = bar ? { width: bar.width + 2 * BAR_INSET, height: bar.height + 2 * BAR_INSET } : { width: 0, height: 0 };
    return fitClear({ width: result.width, height: result.height }, size, shapes, corner);
  }, [result, size, bar]);
  const view = moving?.view ?? manual ?? fitted;
  const edgeById = useMemo(() => new Map(spec.edges.map((e) => [e.id, e])), [spec]);
  const nodeById = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec]);
  const containerById = useMemo(() => new Map(spec.containers.map((c) => [c.id, c])), [spec]);

  useEffect(() => {
    const up = () => {
      drag.current = null;
      press.current = null;
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  const zoom = (factor: number) => {
    if (!view || !size) return;
    setManual(zoomView(view, factor, { x: size.width / 2, y: size.height / 2 }));
  };

  const select = (id: string | null) => {
    if (moved.current) moved.current = false;
    else onSelect(id);
  };
  /** A container of the band at the side: it can be moved to another row of its lane. */
  const inBand = (id: string, layout: Layout) => layout.band[id] !== undefined && Boolean(layout.aside);

  const highlighted = (edge: LEdge) => hover !== null && (edge.connector === hover || edge.id === hover);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-white">
      <div
        ref={toolbar}
        className="absolute right-2 top-2 z-10 flex gap-1 rounded-lg border bg-background/95 p-1 shadow-sm"
      >
        <Button variant="ghost" size="icon" className="size-10" aria-label="Zoom out" onClick={() => zoom(1 / 1.2)}>
          −
        </Button>
        <Button variant="ghost" size="icon" className="size-10" aria-label="Zoom in" onClick={() => zoom(1.2)}>
          +
        </Button>
        <Button variant="ghost" className="h-10 px-3" onClick={() => setManual(null)}>
          Fit
        </Button>
        {onArrange && isManual(by) && (
          <Button
            variant="ghost"
            className="h-10 px-3"
            title="Forget where the shapes were moved by hand"
            onClick={() => onArrange(NO_MANUAL)}
          >
            Auto layout
          </Button>
        )}
      </div>
      <div
        ref={host}
        className="h-full w-full touch-none"
        style={{ cursor: "grab" }}
        onPointerDown={(event) => {
          if ((event.target as Element).closest(".node, .edge, .container-title, .movable")) return;
          if (view) drag.current = { x: event.clientX, y: event.clientY, view };
        }}
        onPointerMove={(event) => {
          const pressed = press.current;
          if (pressed && result && view) {
            const [dx, dy] = [event.clientX - pressed.x, event.clientY - pressed.y];
            if (!latest.current && Math.hypot(dx, dy) < MOVE_AFTER) return;
            if (!latest.current) {
              try {
                // so the move goes on, and ends, even with the pointer outside the canvas
                event.currentTarget.setPointerCapture(pressed.pointer);
              } catch {
                // a pointer that cannot be captured still moves the node inside the canvas
              }
            }
            const box = event.currentTarget.getBoundingClientRect();
            const point = { x: (event.clientX - box.left - view.x) / view.k, y: (event.clientY - box.top - view.y) / view.k };
            // where it would go is read on the diagram as it was when the move began
            let wanted: Manual | null = null;
            if (pressed.kind === "node") {
              const drop = dropTarget(result, spec, pressed.id, point);
              const rows = drop ? (result.rows[drop.container] ?? []) : [];
              const moved = drop ? moveNode(rows, pressed.id, drop) : rows;
              if (drop && !sameRows(moved, rows)) wanted = { ...by, rows: { ...by.rows, [drop.container]: moved } };
            } else {
              const target = bandTarget(result, spec, pressed.id, point);
              if (target && target.row !== result.band[pressed.id]) {
                wanted = { ...by, band: { ...by.band, [pressed.id]: target.row } };
              }
            }
            latest.current = {
              kind: pressed.kind,
              id: pressed.id,
              dx: dx / view.k,
              dy: dy / view.k,
              next: wanted && JSON.stringify(wanted),
              view: latest.current?.view ?? view,
            };
            setMoving(latest.current);
            return;
          }
          const start = drag.current;
          if (!start) return;
          setManual({
            k: start.view.k,
            x: start.view.x + event.clientX - start.x,
            y: start.view.y + event.clientY - start.y,
          });
        }}
        onPointerUp={() => {
          const end = latest.current;
          if (end) {
            moved.current = true;
            if (end.next) onArrange?.(JSON.parse(end.next) as Manual);
            // the click that follows, if any, is spent on this move
            window.setTimeout(() => (moved.current = false), 0);
          }
          press.current = null;
          latest.current = null;
          setMoving(null);
        }}
        onPointerCancel={() => {
          press.current = null;
          latest.current = null;
          setMoving(null);
        }}
        onClick={(event) => {
          if (!(event.target as Element).closest(".node, .edge, .container-title")) select(null);
        }}
      >
        {result && drawn && view && size && (
          <svg
            width={size.width}
            height={size.height}
            className={`diagram${hover ? " hover" : ""}`}
            role="img"
            aria-label="Multi-level model diagram"
          >
            <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
              {drawn.lanes.map((lane) => (
                <g key={lane.id}>
                  <rect
                    x={8}
                    y={lane.y - 8}
                    width={drawn.width - 16}
                    height={lane.h + 16}
                    rx={10}
                    fill={LANE[lane.id].soft}
                  />
                  <text
                    x={22}
                    y={lane.y + lane.h / 2}
                    fontSize={11}
                    fontWeight={600}
                    fill={LANE[lane.id].color}
                    textAnchor="middle"
                    transform={`rotate(-90 22 ${lane.y + lane.h / 2})`}
                  >
                    {LANE[lane.id].name}
                  </text>
                </g>
              ))}

              {drawn.aside && (
                <g>
                  <rect
                    x={drawn.aside.x}
                    y={drawn.aside.y}
                    width={drawn.aside.w}
                    height={drawn.aside.h}
                    rx={10}
                    fill="white"
                    fillOpacity={0.6}
                    stroke="#9ca3af"
                    strokeDasharray="2 4"
                  />
                  <text
                    x={drawn.aside.x + drawn.aside.w - 11}
                    y={drawn.aside.y + drawn.aside.h / 2}
                    fontSize={10}
                    fontWeight={600}
                    fill="#6b7280"
                    textAnchor="middle"
                    transform={`rotate(-90 ${drawn.aside.x + drawn.aside.w - 11} ${drawn.aside.y + drawn.aside.h / 2})`}
                  >
                    {drawn.aside.h > 150 ? "other DTs, through weaving" : "other DTs"}
                  </text>
                </g>
              )}

              {spec.containers.map((container) => {
                const r = drawn.containers[container.id];
                const color = LANE[container.lane].color;
                const mark = container.mark ? MARK[container.mark] : null;
                return (
                  <g
                    key={container.id}
                    className={onArrange && inBand(container.id, drawn) ? "movable" : undefined}
                    style={onArrange && inBand(container.id, drawn) ? { cursor: "grab" } : undefined}
                    opacity={container.mark === "removed" ? 0.55 : container.proxy ? 0.85 : 1}
                    onPointerDown={
                      onArrange && inBand(container.id, drawn)
                        ? (event) => {
                            if (event.button !== 0 || (event.target as Element).closest(".node")) return;
                            press.current = { kind: "frame", id: container.id, x: event.clientX, y: event.clientY, pointer: event.pointerId };
                          }
                        : undefined
                    }
                  >
                    <rect
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      rx={8}
                      fill="white"
                      stroke={selected === container.id ? "#111827" : (mark ?? color)}
                      strokeWidth={selected === container.id ? 2.5 : mark ? 2 : 1.25}
                      strokeDasharray={container.mark === "added" ? "6 3" : container.proxy ? "2 3" : undefined}
                    />
                    <g className="container-title" style={{ cursor: "pointer" }} onClick={() => select(container.id)}>
                      <rect x={r.x} y={r.y} width={r.w} height={24} fill="transparent" />
                      <text x={r.x + 10} y={r.y + 16} fontSize={12} fontWeight={600} fill={color}>
                        {container.title}
                        {container.subtitle && (
                          <tspan fontWeight={400} fill="#6b7280">
                            {" "}
                            {container.subtitle}
                          </tspan>
                        )}
                      </text>
                    </g>
                    {container.action && onAction && (
                      <g
                        className="container-action"
                        role="button"
                        aria-label={`${container.action} to ${container.id}`}
                        style={{ cursor: "pointer" }}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onAction(container.id);
                        }}
                      >
                        <title>{container.action}</title>
                        <rect x={r.x + r.w - 23} y={r.y + 4} width={17} height={17} rx={4} fill="white" stroke={color} strokeWidth={1} />
                        <path
                          d={`M ${r.x + r.w - 18.5} ${r.y + 12.5} h 8 M ${r.x + r.w - 14.5} ${r.y + 8.5} v 8`}
                          stroke={color}
                          strokeWidth={1.5}
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {drawn.edges.map((edge) => {
                const spec = edgeById.get(edge.id);
                if (!spec) return null;
                const style = styleOf(spec);
                const arrow = edge.arrow ? arrowOf(edge.points, spec.kind !== "typing") : null;
                return (
                  <g
                    key={edge.id}
                    className={`edge${highlighted(edge) ? " hi" : ""}`}
                    opacity={spec.mark === "removed" ? 0.5 : 0.95}
                    onPointerEnter={() => setHover(edge.connector)}
                    onPointerLeave={() => setHover(null)}
                    onClick={() =>
                      spec.kind === "correspondence" &&
                      onSelect(`link:${edge.id.slice("correspondence:".length).replace(TYPES, "")}`)
                    }
                  >
                    <path
                      className="line"
                      d={pathOf(edge.points)}
                      stroke={style.stroke}
                      strokeDasharray={style.dash}
                      style={style.width ? { strokeWidth: style.width } : undefined}
                    />
                    {arrow && (
                      <path
                        d={arrow.d}
                        fill={arrow.fill ? style.stroke : "white"}
                        stroke={style.stroke}
                        strokeWidth={1.5}
                        strokeLinejoin="round"
                      />
                    )}
                    {spec.containment && edge.points.length > 1 && (
                      <path d={diamondOf(edge.points)} fill={style.stroke} stroke={style.stroke} strokeWidth={1} />
                    )}
                    <path className="hit" d={pathOf(edge.points)}>
                      {spec.detail && <title>{spec.detail}</title>}
                    </path>
                  </g>
                );
              })}

              {spec.nodes.map((node) => (
                <NodeBox
                  key={node.id}
                  node={node}
                  rect={drawn.nodes[node.id]}
                  color={LANE[containerById.get(node.container)?.lane ?? "O0"].color}
                  selected={selected === node.id}
                  onSelect={() => select(node.id)}
                  onPress={
                    onArrange
                      ? (event) => {
                          if (event.button !== 0) return;
                          // alone in a container of the band, a node has nowhere to go: its container moves
                          const alone = inBand(node.container, drawn) && (drawn.rows[node.container]?.flat().length ?? 0) < 2;
                          press.current = {
                            kind: alone ? "frame" : "node",
                            id: alone ? node.container : node.id,
                            x: event.clientX,
                            y: event.clientY,
                            pointer: event.pointerId,
                          };
                        }
                      : undefined
                  }
                />
              ))}

              {/* labels above every line */}
              {drawn.edges.map((edge) => {
                const spec = edgeById.get(edge.id);
                if (!edge.label || !spec) return null;
                const style = styleOf(spec);
                return (
                  <g
                    key={`label:${edge.id}`}
                    className={`edge${highlighted(edge) ? " hi" : ""}`}
                    onPointerEnter={() => setHover(edge.connector)}
                    onPointerLeave={() => setHover(null)}
                  >
                    <rect
                      x={edge.label.x}
                      y={edge.label.y}
                      width={edge.label.w}
                      height={edge.label.h}
                      rx={4}
                      fill="white"
                      stroke={style.stroke}
                      strokeWidth={0.75}
                    />
                    <text
                      x={edge.label.x + edge.label.w / 2}
                      y={edge.label.y + 12}
                      fontSize={11}
                      textAnchor="middle"
                      fill={style.stroke}
                    >
                      {edge.label.text}
                      {spec.detail && <title>{spec.detail}</title>}
                    </text>
                  </g>
                );
              })}

              {moving && <MoveOverlay move={moving} spec={spec} from={result} to={preview} />}
            </g>
          </svg>
        )}
      </div>
      {nodeById.size === 0 && spec.containers.length === 0 && (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Nothing to show.</p>
      )}
    </div>
  );
}

/**
 * A shape on the move: where it would land is outlined in the diagram, which
 * is already drawn that way, and a copy of it follows the pointer.
 */
function MoveOverlay(props: { move: Move; spec: GraphSpec; from: Layout; to: Layout | null }) {
  const { move, spec, from, to } = props;
  const rectOf = (layout: Layout) => (move.kind === "node" ? layout.nodes[move.id] : layout.containers[move.id]);
  const start = rectOf(from);
  const landing = to ? rectOf(to) : null;
  const title =
    move.kind === "node"
      ? spec.nodes.find((n) => n.id === move.id)?.title
      : spec.containers.find((c) => c.id === move.id)?.title;
  if (!start) return null;
  return (
    <g pointerEvents="none">
      {landing && (
        <rect
          x={landing.x - 3}
          y={landing.y - 3}
          width={landing.w + 6}
          height={landing.h + 6}
          rx={9}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      )}
      <g transform={`translate(${move.dx} ${move.dy})`} opacity={0.85}>
        <rect
          x={start.x}
          y={start.y}
          width={start.w}
          height={Math.min(start.h, 44)}
          rx={6}
          fill="white"
          stroke="#2563eb"
          strokeWidth={1.5}
        />
        <text x={start.x + 10} y={start.y + 18} fontSize={12} fontWeight={600} fill="#1d4ed8">
          {title}
        </text>
      </g>
    </g>
  );
}

function NodeBox(props: {
  node: GNode;
  rect: { x: number; y: number; w: number; h: number };
  color: string;
  selected: boolean;
  onSelect: () => void;
  onPress?: (event: React.PointerEvent) => void;
}) {
  const { node, rect: r, color, selected } = props;
  const mark = node.mark ? MARK[node.mark] : null;
  const stroke = selected ? "#111827" : node.drift ? "var(--bad)" : (mark ?? color);
  return (
    <g
      className="node"
      opacity={node.mark === "removed" ? 0.55 : 1}
      style={props.onPress ? { cursor: "grab" } : undefined}
      onClick={props.onSelect}
      onPointerDown={props.onPress}
    >
      <rect
        x={r.x}
        y={r.y}
        width={r.w}
        height={r.h}
        rx={6}
        fill="white"
        stroke={stroke}
        strokeWidth={selected ? 2.5 : node.drift || mark ? 2 : 1.25}
        strokeDasharray={node.mark === "added" ? "6 3" : undefined}
      />
      <path d={`M ${r.x + 1} ${r.y + 26} H ${r.x + r.w - 1}`} stroke={color} strokeOpacity={0.25} />
      <text x={r.x + 10} y={r.y + 18} fontSize={12} fontWeight={600} fill="#111827">
        {node.title}
        {node.subtitle && (
          <tspan fontWeight={400} fill={color}>
            {" "}
            {node.subtitle}
          </tspan>
        )}
      </text>
      {node.rows.map((row, index) => (
        <g key={index}>
          <text
            x={r.x + 10}
            y={r.y + 32 + 13 + index * 17}
            fontSize={11.5}
            fill={row.mark ? MARK[row.mark] : "#374151"}
            textDecoration={row.mark === "removed" ? "line-through" : undefined}
          >
            {row.text}
          </text>
          {row.value !== undefined && (
            <text
              x={r.x + r.w - 9}
              y={r.y + 32 + 13 + index * 17}
              fontSize={11.5}
              fontWeight={600}
              textAnchor="end"
              fill={row.value?.error !== undefined ? "var(--bad)" : row.value ? "var(--ok)" : "#9ca3af"}
            >
              {reading(row.value)}
              {row.value?.error !== undefined && <title>{row.value.error}</title>}
            </text>
          )}
        </g>
      ))}
      {node.impact && (
        <circle cx={r.x + r.w - 9} cy={r.y + 9} r={5} fill={TONE[node.impact]} stroke="white" strokeWidth={1.5}>
          <title>{`impact: ${node.impact}`}</title>
        </circle>
      )}
    </g>
  );
}
