/**
 * Simulated runtime: just enough to emit observations, to compute what an
 * initiating DT receives, and to check timeliness.
 *
 * Timeliness is the one property of a correspondence that cannot be checked at
 * commit time: a violation observed here re-enters the process as a change.
 */
import { type Observation, type ObservationBatch, type Violation } from "../assistant/change";
import { type Dict } from "../kernel/model";
import { dataRef } from "../kernel/refs";
import { evaluate } from "../mapping";
import { type Projection } from "./projection";

/** An observation batch, as a DT sends it to the modeling layer. */
export function emit(
  source: string,
  values: Record<string, unknown>,
  timestamp: number,
  capabilities?: Record<string, Dict>,
): ObservationBatch {
  const batch: ObservationBatch = { source };
  if (capabilities !== undefined) batch.capabilities = capabilities;
  batch.observations = Object.entries(values).map(([key, value]) => ({ key, value, timestamp }));
  return batch;
}

function latest(batches: ObservationBatch[]): Map<string, Observation> {
  const out = new Map<string, Observation>();
  for (const batch of batches) {
    for (const observation of batch.observations ?? []) {
      const slot = `${batch.source}\u0000${observation.key}`;
      const known = out.get(slot);
      if (!known || observation.timestamp >= known.timestamp) out.set(slot, observation);
    }
  }
  return out;
}

const slotOf = (entry: Dict) => `${entry.from}\u0000${entry.key}`;

/** The values every initiating DT receives, by element. A value is only ever
 * obtained through an active correspondence, applying its mapping when there
 * is one: an input without a source gets no value. */
export function receive(config: Projection, batches: ObservationBatch[]): Record<string, unknown> {
  const seen = latest(batches);
  const values: Record<string, unknown> = {};
  for (const dt of Object.values(config.dts)) {
    for (const entry of dt.inputs as Dict[]) {
      const observation = seen.get(slotOf(entry));
      if (entry.status !== "active" || !observation) continue;
      let value = observation.value;
      if (entry.mapping) {
        value = evaluate(entry.mapping, entry.source.name, entry.source.eType, value);
      }
      values[entry.element] = value;
    }
  }
  return values;
}

function participatingOf(config: Projection, entry: Dict): string {
  for (const emitted of config.dts[entry.from].emits as Dict[]) {
    if (emitted.key === entry.key) return emitted.element;
  }
  return entry.from;
}

/**
 * Timeliness violations of the active correspondences at time `now`.
 *
 * `maxAge`: the latest observation is too old (or absent).
 * `syncTolerance`: the inputs used together by a dependent element were not
 * observed close enough in time.
 */
export function checkTimeliness(
  config: Projection,
  batches: ObservationBatch[],
  now: number,
): Violation[] {
  const seen = latest(batches);
  const violations: Violation[] = [];
  for (const [name, dt] of Object.entries(config.dts)) {
    const observed: Record<string, { at: number; timeliness: Dict; base: Dict }> = {};
    for (const entry of dt.inputs as Dict[]) {
      const timeliness: Dict | undefined = entry.timeliness;
      if (entry.status !== "active" || !timeliness) continue;
      const observation = seen.get(slotOf(entry));
      const base = {
        correspondence: entry.correspondence,
        element: entry.element,
        participating: participatingOf(config, entry),
        source: dataRef(entry.from, entry.key),
      };
      const age = observation ? now - observation.timestamp : null;
      const maxAge: number | undefined = timeliness.maxAge;
      if (maxAge !== undefined && maxAge !== null && (age === null || age > maxAge)) {
        const when = age === null ? "never observed" : `observed ${age} s ago`;
        violations.push({
          ...base,
          violation: "maxAge",
          expected: { maxAge },
          reason: `timeliness violated: ${base.source} ${when}, maximum age is ${maxAge} s`,
        });
      } else if (observation) {
        const owner = entry.element.split("#")[1].split(".")[0];
        observed[owner] = { at: observation.timestamp, timeliness, base };
      }
    }
    for (const dependent of dt.dependents as Dict[]) {
      const used = (dependent.uses as string[]).map((u) => u.split("#")[1]);
      const together = used.filter((u) => u in observed).map((u) => observed[u]);
      const tolerances = together
        .filter((t) => "syncTolerance" in t.timeliness)
        .map((t) => t.timeliness.syncTolerance as number);
      if (together.length < 2 || !tolerances.length) continue;
      const times = together.map((t) => t.at);
      const spread = Math.max(...times) - Math.min(...times);
      const tolerance = Math.min(...tolerances);
      if (spread > tolerance) {
        const oldest = together.reduce((a, b) => (b.at < a.at ? b : a)).base;
        violations.push({
          ...(oldest as Violation),
          violation: "syncTolerance",
          expected: { syncTolerance: tolerance },
          reason:
            `timeliness violated: the inputs of ${name}#${dependent.element.split("#")[1]} ` +
            `were observed ${spread} s apart, tolerance is ${tolerance} s`,
        });
      }
    }
  }
  return violations;
}
