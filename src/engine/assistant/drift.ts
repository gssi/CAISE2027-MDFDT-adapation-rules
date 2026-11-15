/**
 * Step 2: detect and classify the drift.
 *
 * Vertical drift is an inconsistency across levels of the same DT: bottom-up
 * when it originates in data, top-down when it originates in a type or concept.
 * Horizontal drift is a correspondence between DTs that no longer holds:
 * broken, missing or ambiguous.
 *
 * The classified drift is a weaving model: every drift is a link between the
 * elements that are no longer consistent.
 */
import { checkConformance } from "../conformance";
import { dtLabel, instances, typeOf, versions, type Federation } from "../federation";
import { DATA_LEVEL, modelKey, repr, type Dict } from "../kernel/model";
import { parseRef, ref } from "../kernel/refs";
import { BROKEN, HOLDS, PENDING, checkCorrespondences } from "../weaving/checks";
import { wlink, wmodel, type WLink, type WModel } from "../weaving/model";
import { EDIT, RUNTIME, TIMELINESS, boundKeys, type ChangeSet } from "./change";
import { proposalToDict, type EvolutionProposal } from "./evolution";

export const VERTICAL = "VerticalDrift";
export const HORIZONTAL = "HorizontalDrift";
export const BOTTOM_UP = "bottom-up";
export const TOP_DOWN = "top-down";

/** Data of a DT that no longer conforms to its type. */
function bottomUp(head: Federation, changeset: ChangeSet, evolved: boolean): WLink[] {
  const source = changeset.origin as string;
  const instance = head.models[source];
  const o1 = typeOf(head, instance);
  if (!instance || o1 === null) return [];
  const bound = boundKeys(head, source);
  const dt = dtLabel(head, source);
  const out: WLink[] = [];
  for (const change of changeset.changes) {
    if (change.level !== DATA_LEVEL) continue;
    const key = parseRef(change.element).path[0];
    let upper: string;
    let reason: string;
    if (key in bound && (change.kind === "removed" || change.kind === "modified")) {
      const [objName, attribute] = bound[key];
      upper = ref(modelKey(o1), instance.objects[objName].instanceOf, attribute);
      const what = change.kind === "removed" ? "is no longer provided" : "changed its type";
      reason = `the observation key ${repr(key)} bound to ${upper} ${what}`;
    } else if (evolved && change.kind === "added") {
      upper = modelKey(o1);
      const reported = (change.after ?? {}) as Dict;
      const described = [reported.eType, reported.unit].filter(Boolean).join(", ");
      reason =
        `no element of ${modelKey(o1)} accounts for the new observation key ${repr(key)}` +
        (described ? ` (${described})` : "");
    } else {
      continue; // a capability the model does not use is not a drift
    }
    out.push(
      wlink("", VERTICAL, { upper, lower: change.element }, { origin: BOTTOM_UP, dt, reasons: [reason] }),
    );
  }
  return out;
}

/**
 * Instances and data of a DT that do not follow its evolved type yet: the
 * instance still conforms to an earlier version, holds something the type no
 * longer admits, or lacks something the type requires.
 */
function topDown(candidate: Federation, changeset: ChangeSet, unprovided: string[]): WLink[] {
  const origin = candidate.models[changeset.origin ?? ""];
  const conformance = checkConformance(candidate);
  const out: WLink[] = [];
  for (const instance of instances(candidate)) {
    const o1 = typeOf(candidate, instance);
    if (o1 === null || (origin && origin.level === "O1" && o1.name !== origin.name)) continue;
    const dt = dtLabel(candidate, instance.name);
    const latest = Math.max(...versions(candidate, o1.name));
    if ((o1.version as number) < latest) {
      const newer = `${o1.name}@${latest}`;
      out.push(
        wlink("", VERTICAL, { upper: newer, lower: instance.name }, {
          origin: TOP_DOWN,
          dt,
          reasons: [`${instance.name} still conforms to ${modelKey(o1)}, not to ${newer}`],
        }),
      );
    }
    // what the instance holds, checked against the type as it is now
    for (const issue of conformance) {
      const parsed = parseRef(issue.element);
      if (!issue.check.startsWith("O0->") || parsed.model !== instance.name || parsed.data) continue;
      const obj = instance.objects[parsed.path[0]];
      const upper = obj ? ref(modelKey(o1), obj.instanceOf, ...parsed.path.slice(1)) : modelKey(o1);
      out.push(
        wlink("", VERTICAL, { upper, lower: issue.element }, {
          origin: TOP_DOWN,
          dt,
          reasons: [issue.message],
        }),
      );
    }
    for (const element of unprovided) {
      const parsed = parseRef(element);
      if (parsed.model !== instance.name) continue;
      const obj = instance.objects[parsed.path[0]];
      if (!obj) continue;
      const upper = ref(modelKey(o1), obj.instanceOf, parsed.path[1]);
      out.push(
        wlink("", VERTICAL, { upper, lower: element }, {
          origin: TOP_DOWN,
          dt,
          reasons: [`${upper} is required by the type, but no data provides it`],
        }),
      );
    }
  }
  return out;
}

/** Classified drift of `candidate` (the model as the change requires it). */
export function classify(
  head: Federation,
  candidate: Federation,
  changeset: ChangeSet,
  evolution: EvolutionProposal | null = null,
): WModel {
  const statuses = checkCorrespondences(candidate);
  let drifted = statuses.filter((s) => s.status !== HOLDS && s.status !== PENDING);

  let vertical: WLink[] = [];
  const horizontal: WLink[] = [];
  if (changeset.trigger === RUNTIME && changeset.changes.length) {
    vertical = bottomUp(head, changeset, evolution !== null);
  } else if (changeset.trigger === EDIT && ["O1", "O2"].includes(changeset.originLevel ?? "")) {
    vertical = topDown(candidate, changeset, drifted.map((s) => s.initiating));
  } else if (changeset.trigger === TIMELINESS) {
    drifted = [];
    for (const change of changeset.changes) {
      const violation = change.after as Dict;
      horizontal.push(
        wlink(
          "",
          HORIZONTAL,
          { initiating: violation.element, participating: violation.participating },
          {
            status: BROKEN,
            correspondence: violation.correspondence,
            reasons: [violation.reason],
          },
        ),
      );
    }
  }

  for (const status of drifted) {
    const ends: Record<string, string> = { initiating: status.initiating };
    if (status.participating) ends.participating = status.participating;
    horizontal.push(
      wlink("", HORIZONTAL, ends, {
        status: status.status,
        correspondence: status.correspondence,
        reasons: [...status.reasons],
      }),
    );
  }

  vertical.forEach((link, index) => (link.id = `vd-${index + 1}`));
  horizontal.forEach((link, index) => (link.id = `hd-${index + 1}`));
  const driftedIds = new Set(horizontal.map((link) => link.props.correspondence));
  const props: Dict = {
    artifact: "classified-drift",
    trigger: changeset.trigger,
    holding: statuses
      .filter((s) => s.status === HOLDS && !driftedIds.has(s.correspondence))
      .map((s) => s.correspondence),
  };
  if (evolution !== null) props.proposedEvolution = proposalToDict(evolution);
  const all = [...vertical, ...horizontal];
  const woven = [...new Set(all.flatMap((l) => Object.values(l.ends).map((e) => parseRef(e).model)))];
  return wmodel("classified-drift", { woven: woven.sort(), links: all, props });
}

export function hasDrift(drift: WModel): boolean {
  return drift.links.length > 0;
}
