/**
 * Projection: the committed model, turned into the runtime configuration.
 *
 * The federation is regenerated from the model and never patched by hand: each
 * DT gets the observation keys it must emit, the inputs it takes from its peers
 * (with mapping and timeliness) and the state of its dependent elements.
 */
import {
  CORRESPONDENCE,
  classProps,
  instances,
  interimOf,
  links,
  resolve,
  typeOf,
  type Federation,
} from "../federation";
import { isSensor } from "../devices";
import { targets, type Dict } from "../kernel/model";
import { parseRef, ref } from "../kernel/refs";
import { PENDING } from "../weaving/checks";

const STATE: Record<string, string> = {
  suspend: "suspended",
  exclude_input: "scoped",
  keep_last_valid: "last-valid",
};

export interface Projection {
  artifact: "projection";
  commit: number | null;
  dts: Record<string, Dict>;
}

export function project(fed: Federation, commit: number | null = null): Projection {
  const dts: Record<string, Dict> = {};
  for (const instance of instances(fed)) {
    const o1 = typeOf(fed, instance);
    const emits: Dict[] = [];
    for (const obj of Object.values(instance.objects)) {
      const eclass = o1?.eClasses[obj.instanceOf];
      if (isSensor(fed, instance, obj)) continue; // it provides keys; what uses them is listed
      for (const [attribute, key] of Object.entries(obj.bindings)) {
        const declared = eclass?.eAttributes[attribute];
        if (!declared) continue;
        const entry: Dict = {
          key,
          element: ref(instance.name, obj.name, attribute),
          eType: declared.eType,
        };
        if (declared.unit) entry.unit = declared.unit;
        emits.push(entry);
      }
    }
    dts[instance.name] = {
      dt: instance.dt || instance.name,
      type: instance.typedBy,
      roles: [],
      emits,
      inputs: [],
      dependents: [],
    };
  }

  const pending: Record<string, Set<string>> = {};
  for (const name of Object.keys(dts)) pending[name] = new Set();
  for (const link of links(fed, CORRESPONDENCE)) {
    const initiating = parseRef(link.ends.initiating);
    if (!(initiating.model in dts)) continue;
    const entry: Dict = {
      element: link.ends.initiating,
      correspondence: link.id,
      status: "active",
    };
    if (link.props.status === PENDING) {
      entry.status = PENDING;
      entry.changeRequest = link.props.changeRequest ?? null;
      pending[initiating.model].add(initiating.path[0]);
    } else {
      const participating = parseRef(link.ends.participating ?? "");
      const provider = fed.models[participating.model]?.objects[participating.path[0]];
      const resolved = resolve(fed, participating);
      if (!provider || !resolved?.attribute) continue; // not committable: skipped
      entry.from = participating.model;
      entry.key = provider.bindings[participating.path[1]] ?? null;
      entry.source = { name: participating.path[1], eType: resolved.attribute.eType };
      if (link.props.mapping) entry.mapping = link.props.mapping;
      if (link.props.timeliness) entry.timeliness = { ...link.props.timeliness };
      if (!dts[participating.model].roles.includes("participating")) {
        dts[participating.model].roles.push("participating");
      }
    }
    if (!dts[initiating.model].roles.includes("initiating")) {
      dts[initiating.model].roles.push("initiating");
    }
    dts[initiating.model].inputs.push(entry);
  }

  for (const instance of instances(fed)) {
    const o1 = typeOf(fed, instance);
    const unavailable = pending[instance.name];
    const states: Record<string, Dict> = {};
    let changed = true;
    while (changed) {
      // propagate along the dependency links
      changed = false;
      for (const obj of Object.values(instance.objects)) {
        if (!classProps(fed, o1, obj.instanceOf).dependent) continue;
        const eclass = o1?.eClasses[obj.instanceOf];
        const used = Object.keys(eclass?.eReferences ?? {}).flatMap((r) => targets(obj, r));
        const excluded = used.filter((t) => unavailable.has(t));
        const degraded = used.filter((t) => t in states && states[t].status !== "active");
        const behaviour = interimOf(fed, instance, obj);
        const state: Dict = {
          element: ref(instance.name, obj.name),
          class: obj.instanceOf,
          uses: used.map((t) => ref(instance.name, t)),
          status: "active",
        };
        if (excluded.length || degraded.length) {
          state.status = STATE[behaviour] ?? "suspended";
          state.interim = behaviour;
          if (excluded.length) state.excluded = excluded.map((t) => ref(instance.name, t));
        }
        if (JSON.stringify(states[obj.name]) !== JSON.stringify(state)) {
          states[obj.name] = state;
          changed = true;
        }
      }
    }
    dts[instance.name].dependents = Object.values(states);
  }

  return { artifact: "projection", commit, dts };
}
