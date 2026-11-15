"use client";

import { useState } from "react";

import { sensorKind } from "@/connectors/catalogue";
import { devicesOf, isSensor } from "@/engine/devices";
import { classProps, typeOf, type Federation } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { type LiveValue } from "@/engine/runtime/live";
import { actorOf, holds, reactionsOf } from "@/engine/runtime/reactions";
import { invoke } from "@/server/actions";

import { Act, Choice, Code, Field, Section, Tone } from "./controls";
import { addReaction, ensureConcept, hasConcept } from "./edits";

/** A reaction that fired, or was tried, and how it went. */
export interface Fired {
  at: number;
  reaction: string; // model#object
  text: string;
  ok: boolean;
}

function parse(text: string, etype: string): unknown {
  if (etype === "EBoolean") return text === "true";
  if (etype === "EInt") return Math.trunc(Number(text));
  if (etype === "EDouble") return Number(text);
  return text;
}

/** What a condition can read: the attributes of the objects that carry data. */
function observable(fed: Federation, model: string): { value: string; eType: string }[] {
  const instance = fed.models[model];
  const type = typeOf(fed, instance);
  const out: { value: string; eType: string }[] = [];
  for (const obj of Object.values(instance?.objects ?? {})) {
    const props = classProps(fed, type, obj.instanceOf);
    if (!props.requiresSource || isSensor(fed, instance, obj)) continue;
    for (const attribute of Object.values(type?.eClasses[obj.instanceOf]?.eAttributes ?? {})) {
      out.push({ value: `${obj.name}.${attribute.name}`, eType: attribute.eType });
    }
  }
  return out;
}

