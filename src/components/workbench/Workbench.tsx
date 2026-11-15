"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fromStable, parseArrangements, toStable, type Manual } from "@/diagram/arrange";
import { Diagram } from "@/diagram/Diagram";
import { EDGE_KINDS, buildGraph, type EdgeKind } from "@/diagram/graph";
import { PlanError, incomingRequests, planFromDict } from "@/engine/assistant/adaptation";
import { changeSetFromDict } from "@/engine/assistant/change";
import { resolveDecision, type Decision, type ProcessResult } from "@/engine/assistant/process";
import {
  assembleAt,
  headsOf,
  incomingDrift,
  restoreBlockers,
  runTrigger,
  type Trigger,
} from "@/engine/assistant/session";
import { issueText, type Issue } from "@/engine/conformance";
import { devicesOf } from "@/engine/devices";
import { cloneFederation, type Federation } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { parseRef } from "@/engine/kernel/refs";
import { loadYaml } from "@/engine/kernel/yaml";
import {
  applyEdit,
  asNextVersion,
  changedModels,
  extract,
  gateFor,
  modelOf,
  transplant,
  type ModelVersion,
} from "@/engine/modelset";
import { munidiff } from "@/engine/munidiff";
import { liveValues, type LiveValue } from "@/engine/runtime/live";
import { actorOf, fire, reactionsOf } from "@/engine/runtime/reactions";
import { HOLDS, checkCorrespondences } from "@/engine/weaving/checks";
import { wmodelFromDict } from "@/engine/weaving/model";
import { modelProblem } from "@/engine/modeling/models";
import {
  archiveLegacy,
  decide,
  createModel,
  getExamples,
  getState,
  getVersion,
  initRepository,
  invoke,
  restoreVersion,
  type Examples,
  type RepoState,
  type VersionContent,
} from "@/server/actions";

import { Act, Choice, Section, Tone } from "./controls";
import { useLiveReadings } from "./live";
import { MunidiffView } from "./MunidiffView";
import { DecisionBar, ProcessPanel, type ProcessView } from "./ProcessPanel";
import { DEFAULT_PANES, HANDLE, MIN_PANE, fitPanes, maxPane, parsePanes, resizePane, type Panes } from "./panes";
import { Properties } from "./Properties";
import { Splitter } from "./Splitter";
import { type Fired } from "./Reactions";
import { RuntimePanel } from "./RuntimePanel";

const LAYER: Record<EdgeKind, string> = {
  typing: "instanceOf",
  reference: "references",
  binding: "bindings",
  correspondence: "correspondences",
  representation: "twins",
  evolution: "evolutions",
  drift: "drift",
  impact: "impact",
};

/** What the button in the title of a container adds, by the level of its model. */
const ADDS: Record<string, string | undefined> = { O2: "Add a concept", O1: "Add a class", O0: "Add an object" };

const CAUSE: Record<Trigger["kind"], string> = {
  edit: "You edited this model: this is what your working copy changes.",
  observations: "The DT of this model reported at runtime.",
  timeliness: "The runtime observed a timeliness violation on what this model expects.",
  incoming: "A model this one weaves, or the shared concepts, has a new version since this model was committed.",
  request: "Another DT asked for this; the assistant proposes the next version of this model.",
};

/** A run of the process the modeler opened explicitly, for one model. */
interface Proposal {
  token: string;
  focus: string;
  trigger: Trigger;
  result: ProcessResult;
}

const tag = (version: number) => String(version).padStart(4, "0");

function storedProcess(files: Record<string, string>): { view: ProcessView; decision: Dict | null } | null {
  if (!files["4-adaptation-plan.yaml"]) return null;
  return {
    view: {
      changeset: changeSetFromDict(loadYaml<Dict>(files["1-change-set.yaml"])),
      drift: wmodelFromDict(loadYaml<Dict>(files["2-classified-drift.wm.yaml"])),
      impact: wmodelFromDict(loadYaml<Dict>(files["3-impact-report.wm.yaml"])),
      plan: planFromDict(loadYaml<Dict>(files["4-adaptation-plan.yaml"])),
    },
    decision: files["5-decision.yaml"] ? loadYaml<Dict>(files["5-decision.yaml"]) : null,
  };
}

/** What the process has to say about the open model without being asked: its
 * own edits first, then what reached it from the models it weaves. */
function liveRun(
  versions: ModelVersion[],
  working: Federation | null,
  focus: string,
  dirty: string[],
): { trigger: Trigger; result: ProcessResult } | null {
  if (!working || !focus) return null;
  const triggers: Trigger[] = dirty.includes(focus) ? [{ kind: "edit", files: extract(working, focus) }] : [];
  triggers.push({ kind: "incoming" });
  for (const trigger of triggers) {
    const result = runTrigger(versions, focus, trigger);
    if (result) return { trigger, result };
  }
  return null;
}

