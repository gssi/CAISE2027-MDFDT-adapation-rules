/**
 * Reactions: what a DT does by itself when something it observes changes.
 *
 * A reaction is an object of a DT model whose class is of a concept marked
 * `reaction`. It refers to what it observes (`input`) and to the part of a
 * device that acts (`target`), and says when (`when`, a condition over the
 * attributes of the input, in the language of the mappings) and what
 * (`operation`, with one slot per argument).
 *
 * A reaction fires on a rising edge: when its condition was false at the last
 * reading and is true now. This module only reads the model and decides; the
 * connector of the device performs the operation.
 */
import { type Issue } from "../conformance";
import { checkArguments, devicesOf, type DeviceSpec, type SensorSpec } from "../devices";
import { classProps, typeOf, type Federation } from "../federation";
import { targets, type Dict } from "../kernel/model";
import { ref } from "../kernel/refs";
import { MappingError, conditionType, conditionValue, namesIn } from "../mapping";
import { type LiveValue } from "./live";

const FIXED = ["when", "operation"];

export interface ReactionSpec {
  model: string;
  id: string; // the O0 object
  input: string | null; // the object it observes
  /** The attributes of the input a condition can read, with their types. */
  types: Record<string, string>;
  when: string;
  target: string | null; // the part that acts
  operation: string;
  args: Dict;
}

/** The reactions a DT model describes. */
export function reactionsOf(fed: Federation, model: string): ReactionSpec[] {
  const instance = fed.models[model];
  const type = instance?.level === "O0" ? typeOf(fed, instance) : null;
  if (!instance || !type) return [];
  const out: ReactionSpec[] = [];
  for (const obj of Object.values(instance.objects)) {
    if (!classProps(fed, type, obj.instanceOf).reaction) continue;
    const eclass = type.eClasses[obj.instanceOf];
    const input = targets(obj, "input")[0] ?? null;
    const observed = type.eClasses[instance.objects[input ?? ""]?.instanceOf ?? ""];
    const args: Dict = {};
    for (const name of Object.keys(eclass?.eAttributes ?? {})) {
      if (!FIXED.includes(name) && name in obj.slots) args[name] = obj.slots[name];
    }
    out.push({
      model,
      id: obj.name,
      input,
      types: Object.fromEntries(Object.values(observed?.eAttributes ?? {}).map((a) => [a.name, a.eType])),
      when: String(obj.slots.when ?? ""),
      target: targets(obj, "target")[0] ?? null,
      operation: String(obj.slots.operation ?? ""),
      args,
    });
  }
  return out;
}

/** The device and the part a reaction acts on, as the model describes them. */
export function actorOf(fed: Federation, reaction: ReactionSpec): { device: DeviceSpec; part: SensorSpec } | null {
  for (const device of devicesOf(fed, reaction.model)) {
    const part = device.sensors.find((candidate) => candidate.id === reaction.target);
    if (part) return { device, part };
  }
  return null;
}

/** What is wrong with the reactions of a model; part of its gate. */
export function checkReactions(fed: Federation, model: string): Issue[] {
  const issues: Issue[] = [];
  for (const reaction of reactionsOf(fed, model)) {
    const add = (message: string) => issues.push({ check: "reaction", element: ref(model, reaction.id), message });
    if (!reaction.input) add("it observes nothing: set its input");
    if (!reaction.when.trim()) add("it has no condition (when)");
    else if (reaction.input) {
      try {
        const unknown = namesIn(reaction.when).filter((name) => !(name in reaction.types));
        if (unknown.length) add(`${reaction.input} has no attribute ${unknown.join(", ")}`);
        else if (conditionType(reaction.when, reaction.types) !== "EBoolean") {
          add(`the condition '${reaction.when}' is not Boolean`);
        }
      } catch (error) {
        if (!(error instanceof MappingError)) throw error;
        add(`invalid condition '${reaction.when}': ${error.message}`);
      }
    }
    if (!reaction.target) {
      add("nothing acts: set its target");
      continue;
    }
    const actor = actorOf(fed, reaction);
    if (!actor) {
      add(`${reaction.target} is not a part of a device`);
      continue;
    }
    const operation = actor.part.operations.find((o) => o.name === reaction.operation);
    if (!operation) add(`${reaction.target} has no operation '${reaction.operation}'`);
    else for (const problem of checkArguments(operation, reaction.args)) add(problem);
  }
  return issues;
}

/** Whether the condition of a reaction holds for some readings; undefined when a value it needs is missing. */
export function holds(reaction: ReactionSpec, values: Record<string, LiveValue>): boolean | undefined {
  if (!reaction.input || !reaction.when.trim()) return undefined;
  const read: Dict = {};
  try {
    for (const name of namesIn(reaction.when)) {
      const live = values[ref(reaction.model, reaction.input, name)];
      if (!live || live.error !== undefined || live.value === undefined) return undefined;
      read[name] = live.value;
    }
    return conditionValue(reaction.when, reaction.types, read);
  } catch (error) {
    if (error instanceof MappingError) return undefined;
    throw error;
  }
}

/**
 * The reactions that fire between two readings: their condition was false and
 * is true now. A first reading only sets the reference, so nothing fires for a
 * condition that is already true when the watching starts.
 */
export function fire(
  reactions: ReactionSpec[],
  before: Record<string, LiveValue>,
  now: Record<string, LiveValue>,
): ReactionSpec[] {
  return reactions.filter((reaction) => holds(reaction, before) === false && holds(reaction, now) === true);
}
