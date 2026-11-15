/**
 * The model of a new DT: an empty type and an empty instance, for its modeler
 * to fill. Nothing of another model is touched.
 */
import { type Federation } from "../federation";
import { modelKey, type Model } from "../kernel/model";
import { nameProblem } from "./rename";

/** Why a DT cannot be given the model `id`, or null when it can. */
export function modelProblem(fed: Federation, id: string): string | null {
  const taken = new Set([...Object.keys(fed.models), ...Object.values(fed.models).map((m) => m.name)]);
  const problem = nameProblem(taken, id);
  if (problem) return problem.replace("in this model", "by a model of the repository");
  if (!Object.values(fed.models).some((m) => m.level === "O2")) return "the repository has no shared concepts to type the DT";
  return null;
}

/**
 * Add to `fed` the first version of the model `id` of the DT called `label`:
 * its type, typed by the shared concepts, and its instance. Returns why it
 * cannot be added, or null when it was.
 */
export function addDT(fed: Federation, id: string, label: string): string | null {
  const problem = modelProblem(fed, id);
  if (problem) return problem;
  const concepts = Object.values(fed.models).find((m) => m.level === "O2")!;
  const type: Model = { level: "O1", name: id, version: 1, typedBy: modelKey(concepts), dt: null, eClasses: {}, objects: {} };
  fed.models[modelKey(type)] = type;
  fed.models[id] = { level: "O0", name: id, version: null, typedBy: modelKey(type), dt: label.trim() || id, eClasses: {}, objects: {} };
  fed.capabilities[id] = {};
  return null;
}
