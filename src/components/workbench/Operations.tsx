"use client";

import { useState } from "react";

import { sensorKind } from "@/connectors/catalogue";
import { type DeviceSpec, type OperationSpec, type SensorSpec } from "@/engine/devices";
import { type Dict } from "@/engine/kernel/model";
import { invoke } from "@/server/actions";

import { Act, Field } from "./controls";

function parse(text: string, etype: string): unknown {
  if (etype === "EBoolean") return text === "true";
  if (etype === "EInt") return Math.trunc(Number(text));
  if (etype === "EDouble") return Number(text);
  return text;
}

/** One operation of a part: its parameters, and the button that asks the device to do it. */
function Operation({ device, part, operation }: { device: DeviceSpec; part: SensorSpec; operation: OperationSpec }) {
  const known = sensorKind(device.connector, part.kind)?.operations?.find((o) => o.name === operation.name);
  const initial = Object.fromEntries(
    operation.parameters.map((p) => {
      const fallback = known?.parameters.find((k) => k.name === p.name)?.fallback;
      return [p.name, String(fallback ?? (p.eType === "EBoolean" ? false : p.eType === "EString" ? "" : 0))];
    }),
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);

  const run = async () => {
    const args: Dict = {};
    for (const parameter of operation.parameters) args[parameter.name] = parse(values[parameter.name], parameter.eType);
    setBusy(true);
    const result = await invoke(device, part.id, operation.name, args);
    setBusy(false);
    setOutcome(result.ok ? { ok: true, text: "done" } : { ok: false, text: result.error });
  };

  return (
    <div className="space-y-1.5 rounded-md border bg-background p-2">
      <p className="text-sm">
        <span className="font-medium">{operation.name}</span>
        <span className="text-muted-foreground">({operation.parameters.map((p) => p.name).join(", ")})</span>
        {known?.description && <span className="block text-xs text-muted-foreground">{known.description}</span>}
      </p>
      <div className="flex flex-wrap items-end gap-2">
        {operation.parameters.map((parameter) => {
          const info = known?.parameters.find((k) => k.name === parameter.name);
          const label = `${parameter.name}${parameter.unit ? ` [${parameter.unit}]` : ""}`;
          return parameter.eType === "EBoolean" ? (
            <label key={parameter.name} className="flex min-h-10 items-center gap-1.5 text-sm" title={info?.description}>
              <input
                type="checkbox"
                className="size-4"
                checked={values[parameter.name] === "true"}
                onChange={(event) => setValues({ ...values, [parameter.name]: String(event.target.checked) })}
              />
              {label}
            </label>
          ) : (
            <Field key={parameter.name} label={label} className="w-24">
              <input
                className="h-10 min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
                inputMode={parameter.eType === "EString" ? "text" : "numeric"}
                title={info?.description}
                value={values[parameter.name]}
                onChange={(event) => setValues({ ...values, [parameter.name]: event.target.value })}
                onKeyDown={(event) => event.key === "Enter" && run()}
              />
            </Field>
          );
        })}
        <Act variant="default" disabled={busy} onClick={run} title="This acts on the device">
          {busy ? "Invoking…" : "Invoke"}
        </Act>
        {outcome && (
          <span className={`min-h-10 content-center text-sm ${outcome.ok ? "text-emerald-800" : "text-red-900"}`}>
            {outcome.text}
          </span>
        )}
      </div>
    </div>
  );
}

/** What a part of a device can be asked to do: the operations of its class, invocable. */
export function Operations({ device, part }: { device: DeviceSpec; part: SensorSpec }) {
  if (!part.operations.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground">Operations of its class: invoking one acts on the device.</p>
      {part.operations.map((operation) => (
        <Operation key={operation.name} device={device} part={part} operation={operation} />
      ))}
    </div>
  );
}
