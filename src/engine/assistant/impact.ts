/**
 * Step 3: estimate the impact of the classified drift.
 *
 * Dependencies are followed from the drifted elements to the indicators, goals
 * and rules that use them, and across correspondences to peer DTs. The impact
 * report is a weaving model: every link relates a drifted element to an element
 * it affects, either between peers (same level) or vertically (across levels).
 */
import {
  CORRESPONDENCE,
  dependents,
  dtLabel,
  instances,
  interimOf,
  links,
  typeOf,
  versions,
  type Federation,
} from "../federation";
import { modelKey, targets, type Dict } from "../kernel/model";
import { ownerOf, parseRef, ref } from "../kernel/refs";
import { linksOfType, wlink, wmodel, type WLink, type WModel } from "../weaving/model";
import { boundKeys } from "./change";
import { BOTTOM_UP, HORIZONTAL, VERTICAL } from "./drift";

export const IMPACT = "ImpactLink";
const SEVERITY: Record<string, string> = {
  suspend: "high",
  exclude_input: "medium",
  keep_last_valid: "medium",
};
const EFFECT: Record<string, string> = {
  suspend: "cannot be evaluated",
  exclude_input: "can only be evaluated on a reduced scope",
  keep_last_valid: "is evaluated on the last valid value",
};

class Report {
  links: WLink[] = [];
  private seen = new Set<string>();

  add(source: string, target: string, props: Dict): void {
    const pair = `${source} -> ${target}`;
    if (source === target || this.seen.has(pair)) return;
    this.seen.add(pair);
    const kept = Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== null && v !== undefined),
    );
    this.links.push(wlink(`im-${this.links.length + 1}`, IMPACT, { source, target }, kept));
  }
}

/** Follow the dependency links from an O0 object, inside its DT and across the
 * correspondences where it is the participating element. */
function follow(fed: Federation, start: string, report: Report): void {
  const queue = [start];
  const visited = new Set([start]);
  while (queue.length) {
    const current = parseRef(queue.shift() as string);
    const instance = fed.models[current.model];
    if (!instance || !current.path.length) continue;
    const objRef = ref(current.model, current.path[0]);
    for (const [dependent, reference] of dependents(fed, instance, current.path[0])) {
      const target = ref(instance.name, dependent.name);
      const inputs = targets(dependent, reference);
      const behaviour = interimOf(fed, instance, dependent);
      report.add(objRef, target, {
        direction: "peer",
        scope: "intra-dt",
        category: "dependency",
        severity: SEVERITY[behaviour] ?? "high",
        reason:
          `${target} ${EFFECT[behaviour] ?? EFFECT.suspend}: it uses ` +
          `${objRef} (${reference}, ${inputs.length} in total)`,
        interim: behaviour,
      });
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
    }
    for (const link of links(fed, CORRESPONDENCE)) {
      const participating = link.ends.participating;
      if (!participating || ownerOf(participating) !== objRef) continue;
      const initiating = link.ends.initiating;
      report.add(participating, initiating, {
        direction: "peer",
        scope: "inter-dt",
        category: "correspondence",
        severity: "high",
        via: link.id,
        reason: `${initiating} depends on ${participating}`,
      });
      const owner = ownerOf(initiating);
      if (!visited.has(owner)) {
        visited.add(owner);
        queue.push(owner);
      }
    }
  }
}

export function assess(head: Federation, candidate: Federation, drift: WModel): WModel {
  const report = new Report();
  const participants: string[] = [];

  for (const link of linksOfType(drift, VERTICAL)) {
    const { upper, lower } = link.ends;
    const lowerRef = parseRef(lower);
    if (link.props.origin === BOTTOM_UP) {
      const bound = lowerRef.data ? boundKeys(head, lowerRef.model) : {};
      if (lowerRef.path.length && lowerRef.path[0] in bound) {
        const target = ref(lowerRef.model, ...bound[lowerRef.path[0]]);
        report.add(lower, target, {
          direction: "vertical",
          scope: "intra-dt",
          category: "conformance",
          severity: "high",
          reason: `${target} has no conforming data any more`,
        });
        follow(head, ownerOf(target), report);
      }
    } else {
      report.add(upper, lower, {
        direction: "vertical",
        scope: "intra-dt",
        category: "conformance",
        severity: "high",
        reason: `${lower} does not satisfy ${upper}`,
      });
      if (lowerRef.path.length) follow(candidate, ownerOf(lower), report);
    }
  }

  for (const link of linksOfType(drift, HORIZONTAL)) {
    const initiating = link.ends.initiating;
    const participating = link.ends.participating;
    if (participating) {
      participants.push(parseRef(participating).model);
      report.add(participating, initiating, {
        direction: "peer",
        scope: "inter-dt",
        category: "correspondence",
        severity: "high",
        via: link.props.correspondence,
        reason: `the correspondence is ${link.props.status}: ${initiating} cannot be provided`,
      });
    }
    follow(candidate, ownerOf(initiating), report);
  }

  // Participating DTs left at an older version of their type.
  const leftBehind: string[] = [];
  for (const name of new Set(participants)) {
    const instance = candidate.models[name];
    const o1 = typeOf(candidate, instance);
    if (o1 === null) continue;
    const latest = Math.max(...versions(candidate, o1.name));
    if ((o1.version as number) < latest) {
      const newer = `${o1.name}@${latest}`;
      leftBehind.push(`${name} (${modelKey(o1)}, latest is ${newer})`);
      report.add(newer, name, {
        direction: "vertical",
        scope: "intra-dt",
        category: "left-behind",
        severity: "low",
        reason: `${name} is left at ${modelKey(o1)} while ${newer} exists`,
      });
    }
  }

  const affected = new Set<string>();
  for (const link of report.links) {
    for (const end of Object.values(link.ends)) {
      const model = candidate.models[parseRef(end).model] ?? head.models[parseRef(end).model];
      if (model && model.level === "O0") affected.add(model.name);
    }
  }
  const inUse: Record<string, Set<number>> = {};
  for (const instance of instances(candidate)) {
    const o1 = typeOf(candidate, instance);
    if (o1 !== null) (inUse[o1.name] ??= new Set()).add(o1.version as number);
  }
  const dts = instances(candidate).map((i) => [i.name, dtLabel(candidate, i.name)]);
  return wmodel("impact-report", {
    woven: [...affected].sort(),
    links: report.links,
    props: {
      artifact: "impact-report",
      affectedDTs: dts.filter(([name]) => affected.has(name)).map(([, label]) => label),
      unaffectedDTs: dts.filter(([name]) => !affected.has(name)).map(([, label]) => label),
      coexistingVersions: Object.fromEntries(
        Object.entries(inUse)
          .filter(([, used]) => used.size > 1)
          .map(([pkg, used]) => [pkg, [...used].sort((a, b) => a - b)]),
      ),
      leftBehind,
    },
  });
}
