/**
 * The model with what is being read right now: every value a device reports,
 * on the key that carries it, on the parameter of the sensor that sensed it, on
 * the attributes of the model bound to that key and, through the
 * correspondences, on what an initiating DT receives (mapping applied).
 */
import { type ObservationBatch } from "../assistant/change";
import { type Reading } from "../devices";
import { type Federation } from "../federation";
import { dataRef, ref } from "../kernel/refs";
import { project } from "./projection";
import { receive } from "./simulator";

export interface LiveValue {
  value?: unknown;
  error?: string;
}

/** Readings by model -> the value to show on every element they reach, by reference. */
export function liveValues(fed: Federation, readings: Record<string, Reading[]>): Record<string, LiveValue> {
  const out: Record<string, LiveValue> = {};
  const batches: ObservationBatch[] = [];
  for (const [model, list] of Object.entries(readings)) {
    const instance = fed.models[model];
    if (!instance) continue;
    const byKey = new Map<string, LiveValue>();
    for (const reading of list) {
      const live: LiveValue = reading.error === undefined ? { value: reading.value } : { error: reading.error };
      byKey.set(reading.key, live);
      out[dataRef(model, reading.key)] = live;
    }
    for (const obj of Object.values(instance.objects)) {
      for (const [attribute, key] of Object.entries(obj.bindings)) {
        const live = byKey.get(key);
        if (live) out[ref(model, obj.name, attribute)] = live;
      }
    }
    batches.push({
      source: model,
      observations: list
        .filter((reading) => reading.error === undefined)
        .map((reading) => ({ key: reading.key, value: reading.value, timestamp: 0 })),
    });
  }
  // What the initiating DTs receive: the same values, through their correspondences.
  const config = project(fed);
  try {
    for (const [element, value] of Object.entries(receive(config, batches))) out[element] = { value };
  } catch {
    // a value the mapping cannot take is shown where it was read, not where it would arrive
  }
  for (const dt of Object.values(config.dts)) {
    for (const input of dt.inputs as { element: string; from?: string; key?: string; status: string }[]) {
      const source = input.from && input.key ? out[dataRef(input.from, input.key)] : undefined;
      if (input.status === "active" && source?.error !== undefined) out[input.element] = { error: source.error };
    }
  }
  return out;
}
