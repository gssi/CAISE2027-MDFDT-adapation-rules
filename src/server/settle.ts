/**
 * The model-first loop on the server, for the model a modeler has open: run
 * the process on the trigger against the current versions, apply the decision,
 * commit that model as its next version. Only this commits.
 */
import { PlanError } from "@/engine/assistant/adaptation";
import { artifactsOf, decisionToDict, resolveDecision, type Decision } from "@/engine/assistant/process";
import { runTrigger, type Trigger } from "@/engine/assistant/session";
import { dumpYaml } from "@/engine/kernel/yaml";

import { type Repository } from "./repository";

const MESSAGE: Record<Trigger["kind"], string> = {
  edit: "model edit",
  observations: "evolution after a runtime observation",
  timeliness: "change request after a timeliness violation",
  incoming: "adaptation to the models it weaves",
  request: "change requested by another DT",
};

export function settle(repo: Repository, focus: string, trigger: Trigger, decision: Decision): number | null {
  if (trigger.kind === "observations" && trigger.batch.source !== focus) {
    throw new PlanError(`the observations come from ${trigger.batch.source}, not from ${focus}`);
  }
  const result = runTrigger(repo.versions(), focus, trigger);
  if (!result) throw new PlanError("there is nothing to decide");
  const model = resolveDecision(result.candidate, result.plan, decision, focus);
  if (model === null) return null;
  const version = repo.commit(focus, model, decision.message || MESSAGE[trigger.kind], {
    ...artifactsOf(result),
    "5-decision.yaml": dumpYaml(decisionToDict(decision)),
  });
  repo.writeProjection();
  return version;
}
