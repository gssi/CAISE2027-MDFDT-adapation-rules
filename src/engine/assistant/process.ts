/**
 * The four-step process of the modelling assistant and the model-first loop.
 *
 * change -> classified drift -> impact report -> adaptation plan, then the
 * modeler decides: only a decision produces a commit, and the runtime is
 * regenerated from the committed model (projection).
 */
import { cloneFederation, type Federation, type FileMap } from "../federation";
import { type Dict } from "../kernel/model";
import { dumpYaml } from "../kernel/yaml";
import { wmodelToDict, type WModel } from "../weaving/model";
import {
  PlanError,
  RuleBasedPlanner,
  applyOption,
  planToDict,
  type AdaptationPlan,
  type AdaptationPlanner,
} from "./adaptation";
import {
  changeSetToDict,
  fromEdit,
  fromObservations,
  fromTimeliness,
  type ChangeSet,
  type ObservationBatch,
  type Violation,
} from "./change";
import { classify } from "./drift";
import { proposeEvolution, type EvolutionProposal } from "./evolution";
import { assess } from "./impact";

export const ACCEPT = "accept";
export const EDIT_DECISION = "edit";
export const REJECT = "reject";

export interface ProcessResult {
  head: Federation;
  candidate: Federation;
  changeset: ChangeSet;
  drift: WModel;
  impact: WModel;
  plan: AdaptationPlan;
}

export interface Decision {
  decision: string; // accept | edit | reject
  option?: string; // the same option id for every drift
  choices?: Record<string, string>; // drift id -> option id
  message?: string;
}

/** The four artifacts of a run, as files, for inspection. */
export function artifactsOf(result: ProcessResult): FileMap {
  return {
    "1-change-set.yaml": dumpYaml(changeSetToDict(result.changeset)),
    "2-classified-drift.wm.yaml": dumpYaml(wmodelToDict(result.drift)),
    "3-impact-report.wm.yaml": dumpYaml(wmodelToDict(result.impact)),
    "4-adaptation-plan.yaml": dumpYaml(planToDict(result.plan)),
  };
}

function run(
  head: Federation,
  candidate: Federation,
  changeset: ChangeSet,
  evolution: EvolutionProposal | null,
  planner?: AdaptationPlanner,
): ProcessResult {
  const drift = classify(head, candidate, changeset, evolution);
  const impact = assess(head, candidate, drift);
  const plan = (planner ?? new RuleBasedPlanner()).plan({ head, candidate, changeset, drift, impact });
  return { head, candidate, changeset, drift, impact, plan };
}

/** Run the process on what a DT reports at runtime. */
export function onObservations(
  head: Federation,
  batch: ObservationBatch,
  base: number | null = null,
  planner?: AdaptationPlanner,
): ProcessResult {
  const changeset = fromObservations(head, batch, base);
  const [candidate, evolution] = proposeEvolution(head, changeset);
  return run(head, candidate, changeset, evolution, planner);
}

/** Run the process on a model edit made by the modeler. */
export function onEdit(
  head: Federation,
  working: Federation,
  base: number | null = null,
  planner?: AdaptationPlanner,
): ProcessResult {
  return run(head, working, fromEdit(head, working, base), null, planner);
}

/** Run the process on timeliness violations observed at runtime. */
export function onTimeliness(
  head: Federation,
  violations: Violation[],
  base: number | null = null,
  planner?: AdaptationPlanner,
): ProcessResult {
  const changeset = fromTimeliness(head, violations, base);
  return run(head, cloneFederation(head), changeset, null, planner);
}

/**
 * The model a modeler decision asks to commit; `null` for a rejection. The
 * modeler of `focus` only decides on the correspondences that model owns: the
 * others are left to the modeler of their own DT.
 */
export function resolveDecision(
  candidate: Federation,
  plan: AdaptationPlan,
  decision: Decision,
  focus?: string,
): Federation | null {
  const kind = decision.decision;
  if (kind === REJECT) return null;
  if (kind !== ACCEPT && kind !== EDIT_DECISION) throw new PlanError(`unknown decision '${kind}'`);
  const choices = decision.choices ?? {};
  let result = candidate;
  for (const resolution of plan.resolutions) {
    if (focus !== undefined && resolution.owner !== focus) continue;
    const chosen = choices[resolution.drift] ?? decision.option;
    if (chosen === undefined || chosen === null) {
      if (kind === EDIT_DECISION) continue; // resolved by the modeler's own edits
      throw new PlanError(`no option chosen for ${resolution.drift}`);
    }
    const found = resolution.options.find((o) => o.id === String(chosen));
    if (!found) throw new PlanError(`${resolution.drift} has no option '${chosen}'`);
    result = applyOption(result, found);
  }
  return result;
}

export function decisionToDict(decision: Decision): Dict {
  const out: Dict = { decision: decision.decision };
  if (decision.option !== undefined) out.option = decision.option;
  if (decision.choices) out.choices = decision.choices;
  if (decision.message) out.message = decision.message;
  return out;
}