function Problem({ error }: { error: { message: string; issues?: Issue[] } | null }) {
  if (!error) return null;
  return (
    <div className="text-sm text-red-900">
      <p>{error.message}</p>
      <ul className="list-disc pl-5">
        {(error.issues ?? []).map((issue) => (
          <li key={issueText(issue)}>{issueText(issue)}</li>
        ))}
      </ul>
    </div>
  );
}

/** Go back to a committed version; asked twice, because the later versions are removed. */
function RestoreVersion(props: {
  model: string;
  version: number;
  head: number;
  blockers: { model: string; version: number; against: number }[];
  unsaved: boolean;
  confirming: boolean;
  busy: boolean;
  onAsk: (asking: boolean) => void;
  onRestore: () => void;
}) {
  const { model, version, head } = props;
  const removed = head === version + 1 ? `version ${head}` : `versions ${version + 1} to ${head}`;
  if (props.blockers.length > 0) {
    return (
      <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
        {model} cannot go back to version {version} yet:{" "}
        {props.blockers.map((b) => `${b.model} v${b.version} was committed against ${model} v${b.against}`).join("; ")}.
        Restore {props.blockers.map((b) => b.model).join(", ")} to an earlier version first.
      </p>
    );
  }
  if (props.unsaved) {
    return (
      <p className="text-xs text-muted-foreground">
        To restore this version, commit or discard the model edits first.
      </p>
    );
  }
  if (!props.confirming) {
    return (
      <Act className="w-full" onClick={() => props.onAsk(true)}>
        Restore version {version}…
      </Act>
    );
  }
  return (
    <div className="space-y-1.5 rounded-md border border-red-200 bg-red-50 p-2">
      <p className="text-xs text-red-900">
        Version {version} becomes the current version of {model}, and {removed} of {model} {head === version + 1 ? "is" : "are"}{" "}
        removed from the repository, with {head === version + 1 ? "its" : "their"} diff and process. This cannot be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        <Act variant="destructive" disabled={props.busy} onClick={props.onRestore}>
          Remove and restore
        </Act>
        <Act variant="ghost" disabled={props.busy} onClick={() => props.onAsk(false)}>
          Cancel
        </Act>
      </div>
    </div>
  );
}

/** Where a browser keeps the widths of the side panes. */
const PANES_KEY = "fmddt.workbench.panes";
/** Where it keeps how the shapes of each model were arranged by hand. */
const ARRANGEMENTS_KEY = "fmddt.diagram.arrangements";
const noStore = () => () => {};
/** What this browser kept under `key`; null when it kept nothing, or keeps nothing. */
function kept(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function keep(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // it lasts for this visit only
  }
}
const keptPanes = () => kept(PANES_KEY);
const keptArrangements = () => kept(ARRANGEMENTS_KEY);

