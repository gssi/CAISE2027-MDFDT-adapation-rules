"use client";

import { useMemo, useState } from "react";

import { type ObservationBatch, type Violation } from "@/engine/assistant/change";
import { type Federation } from "@/engine/federation";
import { toBatch, type Reading } from "@/engine/devices";
import { type Dict } from "@/engine/kernel/model";
import { dumpYaml, loadYaml } from "@/engine/kernel/yaml";
import { project } from "@/engine/runtime/projection";
import { checkTimeliness, emit, receive } from "@/engine/runtime/simulator";

import { Act, Choice, Code, Field, Section, Tone } from "./controls";
import { DeviceRuntime } from "./Devices";

export interface RuntimePanelProps {
  fed: Federation; // the committed model: the runtime is generated from it
  head: string; // identifies the current versions: the log of observations starts again when they change
  examples: { name: string; text: string }[];
  /** Why a DT cannot report now, if it cannot: it has uncommitted edits. */
  blockedFor: (model: string | null) => string | null;
  /** The latest live readings by model, and when they were taken; empty when live reading is off. */
  live: { readings: Record<string, Reading[]>; at: number | null };
  onObservations: (batch: ObservationBatch) => void;
  onTimeliness: (batches: ObservationBatch[], now: number, violations: Violation[]) => void;
}

function parse(text: string, etype: string): unknown {
  if (etype === "EBoolean") return text.trim().toLowerCase() === "true";
  if (etype === "EInt" || etype === "EDouble") return Number(text);
  return text;
}