export function Reactions(props: {
  fed: Federation;
  model: string;
  readOnly: boolean;
  /** Whether reactions are being run, and with which readings. */
  armed: boolean;
  values: Record<string, LiveValue> | null;
  log: Fired[];
  /** The shared concepts have unsaved changes that this model needs. */
  conceptsUnsaved: boolean;
  update: (change: (fed: Federation) => void) => void;
  onSelect: (id: string) => void;
}) {
  const { fed, model } = props;
  const reactions = reactionsOf(fed, model);
  const inputs = observable(fed, model);
  const parts = devicesOf(fed, model).flatMap((device) =>
    device.sensors.filter((part) => part.operations.length).map((part) => ({ device, part })),
  );
  const [input, setInput] = useState("");
  const [when, setWhen] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [operationName, setOperationName] = useState("");
  const [args, setArgs] = useState<Record<string, string>>({});
  const [tested, setTested] = useState<Record<string, string>>({});

  const chosenInput = inputs.find((i) => i.value === input) ?? inputs[0];
  const attribute = chosenInput?.value.split(".")[1] ?? "";
  const condition = when ?? (chosenInput ? (chosenInput.eType === "EBoolean" ? attribute : `${attribute} > 0`) : "");
  const actor = parts.find((p) => p.part.id === target) ?? parts[0];
  const operation = actor?.part.operations.find((o) => o.name === operationName) ?? actor?.part.operations[0];
  const known = actor && operation
    ? sensorKind(actor.device.connector, actor.part.kind)?.operations?.find((o) => o.name === operation.name)
    : undefined;
  const argument = (name: string, etype: string) =>
    args[name] ??
    String(known?.parameters.find((p) => p.name === name)?.fallback ?? (etype === "EBoolean" ? false : etype === "EString" ? "" : 0));

  const add = () => {
    if (!chosenInput || !actor || !operation || !condition.trim()) return;
    const given: Dict = {};
    for (const parameter of operation.parameters) given[parameter.name] = parse(argument(parameter.name, parameter.eType), parameter.eType);
    props.update((f) => {
      const id = addReaction(f, model, {
        input: chosenInput.value,
        when: condition.trim(),
        target: actor.part.id,
        operation: operation.name,
        args: given,
      });
      if (id) queueMicrotask(() => props.onSelect(`${model}#${id}`));
    });
    setWhen(null);
    setArgs({});
  };

  if (!hasConcept(fed, "reaction")) {
    return (
      <Section title="Reactions">
        <p className="text-sm text-muted-foreground">
          The shared concepts of this repository do not know reactions yet. Adding the concept changes the model
          <Code>core</Code>: save it as its next version before the model that uses it.
        </p>
        {!props.readOnly && (
          <Act onClick={() => props.update((f) => void ensureConcept(f, "reaction"))}>Add the Reaction concept</Act>
        )}
      </Section>
    );
  }

  return (
    <Section title="Reactions">
      <p className="text-xs text-muted-foreground">
        When a condition on what the model observes becomes true, an operation of a part of a device is invoked.
        Reactions run while <strong>Live</strong> and <strong>Reactions</strong> are on in the top bar.
      </p>
      {props.conceptsUnsaved && (
        <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
          The model <Code>core</Code> has unsaved changes this model needs: save <Code>core</Code> first.
        </p>
      )}
      {reactions.map((reaction) => {
        const state = props.values ? holds(reaction, props.values) : undefined;
        const last = props.log.find((entry) => entry.reaction === `${model}#${reaction.id}`);
        const acts = actorOf(fed, reaction);
        return (
          <div key={reaction.id} className="space-y-1 rounded-md border p-2 text-sm">
            <div className="flex items-start justify-between gap-2">
              <button className="min-h-10 min-w-0 text-left" onClick={() => props.onSelect(`${model}#${reaction.id}`)}>
                <span className="font-medium">{reaction.id}</span>
                <span className="block text-muted-foreground">
                  when <Code>{reaction.when}</Code> on {reaction.input} → {reaction.target}.{reaction.operation}(
                  {Object.values(reaction.args).join(", ")})
                </span>
              </button>
              {props.armed ? (
                <Tone value={state === true ? "active" : state === false ? "pending" : "missing"}>
                  {state === true ? "true now" : state === false ? "armed" : "no reading"}
                </Tone>
              ) : (
                <Tone value="low">not running</Tone>
              )}
            </div>
            {last && (
              <p className={`text-xs ${last.ok ? "text-emerald-800" : "text-red-900"}`}>
                {new Date(last.at * 1000).toLocaleTimeString()} · {last.text}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Act
                disabled={!acts}
                title="Invoke the operation once, now: this acts on the device"
                onClick={async () => {
                  if (!acts) return;
                  const result = await invoke(acts.device, acts.part.id, reaction.operation, reaction.args);
                  setTested({ ...tested, [reaction.id]: result.ok ? "done" : result.error });
                }}
              >
                Test now
              </Act>
              {tested[reaction.id] && <span className="text-xs">{tested[reaction.id]}</span>}
            </div>
          </div>
        );
      })}
      {reactions.length === 0 && <p className="text-sm text-muted-foreground">This model has no reaction yet.</p>}

      {!props.readOnly &&
        (inputs.length === 0 || parts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            A reaction needs something observed{inputs.length === 0 ? " (an observation of this model)" : ""} and a
            part of a device that can act{parts.length === 0 ? " (add one under Devices and sensors)" : ""}.
          </p>
        ) : (
          <div className="space-y-2 rounded-md border border-dashed p-2">
            <div className="grid grid-cols-2 gap-2">
              <Field label="When, on">
                <Choice
                  value={chosenInput?.value ?? ""}
                  options={inputs.map((i) => i.value)}
                  onChange={(value) => (setInput(value), setWhen(null))}
                />
              </Field>
              <Field label="becomes true">
                <input
                  aria-label="Condition"
                  className="h-10 min-w-0 rounded-md border bg-background px-2 font-mono text-sm text-foreground"
                  value={condition}
                  onChange={(event) => setWhen(event.target.value)}
                />
              </Field>
              <Field label="invoke on">
                <Choice
                  value={actor?.part.id ?? ""}
                  options={parts.map((p) => p.part.id)}
                  onChange={(value) => (setTarget(value), setOperationName(""), setArgs({}))}
                />
              </Field>
              <Field label="the operation">
                <Choice
                  value={operation?.name ?? ""}
                  options={actor?.part.operations.map((o) => o.name) ?? []}
                  onChange={(value) => (setOperationName(value), setArgs({}))}
                />
              </Field>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {operation?.parameters.map((parameter) =>
                parameter.eType === "EBoolean" ? (
                  <label key={parameter.name} className="flex min-h-10 items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={argument(parameter.name, parameter.eType) === "true"}
                      onChange={(event) => setArgs({ ...args, [parameter.name]: String(event.target.checked) })}
                    />
                    {parameter.name}
                  </label>
                ) : (
                  <Field
                    key={parameter.name}
                    label={`${parameter.name}${parameter.unit ? ` [${parameter.unit}]` : ""}`}
                    className="w-24"
                  >
                    <input
                      className="h-10 min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
                      value={argument(parameter.name, parameter.eType)}
                      onChange={(event) => setArgs({ ...args, [parameter.name]: event.target.value })}
                    />
                  </Field>
                ),
              )}
              <Act variant="default" onClick={add} disabled={!condition.trim()}>
                Add reaction
              </Act>
            </div>
          </div>
        ))}
    </Section>
  );
}