export function Workbench() {
  const [repo, setRepo] = useState<RepoState | null>(null);
  const [examples, setExamples] = useState<Examples>({ baselines: [], batches: [], edits: [] });
  const [opened, setOpened] = useState<string | null>(null);
  const [viewing, setViewing] = useState<"working" | number>("working");
  const [compare, setCompare] = useState(true);
  const [edited, setEdited] = useState<{ token: string; fed: Federation } | null>(null);
  const [explicit, setExplicit] = useState<Proposal | null>(null);
  const [contents, setContents] = useState<Record<string, VersionContent>>({});
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [kinds, setKinds] = useState<Set<EdgeKind>>(() => new Set(EDGE_KINDS.filter((k) => k !== "typing")));
  const [tab, setTab] = useState("properties");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState<{ id: string; label: string } | null>(null);
  const [error, setError] = useState<{ message: string; issues?: Issue[] } | null>(null);
  const [yamlFile, setYamlFile] = useState("");
  const [restoring, setRestoring] = useState("");
  const [liveOn, setLiveOn] = useState(false);
  const [every, setEvery] = useState(5);
  const [reactOn, setReactOn] = useState(false);
  const [fired, setFired] = useState<Fired[]>([]);
  // The side panes, as wide as the modeler left them in this browser.
  const paneText = useSyncExternalStore(noStore, keptPanes, () => null);
  const [resized, setPanes] = useState<Panes | null>(null);
  const panes = useMemo(() => resized ?? parsePanes(paneText), [resized, paneText]);
  // The shapes of each model, where the modeler moved them in this browser.
  const arrangementText = useSyncExternalStore(noStore, keptArrangements, () => null);
  const [rearranged, setArrangements] = useState<Record<string, Manual> | null>(null);
  const arrangements = useMemo(() => rearranged ?? parseArrangements(arrangementText), [rearranged, arrangementText]);
  const [workbench, setWorkbench] = useState<HTMLDivElement | null>(null);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    if (!workbench) return;
    const observer = new ResizeObserver(([entry]) => setTotal(entry.contentRect.width));
    observer.observe(workbench);
    return () => observer.disconnect();
  }, [workbench]);
  const fitted = useMemo(() => fitPanes(panes, total), [panes, total]);
  const keepPanes = (next: Panes) => {
    setPanes(next);
    keep(PANES_KEY, next);
  };
  const lastValues = useRef<Record<string, LiveValue> | null>(null);

  useEffect(() => {
    getState().then(setRepo);
    getExamples().then(setExamples);
  }, []);

  const versions = useMemo(() => repo?.versions ?? [], [repo]);
  const heads = useMemo(() => headsOf(versions), [versions]);
  const token = useMemo(() => JSON.stringify(heads), [heads]);
  const headFed = useMemo(() => (versions.length ? assembleAt(versions, heads) : null), [versions, heads]);
  const models = useMemo(() => repo?.models ?? [], [repo]);
  const focus = opened && models.includes(opened) ? opened : (models.find((m) => m !== "core") ?? models[0] ?? "");
  const working = edited && edited.token === token ? edited.fed : headFed;
  const dirty = useMemo(
    () => (headFed && working && working !== headFed ? changedModels(headFed, working) : []),
    [headFed, working],
  );

  // Live readings: the devices the models describe, as they are in the working copy.
  const devices = useMemo(() => (working ? models.flatMap((model) => devicesOf(working, model)) : []), [working, models]);
  const live = useLiveReadings(liveOn, every, devices);
  const values = useMemo(
    () => (liveOn && working ? liveValues(working, live.readings) : null),
    [liveOn, working, live],
  );
  // Reactions: on every new reading, the ones whose condition became true are invoked.
  useEffect(() => {
    const before = lastValues.current;
    lastValues.current = reactOn ? values : null;
    if (!reactOn || !values || !before || !working) return;
    const due = fire(models.flatMap((model) => reactionsOf(working, model)), before, values);
    for (const reaction of due) {
      const actor = actorOf(working, reaction);
      if (!actor) continue;
      const call = `${reaction.target}.${reaction.operation}(${Object.values(reaction.args).join(", ")})`;
      invoke(actor.device, actor.part.id, reaction.operation, reaction.args).then((result) => {
        const entry: Fired = {
          at: Math.round(Date.now() / 1000),
          reaction: `${reaction.model}#${reaction.id}`,
          text: result.ok ? `fired: ${call}` : `could not ${call}: ${result.error}`,
          ok: result.ok,
        };
        setFired((log) => [entry, ...log].slice(0, 50));
      });
    }
  }, [values, reactOn, working, models]);

  const silent = (model: string) => (live.readings[model] ?? []).some((reading) => reading.error !== undefined);

  // What waits for the modeler of each model.
  const waiting = useMemo(() => {
    const out: Record<string, { drift: boolean; requests: number }> = {};
    if (!headFed) return out;
    for (const model of models) {
      const drift = incomingDrift(versions, model) !== null;
      out[model] = { drift, requests: incomingRequests(headFed, model).length };
    }
    return out;
  }, [headFed, models, versions]);

  // The run of the process that is live for the open model.
  const proposal = explicit && explicit.token === token && explicit.focus === focus ? explicit : null;
  const derived = useMemo(() => liveRun(versions, working, focus, dirty), [versions, working, focus, dirty]);
  const active = proposal ?? derived;
  const requests = useMemo(() => (headFed && focus ? incomingRequests(headFed, focus) : []), [headFed, focus]);

  // The decision as it stands: an option for every correspondence this model owns.
  const chosen = useMemo(() => {
    const out: Record<string, string> = {};
    for (const resolution of active?.result.plan.resolutions ?? []) {
      if (resolution.owner !== focus) continue;
      const pick =
        resolution.options.find((o) => o.id === choices[resolution.drift])?.id ??
        resolution.options.find((o) => o.automatic)?.id;
      if (pick) out[resolution.drift] = pick;
    }
    return out;
  }, [active, choices, focus]);
  const manual = (active?.result.plan.resolutions ?? []).some(
    (r) => r.owner === focus && !r.options.find((o) => o.id === chosen[r.drift])?.automatic,
  );
  const decided = useMemo(() => {
    if (!active || !headFed) return null;
    try {
      const model = resolveDecision(active.result.candidate, active.result.plan, { decision: "accept", choices: chosen }, focus);
      if (!model) return null;
      const next = asNextVersion(model, headFed, focus, (heads[focus] ?? 0) + 1);
      const changes = munidiff(headFed, next, focus, {
        from: `${focus}/versions/${tag(heads[focus] ?? 0)}`,
        to: `${focus}/versions/${tag((heads[focus] ?? 0) + 1)} (proposed)`,
      });
      return { model, changes, issues: gateFor(next, focus), error: null as string | null };
    } catch (problem) {
      if (!(problem instanceof PlanError)) throw problem;
      return { model: null, changes: "", issues: [], error: problem.message };
    }
  }, [active, headFed, chosen, focus, heads]);

  // A committed version of the open model, with what it changed.
  const stamp = typeof viewing === "number" ? `${focus}@${viewing}` : "";
  const content = contents[stamp];
  useEffect(() => {
    if (typeof viewing !== "number" || !focus || contents[`${focus}@${viewing}`]) return;
    let cancelled = false;
    getVersion(focus, viewing).then((loaded) => {
      if (!cancelled) setContents((known) => ({ ...known, [`${focus}@${viewing}`]: loaded }));
    });
    return () => {
      cancelled = true;
    };
  }, [viewing, focus, contents]);
  const stored = useMemo(() => (content ? storedProcess(content.process) : null), [content]);
  const historic = useMemo(() => {
    if (typeof viewing !== "number" || !versions.length) return null;
    const info = repo?.infos.find((i) => i.model === focus && i.id === viewing);
    const at = { ...heads, ...(info?.context ?? {}), [focus]: viewing };
    return {
      at: assembleAt(versions, at),
      parent: viewing > 1 ? assembleAt(versions, { ...at, [focus]: viewing - 1 }) : null,
    };
  }, [viewing, versions, heads, focus, repo]);

  // What the diagram and the panels show.
  const readOnly = viewing !== "working" || proposal !== null;
  const shown = viewing === "working" ? (active?.result.candidate ?? working) : (historic?.at ?? null);
  const before = viewing === "working" ? (active ? active.result.head : null) : compare ? (historic?.parent ?? null) : null;
  const statuses = useMemo(() => (shown ? checkCorrespondences(shown) : []), [shown]);
  const issues = useMemo(() => (shown && focus ? gateFor(shown, focus) : []), [shown, focus]);
  const processView: ProcessView | null = viewing === "working" ? (active?.result ?? null) : (stored?.view ?? null);
  const spec = useMemo(() => {
    if (!shown || !focus) return null;
    // A committed version is drawn as it is checked now (statuses); the record of the process that
    // ran at its commit is in the Process tab.
    const overlay = viewing === "working" ? processView : null;
    const readings = viewing === "working" ? values : null;
    const graph = buildGraph(
      shown,
      before,
      kinds,
      { statuses, drift: overlay?.drift, impact: overlay?.impact, values: readings },
      { focus },
    );
    if (readOnly) return graph;
    // What the open model owns can be added to from its title.
    const action = (id: string) => (id in shown.models ? ADDS[shown.models[id].level] : undefined);
    return { ...graph, containers: graph.containers.map((c) => (c.proxy ? c : { ...c, action: action(c.id) })) };
  }, [shown, before, kinds, statuses, viewing, processView, focus, values, readOnly]);
  // by names that do not change with the version, so an arrangement outlives a commit
  const arranged = useMemo(() => (spec ? fromStable(spec, arrangements[focus]) : undefined), [spec, arrangements, focus]);

  const open = (model: string) => {
    setOpened(model);
    setViewing("working");
    setSelected(null);
    setChoices({});
    setError(null);
  };

  const update = useCallback(
    (change: (fed: Federation) => void) => {
      if (!working) return;
      const next = cloneFederation(working);
      change(next);
      setEdited({ token, fed: next });
      setError(null);
    },
    [working, token],
  );

  const settle = async (decision: Decision) => {
    if (!active) return;
    setBusy(true);
    setError(null);
    const outcome = await decide(focus, active.trigger, decision);
    setBusy(false);
    if (!outcome.ok) {
      setError({ message: outcome.error, issues: outcome.issues });
      return;
    }
    // The edits of the other models survive: they are still to be committed.
    const kept = working && headFed ? dirty.filter((model) => model !== focus) : [];
    const state = outcome.state;
    const nextHeads = headsOf(state.versions);
    let carried = assembleAt(state.versions, nextHeads);
    for (const model of kept) carried = transplant(carried, working as Federation, model);
    setRepo(state);
    setEdited(kept.length ? { token: JSON.stringify(nextHeads), fed: carried } : null);
    setExplicit(null);
    setSelected(null);
    setChoices({});
    setMessage("");
    setContents({});
  };

  // Back to the version on screen: the versions after it leave the repository.
  const create = async () => {
    if (!creating) return;
    setBusy(true);
    setError(null);
    const id = creating.id.trim();
    const outcome = await createModel(id, creating.label);
    setBusy(false);
    if (!outcome.ok) {
      setError({ message: outcome.error, issues: outcome.issues });
      return;
    }
    setCreating(null);
    setRepo(outcome.state);
    setEdited(null);
    open(id);
  };

  const restore = async (version: number) => {
    setBusy(true);
    setError(null);
    const outcome = await restoreVersion(focus, version);
    setBusy(false);
    setRestoring("");
    if (!outcome.ok) {
      setError({ message: outcome.error, issues: outcome.issues });
      return;
    }
    setRepo(outcome.state);
    setEdited(null);
    setExplicit(null);
    setSelected(null);
    setChoices({});
    setContents({});
    setViewing("working");
  };

  if (!repo) return <p className="p-6 text-sm text-muted-foreground">Loading the model repository…</p>;

  if (!repo.initialized) {
    return (
      <main className="mx-auto max-w-xl space-y-4 p-8">
        <h1 className="text-xl font-semibold">Model repository</h1>
        {repo.legacy ? (
          <>
            <p className="text-sm text-muted-foreground">
              <code>{repo.path}</code> holds a repository of the earlier format, with one history for all the models.
              The repository now keeps one model per DT, each with its own versions. Archiving renames the folder and
              leaves its content untouched.
            </p>
            <Act
              variant="default"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const outcome = await archiveLegacy();
                setBusy(false);
                if (outcome.ok) setRepo(outcome.state);
                else setError({ message: outcome.error });
              }}
            >
              Archive it and start a new repository
            </Act>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              <code>{repo.path}</code> has no model yet. Start it from a scenario under <code>scenarios/</code>: every
              model becomes its own first version, after passing its checks.
            </p>
            <div className="flex flex-wrap gap-2">
              {examples.baselines.map((baseline) => (
                <Act
                  key={`${baseline.scenario}/${baseline.variant}`}
                  variant={baseline.variant ? "outline" : "default"}
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    const outcome = await initRepository(baseline.scenario, baseline.variant);
                    setBusy(false);
                    if (outcome.ok) setRepo(outcome.state);
                    else setError({ message: outcome.error, issues: outcome.issues });
                  }}
                >
                  Start from {baseline.scenario}
                  {baseline.variant ? ` (${baseline.variant})` : ""}
                </Act>
              ))}
            </div>
          </>
        )}
        <Problem error={error} />
      </main>
    );
  }

  const files = shown ? extract(shown, focus) : {};
  const file = yamlFile in files ? yamlFile : (Object.keys(files)[0] ?? "");
  // Of a stored record, the correspondences that hold in the version as it is checked now.
  const settled =
    viewing === "working" ? [] : statuses.filter((s) => s.status === HOLDS).map((s) => String(s.correspondence));
  const driftCount =
    (processView?.drift.links.filter((l) => !settled.includes(l.props.correspondence)).length ?? 0) +
    (viewing === "working" ? requests.length : 0);
  const changes = viewing === "working" ? (decided?.changes ?? "") : (content?.changes ?? "");
  const history = repo.infos.filter((info) => info.model === focus);
  const blockedFor = (model: string | null) =>
    dirty.length && (model === null || dirty.includes(model))
      ? "Commit or discard the model edits first: the runtime reports against the committed models."
      : null;
  const decisionBar = active && (
    <DecisionBar
      preview={decided ? { issues: decided.issues, error: decided.error, empty: !decided.changes && !decided.error } : null}
      manual={manual}
      busy={busy}
      error={error}
      message={message}
      onMessage={setMessage}
      onAccept={() => settle({ decision: "accept", choices: chosen, message: message || undefined })}
      onReject={() => {
        if (proposal) setExplicit(null);
        else if (active.trigger.kind === "edit" && headFed && working) {
          setEdited({ token, fed: transplant(working, headFed, focus) });
        }
        setChoices({});
        setError(null);
      }}
      onEdit={
        active.trigger.kind === "edit"
          ? undefined
          : () => {
              // Keep what the assistant can do by itself, and go on by hand.
              const automatic = Object.fromEntries(
                active.result.plan.resolutions
                  .filter((r) => r.options.find((o) => o.id === chosen[r.drift])?.automatic)
                  .map((r) => [r.drift, chosen[r.drift]]),
              );
              const base = resolveDecision(active.result.candidate, active.result.plan, { decision: "edit", choices: automatic }, focus);
              if (base && working) setEdited({ token, fed: transplant(working, base, focus) });
              setExplicit(null);
              setTab("properties");
            }
      }
    />
  );

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-2">
        <h1 className="text-sm font-semibold">FMDDT · model-first drift management</h1>
        <span className="text-xs text-muted-foreground">{repo.path}</span>
        <div className="ml-auto flex flex-wrap items-center gap-x-3">
          <label
            className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs font-medium"
            title="Read the devices the models describe, again and again, and show the values on the diagram"
          >
            <input type="checkbox" className="size-4" checked={liveOn} onChange={(e) => setLiveOn(e.target.checked)} />
            Live
            {liveOn && (
              <span className={live.at ? "text-emerald-700" : "text-muted-foreground"}>
                {devices.length === 0 ? "no device" : live.at ? "●" : "…"}
              </span>
            )}
          </label>
          {liveOn && (
            <label
              className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-xs font-medium"
              title="Invoke the operations of the reactions of the models when their conditions become true. This acts on the devices."
            >
              <input type="checkbox" className="size-4" checked={reactOn} onChange={(e) => setReactOn(e.target.checked)} />
              Reactions
              {reactOn && fired.length > 0 && <span className="text-emerald-700">{fired.length}</span>}
            </label>
          )}
          {liveOn && (
            <select
              aria-label="Seconds between two readings"
              className="h-10 rounded-md border bg-background px-1 text-xs"
              value={every}
              onChange={(event) => setEvery(Number(event.target.value))}
            >
              {[2, 5, 10].map((seconds) => (
                <option key={seconds} value={seconds}>
                  every {seconds} s
                </option>
              ))}
            </select>
          )}
          {EDGE_KINDS.map((kind) => (
            <label key={kind} className="flex min-h-10 cursor-pointer items-center gap-1.5 text-xs">
              <input
                type="checkbox"
                className="size-4"
                checked={kinds.has(kind)}
                onChange={(event) => {
                  const next = new Set(kinds);
                  if (event.target.checked) next.add(kind);
                  else next.delete(kind);
                  setKinds(next);
                }}
              />
              {LAYER[kind]}
            </label>
          ))}
        </div>
      </header>

      <div
        ref={setWorkbench}
        className="grid min-h-0 flex-1"
        style={{ gridTemplateColumns: `${fitted.left}px ${HANDLE}px minmax(0, 1fr) ${HANDLE}px ${fitted.right}px` }}
      >
        <aside className="min-w-0 space-y-4 overflow-y-auto p-3">
          <Section
            title="Models"
            action={
              !creating && (
                <button
                  className="rounded-md px-2 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
                  disabled={busy || dirty.length > 0}
                  title={dirty.length > 0 ? "Save or discard your edits first" : "Add the model of a new DT to the repository"}
                  onClick={() => setCreating({ id: "", label: "" })}
                >
                  New DT
                </button>
              )
            }
          >
            {creating && (
              <div className="space-y-2 rounded-md border p-2">
                <input
                  aria-label="Name of the model"
                  autoFocus
                  className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                  placeholder="Model, as in room3"
                  value={creating.id}
                  onChange={(event) => setCreating({ ...creating, id: event.target.value })}
                />
                <input
                  aria-label="Name of the DT"
                  className="h-10 w-full rounded-md border bg-background px-2 text-sm"
                  placeholder="DT, as in Room 3"
                  value={creating.label}
                  onChange={(event) => setCreating({ ...creating, label: event.target.value })}
                  onKeyDown={(event) => event.key === "Enter" && create()}
                />
                {creating.id.trim() && working && modelProblem(working, creating.id.trim()) && (
                  <p className="text-xs text-red-900">{modelProblem(working, creating.id.trim())}</p>
                )}
                <div className="flex gap-2">
                  <Act
                    variant="default"
                    disabled={busy || !creating.id.trim() || !working || modelProblem(working, creating.id.trim()) !== null}
                    onClick={create}
                  >
                    Create version 1
                  </Act>
                  <Act variant="ghost" onClick={() => setCreating(null)}>
                    Cancel
                  </Act>
                </div>
                <p className="text-xs text-muted-foreground">An empty type and an empty instance, for you to fill.</p>
              </div>
            )}
            <ul className="space-y-1">
              {models.map((model) => (
                <li key={model}>
                  <button
                    className={`flex min-h-10 w-full flex-wrap items-center justify-between gap-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted ${model === focus ? "bg-muted font-medium" : ""}`}
                    onClick={() => open(model)}
                  >
                    <span>
                      {model} <span className="font-normal text-muted-foreground">v{heads[model]}</span>
                    </span>
                    <span className="flex gap-1">
                      {dirty.includes(model) && <Tone value="modified">edited</Tone>}
                      {silent(model) && <Tone value="broken">no data</Tone>}
                      {waiting[model]?.drift && <Tone value="broken">drift</Tone>}
                      {(waiting[model]?.requests ?? 0) > 0 && <Tone value="pending">request</Tone>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Section>
          <Section title={`Versions of ${focus}`}>
            {(heads[focus] ?? 0) > 1 && (
              <p className="text-xs text-muted-foreground">
                Pick an earlier version to see it, or to go back to it and remove the versions after it.
              </p>
            )}
            <ul className="space-y-1">
              <li>
                <button
                  className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm hover:bg-muted ${viewing === "working" ? "bg-muted font-medium" : ""}`}
                  onClick={() => (setViewing("working"), setSelected(null))}
                >
                  Working copy
                  {proposal ? <Tone value="pending">proposal</Tone> : null}
                </button>
              </li>
              {[...history].reverse().map((info) => (
                <li key={info.id}>
                  <button
                    className={`min-h-10 w-full rounded-md px-2 py-1 text-left text-sm hover:bg-muted ${viewing === info.id ? "bg-muted font-medium" : ""}`}
                    onClick={() => (setViewing(info.id), setSelected(null))}
                  >
                    <span className="text-muted-foreground">v{info.id}</span> {info.message}
                  </button>
                  {viewing === info.id && info.id < (heads[focus] ?? 0) && (
                    <div className="mt-1 mb-2 px-2">
                      <RestoreVersion
                        model={focus}
                        version={info.id}
                        head={heads[focus] ?? 0}
                        blockers={restoreBlockers(versions, focus, info.id)}
                        unsaved={dirty.length > 0}
                        confirming={restoring === `${focus}@${info.id}`}
                        busy={busy}
                        onAsk={(asking) => setRestoring(asking ? `${focus}@${info.id}` : "")}
                        onRestore={() => restore(info.id)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="size-4"
                checked={compare}
                onChange={(event) => setCompare(event.target.checked)}
              />
              Show what a version changed
            </label>
          </Section>
          {viewing === "working" && !proposal && examples.edits.some((e) => e.model === focus) && (
            <Section title="Example edits">
              {examples.edits
                .filter((example) => example.model === focus)
                .map((example) => (
                  <Act
                    key={example.name}
                    className="h-auto min-h-10 w-full justify-start whitespace-normal py-1.5 text-left"
                    onClick={() => working && setEdited({ token, fed: applyEdit(working, focus, example.files) })}
                  >
                    Apply {example.name}
                  </Act>
                ))}
            </Section>
          )}
          {viewing === "working" && dirty.includes(focus) && !proposal && (
            <div className="space-y-1">
              <Act
                variant="default"
                className="w-full"
                title="See what changes, then accept it as the next version of this model"
                onClick={() => setTab("changes")}
              >
                Save as version {(heads[focus] ?? 0) + 1}…
              </Act>
              <p className="text-xs text-muted-foreground">
                Your edits are kept in this page only. They are saved when you accept them as the next version, in the
                Changes tab.
              </p>
            </div>
          )}
          {viewing === "working" && dirty.includes(focus) && !proposal && (
            <Act
              variant="ghost"
              className="w-full"
              onClick={() => headFed && working && setEdited({ token, fed: transplant(working, headFed, focus) })}
            >
              Discard my edits
            </Act>
          )}
        </aside>

        <Splitter
          side="left"
          label="Width of the models and versions"
          value={fitted.left}
          min={MIN_PANE.left}
          max={maxPane(fitted, "left", total)}
          onResize={(width) => keepPanes(resizePane(fitted, "left", width, total))}
          onReset={() => keepPanes(resizePane(fitted, "left", DEFAULT_PANES.left, total))}
        />

        <main className="min-h-0 min-w-0 p-3">
          {spec && (
            <Diagram
              spec={spec}
              arranged={arranged}
              onArrange={(next) => {
                const all = { ...arrangements, [focus]: toStable(spec, next) };
                setArrangements(all);
                keep(ARRANGEMENTS_KEY, all);
              }}
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                if (id) setTab("properties");
              }}
              onAction={(container) => {
                setSelected(container);
                setTab("properties");
              }}
            />
          )}
          {!spec && <p className="p-6 text-sm text-muted-foreground">Loading…</p>}
        </main>

        <Splitter
          side="right"
          label="Width of the properties, checks, changes, process, runtime and YAML"
          value={fitted.right}
          min={MIN_PANE.right}
          max={maxPane(fitted, "right", total)}
          onResize={(width) => keepPanes(resizePane(fitted, "right", width, total))}
          onReset={() => keepPanes(resizePane(fitted, "right", DEFAULT_PANES.right, total))}
        />

        <aside className="min-h-0 min-w-0">
          <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="flex h-full flex-col gap-0">
            <TabsList className="m-2 h-auto w-auto flex-wrap justify-start">
              <TabsTrigger className="min-h-10" value="properties">
                Properties
              </TabsTrigger>
              <TabsTrigger className="min-h-10" value="checks">
                Checks{issues.length ? ` (${issues.length})` : ""}
              </TabsTrigger>
              <TabsTrigger className="min-h-10" value="changes">
                Changes{changes ? " •" : ""}
              </TabsTrigger>
              <TabsTrigger className="min-h-10" value="process">
                Process{driftCount ? ` (${driftCount})` : ""}
              </TabsTrigger>
              <TabsTrigger className="min-h-10" value="runtime">
                Runtime
              </TabsTrigger>
              <TabsTrigger className="min-h-10" value="yaml">
                YAML
              </TabsTrigger>
            </TabsList>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
              <TabsContent value="properties">
                {readOnly && (
                  <p className="mb-3 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
                    {proposal
                      ? "Read-only: a proposal is waiting for your decision in the Process and Changes tabs."
                      : "Read-only: a committed version. Switch to the working copy to edit."}
                  </p>
                )}
                {shown && (
                  <Properties
                    fed={shown}
                    focus={focus}
                    selected={selected}
                    readOnly={readOnly}
                    statuses={statuses}
                    update={update}
                    onSelect={setSelected}
                    onOpen={open}
                    readings={liveOn && viewing === "working" ? (live.readings[focus] ?? []) : undefined}
                    reactions={{
                      armed: liveOn && reactOn,
                      values,
                      log: fired,
                      conceptsUnsaved: focus !== "core" && dirty.some((m) => working?.models[m]?.level === "O2"),
                    }}
                  />
                )}
              </TabsContent>
              <TabsContent value="checks">
                <Section title={`Gate of ${focus}`}>
                  {issues.length === 0 && <p className="text-sm text-emerald-800">This model passes its checks.</p>}
                  <ul className="space-y-2 text-sm">
                    {issues.map((issue) => (
                      <li key={issueText(issue)} className="rounded-md border border-red-200 bg-red-50 p-2">
                        <p className="font-medium">
                          {issue.check} · {issue.element}
                        </p>
                        <p>{issue.message}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Its own conformance across levels, and the correspondences it initiates, against the current
                    version of the models it weaves.
                  </p>
                </Section>
                <div className="mt-5">
                  <Section title="Correspondences that involve it">
                    <ul className="space-y-1 text-sm">
                      {statuses
                        .filter((s) => modelOf(s.initiating) === focus || modelOf(s.participating ?? "") === focus)
                        .map((status) => (
                          <li key={status.correspondence ?? status.initiating} className="flex items-center justify-between gap-2">
                            <button
                              className="min-h-10 min-w-0 truncate text-left hover:underline"
                              onClick={() => {
                                if (status.correspondence) setSelected(`link:${status.correspondence}`);
                                setTab("properties");
                              }}
                            >
                              {status.correspondence ?? status.initiating}
                              <span className="text-muted-foreground"> · {parseRef(status.initiating).model}</span>
                            </button>
                            <Tone value={status.status} />
                          </li>
                        ))}
                    </ul>
                  </Section>
                </div>
              </TabsContent>
              <TabsContent value="changes">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {viewing === "working"
                      ? active
                        ? `What accepting would commit as version ${(heads[focus] ?? 0) + 1} of ${focus}, as a model diff (Munidiff).`
                        : "The working copy equals the committed version."
                      : `What version ${viewing} of ${focus} changed, as stored next to it (changes.munidiff).`}
                  </p>
                  <MunidiffView
                    text={changes}
                    empty={viewing === "working" ? "No difference in this model." : "The first version: everything is new."}
                  />
                  {viewing === "working" && decisionBar}
                </div>
              </TabsContent>
              <TabsContent value="process">
                <ProcessPanel
                  view={processView}
                  mode={viewing === "working" ? "live" : "stored"}
                  focus={focus}
                  cause={viewing === "working" && active ? CAUSE[active.trigger.kind] : undefined}
                  chosen={chosen}
                  onChoose={(drift, option) => setChoices({ ...choices, [drift]: option })}
                  decision={stored?.decision}
                  settled={settled}
                  requests={viewing === "working" ? requests : []}
                  onOpenRequest={(correspondence) => {
                    const trigger: Trigger = { kind: "request", correspondence };
                    const result = runTrigger(versions, focus, trigger);
                    if (result) setExplicit({ token, focus, trigger, result });
                    setTab("changes");
                  }}
                  onOpen={open}
                >
                  {decisionBar}
                </ProcessPanel>
              </TabsContent>
              <TabsContent value="runtime">
                {headFed && (
                  <RuntimePanel
                    fed={headFed}
                    head={token}
                    examples={examples.batches}
                    blockedFor={blockedFor}
                    live={live}
                    onObservations={(batch) => {
                      const trigger: Trigger = { kind: "observations", batch };
                      const result = runTrigger(versions, batch.source, trigger);
                      if (!result) return;
                      setExplicit({ token, focus: batch.source, trigger, result });
                      open(batch.source);
                      setTab("process");
                    }}
                    onTimeliness={(batches, now, violations) => {
                      const owner = modelOf(violations[0].element);
                      const trigger: Trigger = { kind: "timeliness", batches, now };
                      const result = runTrigger(versions, owner, trigger);
                      if (!result) return;
                      setExplicit({ token, focus: owner, trigger, result });
                      open(owner);
                      setTab("process");
                    }}
                  />
                )}
              </TabsContent>
              <TabsContent value="yaml">
                <div className="space-y-2">
                  <Choice label="File" value={file} options={Object.keys(files)} onChange={setYamlFile} />
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">{files[file]}</pre>
                  <p className="text-xs text-muted-foreground">
                    Read-only: the file as it is stored in a version of {focus}.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