export function RuntimePanel({ fed, head, examples, blockedFor, live, onObservations, onTimeliness }: RuntimePanelProps) {
  const config = useMemo(() => project(fed), [fed]);
  const [log, setLog] = useState<{ head: string; batches: ObservationBatch[] }>({ head, batches: [] });
  const logged = useMemo(() => (log.head === head ? log.batches : []), [log, head]);
  // what the devices report now counts like what was emitted by hand
  const batches = useMemo(
    () => [
      ...logged,
      ...Object.entries(live.readings).map(([model, readings]) => toBatch(fed, model, readings, live.at ?? 0)),
    ],
    [logged, live, fed],
  );
  const [now, setNow] = useState("100");
  const [values, setValues] = useState<Record<string, string>>({});
  const [report, setReport] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [violations, setViolations] = useState<Violation[] | null>(null);
  const blocked = blockedFor(null);

  const received = useMemo(() => {
    try {
      return receive(config, batches);
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) } as Record<string, unknown>;
    }
  }, [config, batches]);
  const time = Number(now) || 0;

  const send = (name: string, emits: Dict[]) => {
    const observed: Record<string, unknown> = {};
    for (const entry of emits) {
      const text = values[`${name}.${entry.key}`];
      if (text !== undefined && text !== "") observed[entry.key] = parse(text, entry.eType);
    }
    if (!Object.keys(observed).length) return;
    setLog({ head, batches: [...logged, emit(name, observed, time)] });
    setViolations(null);
  };

  const submitReport = () => {
    try {
      const batch = loadYaml<ObservationBatch>(report);
      if (!batch || typeof batch !== "object" || !batch.source || !(batch.source in fed.models)) {
        setProblem("The batch must name an existing DT instance in `source`.");
        return;
      }
      const why = blockedFor(batch.source);
      if (why) {
        setProblem(why);
        return;
      }
      setProblem(null);
      setLog({ head, batches: [...logged, batch] });
      onObservations(batch);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        The runtime is the projection of the current version of every model: it is regenerated from the models, never patched by hand.
      </p>
      {Object.entries(config.dts).map(([name, dt]) => (
        <Section key={name} title={`${dt.dt} · ${name} : ${dt.type}`}>
          <p className="text-xs text-muted-foreground">
            {(dt.roles as string[]).length ? `${(dt.roles as string[]).join(" and ")} DT` : "no role in a correspondence"}
          </p>
          {(dt.emits as Dict[]).length > 0 && (
            <div className="space-y-2 rounded-md border p-2">
              <div className="grid grid-cols-2 gap-2">
                {(dt.emits as Dict[]).map((entry) => (
                  <Field key={entry.key} label={`emits ${entry.key}: ${entry.eType}${entry.unit ? ` [${entry.unit}]` : ""}`}>
                    <input
                      className="h-10 min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
                      placeholder={entry.eType === "EBoolean" ? "true / false" : "value"}
                      value={values[`${name}.${entry.key}`] ?? ""}
                      onChange={(event) => setValues({ ...values, [`${name}.${entry.key}`]: event.target.value })}
                    />
                  </Field>
                ))}
              </div>
              <Act onClick={() => send(name, dt.emits as Dict[])}>Emit at t = {time}</Act>
            </div>
          )}
          {(dt.inputs as Dict[]).length > 0 && (
            <ul className="space-y-1 text-sm">
              {(dt.inputs as Dict[]).map((entry) => (
                <li key={entry.correspondence} className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <Code>{entry.element}</Code>
                    {entry.status === "active" ? (
                      <>
                        {" "}
                        ← {entry.from}.{entry.key}
                        {entry.mapping && (
                          <>
                            {" "}
                            via <Code>{entry.mapping}</Code>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground"> — {entry.changeRequest}</span>
                    )}
                    {entry.element in received && (
                      <strong className="ml-1">= {String(received[entry.element])}</strong>
                    )}
                  </span>
                  <Tone value={entry.status} />
                </li>
              ))}
            </ul>
          )}
          {(dt.dependents as Dict[]).length > 0 && (
            <ul className="space-y-1 text-sm">
              {(dt.dependents as Dict[]).map((entry) => (
                <li key={entry.element} className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <Code>{entry.element}</Code> <span className="text-muted-foreground">{entry.class}</span>
                    {entry.excluded && (
                      <span className="text-muted-foreground"> — without {(entry.excluded as string[]).join(", ")}</span>
                    )}
                  </span>
                  <Tone value={entry.status} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      ))}
      {"error" in received && <p className="text-sm text-red-900">{String(received.error)}</p>}

      <Section title="Timeliness">
        <div className="flex items-end gap-2">
          <Field label="Current time t (s)" className="w-32">
            <input
              className="h-10 rounded-md border bg-background px-2 text-sm text-foreground"
              value={now}
              onChange={(event) => setNow(event.target.value)}
            />
          </Field>
          <Act
            disabled={Boolean(blocked)}
            title={blocked ?? undefined}
            onClick={() => {
              const found = checkTimeliness(config, batches, time);
              setViolations(found);
              if (found.length) onTimeliness(batches, time, found);
            }}
          >
            Check timeliness
          </Act>
          <Act variant="ghost" onClick={() => setLog({ head, batches: [] })} disabled={!logged.length}>
            Clear {logged.length} batch(es)
          </Act>
        </div>
        {violations !== null && violations.length === 0 && (
          <p className="text-sm text-emerald-800">Timeliness holds at t = {time}.</p>
        )}
        {violations !== null && violations.length > 0 && (
          <ul className="list-disc pl-5 text-sm text-red-900">
            {violations.map((violation) => (
              <li key={`${violation.correspondence}${violation.violation}`}>{violation.reason}</li>
            ))}
          </ul>
        )}
      </Section>

      <DeviceRuntime
        fed={fed}
        models={Object.keys(config.dts)}
        now={time}
        live={live.readings}
        blockedFor={blockedFor}
        onBatch={(batch) => {
          setLog({ head, batches: [...logged, batch] });
          setViolations(null);
        }}
        onSend={onObservations}
      />

      <Section title="Report from a DT">
        <p className="text-sm text-muted-foreground">
          An observation batch as a DT sends it: its capabilities (when they change) and its observations.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Choice
            label="Load an example batch"
            value=""
            empty="load an example…"
            options={examples.map((example) => example.name)}
            onChange={(value) => setReport(examples.find((e) => e.name === value)?.text ?? report)}
          />
          <Choice
            label="Start from the current capabilities of a DT"
            value=""
            empty="start from a DT…"
            options={Object.keys(config.dts)}
            onChange={(value) =>
              value &&
              setReport(
                dumpYaml({
                  source: value,
                  capabilities: fed.capabilities[value] ?? {},
                  observations: (config.dts[value].emits as Dict[]).map((e) => ({
                    key: e.key,
                    value: e.eType === "EBoolean" ? true : 1,
                    timestamp: time,
                  })),
                }),
              )
            }
          />
        </div>
        <textarea
          aria-label="Observation batch (YAML)"
          className="h-44 w-full rounded-md border bg-background p-2 font-mono text-xs"
          value={report}
          spellCheck={false}
          onChange={(event) => setReport(event.target.value)}
        />
        {problem && <p className="text-sm text-red-900">{problem}</p>}
        <Act variant="default" disabled={!report.trim()} onClick={submitReport}>
          Send to the modeling layer
        </Act>
      </Section>
    </div>
  );
}
