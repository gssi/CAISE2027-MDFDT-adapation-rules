/**
 * Step 4: generate and rank the resolution options.
 *
 * Resolution options: **adapt** the dependent element to the new version,
 * **derive** the expected value from the available one (a mapping in the
 * correspondence), **bind** or **migrate** the DTs left behind, or issue a
 * **change request** when nothing in the model can resolve the drift.
 *
 * The planner sits behind `AdaptationPlanner`: the rule-based one below is
 * deterministic, a different one can generate and explain options another way.
 * An option is data (a kind and its parameters); `applyOption` turns it into
 * model changes, so a plan can be stored, inspected and applied later.
 */
import {
  CORRESPONDENCE,
  classProps,
  cloneFederation,
  dependents,
  dtLabel,
  findLink,
  links,
  resolve,
  successor,
  typeOf,
  type Federation,
} from "../federation";
import { modelKey, repr, type Dict, type EAttribute, type EClass, type Model } from "../kernel/model";
import { asNextVersion, instanceOfModel, modelOf, renamedClasses, versionOf, weavingName } from "../modelset";
import { ownerOf, parseRef, ref } from "../kernel/refs";
import { MappingError, findRule, inferType, renameSource } from "../mapping";
import { HOLDS, MISSING, PENDING, checkCorrespondences } from "../weaving/checks";
import { linksOfType, wlink, wmodel, type WLink, type WModel } from "../weaving/model";
import { changeFromDict, changeToDict, diff, type Change, type ChangeSet } from "./change";
import { HORIZONTAL, TOP_DOWN, VERTICAL } from "./drift";
import { EvolutionError, migrateInstance } from "./evolution";
import { IMPACT } from "./impact";

export const DERIVE = "derive";
export const ADAPT = "adapt";
export const CHANGE_REQUEST = "change_request";

export class PlanError extends Error {}

export interface Option {
  id: string;
  kind: string;
  rank: number;
  description: string;
  automatic: boolean;
  params: Dict;
  changes: Change[];
}

export interface Resolution {
  drift: string;
  /** The model that owns the correspondence: only its modeler decides. */
  owner: string;
  element: string;
  correspondence: string | null;
  options: Option[];
}

export interface InterimEntry {
  element: string;
  behaviour: string;
  because: string;
  until: string;
}

/** Model changes that resolve a drift, plus the behaviour of the affected
 * elements until the plan is applied. */
export interface AdaptationPlan {
  trigger: string;
  base: number | null;
  baseChanges: Change[];
  resolutions: Resolution[];
  interim: InterimEntry[];
}

export function planToDict(plan: AdaptationPlan): Dict {
  return {
    artifact: "adaptation-plan",
    trigger: plan.trigger,
    base: plan.base,
    baseChanges: plan.baseChanges.map(changeToDict),
    resolutions: plan.resolutions.map((r) => ({
      drift: r.drift,
      owner: r.owner,
      correspondence: r.correspondence,
      element: r.element,
      options: r.options.map((o) => ({
        id: o.id,
        kind: o.kind,
        rank: o.rank,
        automatic: o.automatic,
        description: o.description,
        params: o.params,
        changes: o.changes.map(changeToDict),
      })),
    })),
    interim: plan.interim,
  };
}

export function planFromDict(data: Dict): AdaptationPlan {
  return {
    trigger: data.trigger,
    base: data.base ?? null,
    baseChanges: ((data.baseChanges ?? []) as Dict[]).map(changeFromDict),
    resolutions: ((data.resolutions ?? []) as Dict[]).map((r) => ({
      drift: r.drift,
      owner: r.owner ?? modelOf(r.element),
      element: r.element,
      correspondence: r.correspondence ?? null,
      options: ((r.options ?? []) as Dict[]).map((o) => ({
        id: o.id,
        kind: o.kind,
        rank: o.rank,
        description: o.description,
        automatic: o.automatic ?? true,
        params: o.params ?? {},
        changes: ((o.changes ?? []) as Dict[]).map(changeFromDict),
      })),
    })),
    interim: data.interim ?? [],
  };
}

export interface PlanningContext {
  head: Federation;
  candidate: Federation;
  changeset: ChangeSet;
  drift: WModel;
  impact: WModel;
}

export interface AdaptationPlanner {
  /** Propose a ranked adaptation plan. Never commits anything. */
  plan(context: PlanningContext): AdaptationPlan;
}

function option(kind: string, description: string, params: Dict, automatic = true): Option {
  return { id: "", kind, rank: 0, description, automatic, params, changes: [] };
}

// -- applying an option ------------------------------------------------------

function expectation(fed: Federation, element: string): Dict {
  const resolved = resolve(fed, element);
  if (!resolved?.attribute) throw new PlanError(`unknown element ${element}`);
  const expects: Dict = { typeVersion: resolved.model.typedBy, eType: resolved.attribute.eType };
  if (resolved.attribute.unit !== null) expects.unit = resolved.attribute.unit;
  if (resolved.attribute.meaning !== null) expects.meaning = resolved.attribute.meaning;
  return expects;
}

/** The element that replaces a participating element after its DT evolved. */
function successorElement(head: Federation, fed: Federation, participating: string): string | null {
  const before = resolve(head, participating);
  if (!before?.eclass) return null;
  const oldType = typeOf(head, before.model);
  const next = oldType ? successor(fed, ref(modelKey(oldType), before.eclass.name)) : null;
  const instance = fed.models[before.model.name];
  if (next === null || !instance) return null;
  const nextRef = parseRef(next);
  if (nextRef.model !== instance.typedBy) return null;
  const objects = Object.values(instance.objects).filter((o) => o.instanceOf === nextRef.path[0]);
  const attributes = fed.models[nextRef.model].eClasses[nextRef.path[0]].eAttributes;
  const names = Object.keys(attributes);
  if (objects.length !== 1 || !names.length) return null;
  const wanted = before.ref.path[1];
  const attribute = wanted in attributes ? wanted : names.length === 1 ? names[0] : null;
  return attribute ? ref(instance.name, objects[0].name, attribute) : null;
}

/** The admitted mapping from `provided` to `initiating`, if any; an empty
 * string when the two elements agree without a mapping. */
function derivation(fed: Federation, provided: string, initiating: string): string | null {
  const source = resolve(fed, provided)?.attribute;
  const target = resolve(fed, initiating)?.attribute;
  if (!source || !target) return null;
  if (source.meaning === target.meaning) {
    return source.eType === target.eType && source.unit === target.unit ? "" : null;
  }
  const rule = findRule(fed.derivations, source.meaning, target.meaning);
  if (rule === null) return null;
  try {
    if (inferType(rule.expression, "value", source.eType) !== target.eType) return null;
  } catch (error) {
    if (error instanceof MappingError) return null;
    throw error;
  }
  return renameSource(rule.expression, "value", source.name);
}

function retarget(fed: Federation, correspondence: string, participating: string, mapping: string) {
  const link = findLink(fed, correspondence);
  if (link === null) throw new PlanError(`unknown correspondence ${correspondence}`);
  link.ends.participating = participating;
  const expects: Dict = { ...(link.props.expects ?? {}) };
  for (const stale of ["typeVersion", "eType", "unit", "meaning"]) delete expects[stale];
  link.props.expects = { ...expectation(fed, participating), ...expects };
  if (mapping) link.props.mapping = mapping;
  else delete link.props.mapping;
  for (const key of ["status", "changeRequest", "interim"]) delete link.props[key];
}

/** The model that results from applying `chosen` to `candidate`. */
export function applyOption(candidate: Federation, chosen: Option): Federation {
  if (!chosen.automatic) {
    throw new PlanError(
      `option ${chosen.id} (${chosen.kind}) needs the modeler: decide with 'edit' and ` +
        "provide the edited model",
    );
  }
  const fed = cloneFederation(candidate);
  const params = chosen.params;
  if (chosen.kind === ADAPT && params.instanceOf) {
    // a class follows its concept under the name the concept has now
    const target = parseRef(params.element);
    const eclass = fed.models[target.model]?.eClasses[target.path[0]];
    if (!eclass) throw new PlanError(`${params.element} is not a class`);
    eclass.instanceOf = params.instanceOf;
  } else if (chosen.kind === DERIVE || chosen.kind === ADAPT) {
    retarget(fed, params.correspondence, params.participating, params.mapping ?? "");
  } else if (chosen.kind === CHANGE_REQUEST) {
    let link = params.correspondence ? findLink(fed, params.correspondence) : null;
    if (link === null) {
      const name = weavingName(modelOf(params.element));
      const wm = (fed.weaving[name] ??= wmodel(name));
      const owner = parseRef(params.element);
      link = wlink(`cr-${[owner.model, ...owner.path].join("-")}`, CORRESPONDENCE, {
        initiating: params.element,
      });
      wm.links.push(link);
    }
    link.props.status = PENDING;
    link.props.changeRequest = params.request;
    if (params.interim?.length) link.props.interim = (params.interim as Dict[]).map((i) => ({ ...i }));
  } else {
    throw new PlanError(`unknown option kind ${repr(chosen.kind)}`);
  }
  return fed;
}

/** The capability of `model` that can back `need`: same type and unit, and the
 * same meaning whenever both declare one. */
export function providingKey(fed: Federation, model: string, need: EAttribute): string | null {
  for (const [key, capability] of Object.entries(fed.capabilities[model] ?? {})) {
    const meaning = capability.meaning ?? null;
    if ((capability.eType ?? null) !== need.eType || (capability.unit ?? null) !== need.unit) continue;
    if (meaning === null || need.meaning === null || meaning === need.meaning) return key;
  }
  return null;
}

/** A change request waiting on `model`, raised by the modeler of another DT. */
export interface IncomingRequest {
  correspondence: string;
  from: string; // the model that asks
  element: string; // what it needs
  request: string;
  /** The next version of `model` that would satisfy it, when its DT already provides the data. */
  proposal: Federation | null;
}

/**
 * The change requests other DTs have open on `model`. When the DT already
 * reports data that fits, the modelling assistant proposes the next version of
 * the model: the class that models that data in a DT which already has it is
 * copied, with what it needs, and instantiated on the reported key.
 */
export function incomingRequests(fed: Federation, model: string): IncomingRequest[] {
  const out: IncomingRequest[] = [];
  for (const link of links(fed, CORRESPONDENCE)) {
    const participating = link.ends.participating;
    if (link.props.status !== PENDING || !participating || modelOf(participating) !== model) continue;
    if (parseRef(participating).path.length) continue; // a request about an element that exists is not ours to model
    const need = resolve(fed, link.ends.initiating)?.attribute ?? null;
    out.push({
      correspondence: link.id,
      from: modelOf(link.ends.initiating),
      element: link.ends.initiating,
      request: link.props.changeRequest ?? "",
      proposal: need ? proposeForRequest(fed, model, need) : null,
    });
  }
  return out;
}

function proposeForRequest(fed: Federation, model: string, need: EAttribute): Federation | null {
  const instance = instanceOfModel(fed, model);
  const type = typeOf(fed, instance);
  const version = versionOf(fed, model);
  if (!instance || !type || version === null || providingKey(fed, model, need) === null) return null;
  const fits = (a: EAttribute) =>
    a.eType === need.eType && a.unit === need.unit && (a.meaning === null || need.meaning === null || a.meaning === need.meaning);
  if (Object.values(type.eClasses).some((c) => Object.values(c.eAttributes).some(fits))) return null;
  // A class of another DT that models this data, with the classes it requires.
  let template: [Model, EClass] | null = null;
  for (const other of Object.values(fed.models)) {
    if (other.level !== "O1" || other.name === model) continue;
    const peer = instanceOfModel(fed, other.name);
    if (peer?.typedBy !== modelKey(other)) continue; // only current versions
    for (const eclass of Object.values(other.eClasses)) {
      if (!classProps(fed, other, eclass.name).requiresSource) continue;
      if (Object.values(eclass.eAttributes).some(fits)) template ??= [other, eclass];
    }
  }
  if (!template) return null;
  const candidate = cloneFederation(fed);
  const target = candidate.models[modelKey(type)];
  const copy = (source: Model, name: string) => {
    if (name in target.eClasses) return;
    const eclass = source.eClasses[name];
    target.eClasses[name] = structuredClone(eclass);
    for (const reference of Object.values(eclass.eReferences)) copy(source, reference.eType);
  };
  copy(template[0], template[1].name);
  const next = asNextVersion(candidate, fed, model, version + 1);
  try {
    migrateInstance(next, model, `${model}@${version + 1}`);
  } catch (error) {
    if (error instanceof EvolutionError) return null;
    throw error;
  }
  return next;
}

// -- rule-based planner ------------------------------------------------------

const settled = (status: string | undefined) => status === HOLDS || status === PENDING;

/** Deterministic planner. Options are ranked from the least to the most
 * invasive, and only kept when applying them makes the correspondence hold. */
export class RuleBasedPlanner implements AdaptationPlanner {
  plan(context: PlanningContext): AdaptationPlan {
    const plan: AdaptationPlan = {
      trigger: context.changeset.trigger,
      base: context.changeset.base,
      baseChanges: diff(context.head, context.candidate),
      resolutions: [],
      interim: this.interim(context),
    };
    for (const link of linksOfType(context.drift, HORIZONTAL)) {
      const resolution: Resolution = {
        drift: link.id,
        owner: modelOf(link.ends.initiating),
        element: link.ends.initiating,
        correspondence: link.props.correspondence ?? null,
        options: [],
      };
      const proposals =
        link.props.status === MISSING ? this.provide(context, link) : this.deriveBroken(context, link);
      const kept = proposals.filter((p) => this.verify(context, resolution, p));
      if (!kept.some((p) => p.automatic)) {
        const request = this.changeRequest(context, link);
        if (this.verify(context, resolution, request)) kept.push(request);
      }
      this.rank(kept);
      resolution.options = kept;
      plan.resolutions.push(resolution);
    }
    plan.resolutions.push(...this.followConcepts(context));
    // A change request that is waiting can be closed as soon as the
    // participating DT models what was asked for.
    for (const link of links(context.candidate, CORRESPONDENCE)) {
      if (link.props.status !== PENDING || !link.ends.participating) continue;
      const resolution: Resolution = {
        drift: `pending:${link.id}`,
        owner: modelOf(link.ends.initiating),
        element: link.ends.initiating,
        correspondence: link.id,
        options: [],
      };
      const asked = wlink(link.id, HORIZONTAL, { ...link.ends }, { correspondence: link.id, status: MISSING });
      asked.ends.participating = modelOf(link.ends.participating);
      const kept = this.provide(context, asked).filter((p) => this.verify(context, resolution, p));
      if (!kept.length) continue;
      this.rank(kept);
      resolution.options = kept;
      plan.resolutions.push(resolution);
    }
    return plan;
  }

  /**
   * A class of a DT type whose concept is no longer among the shared concepts.
   * It belongs to the model of that DT: its modeler gives it a concept again.
   * A concept that was renamed is followed under its new name.
   */
  private followConcepts(context: PlanningContext): Resolution[] {
    const out: Resolution[] = [];
    for (const link of linksOfType(context.drift, VERTICAL)) {
      const lower = parseRef(link.ends.lower);
      const type = context.candidate.models[lower.model];
      if (link.props.origin !== TOP_DOWN || type?.level !== "O1" || !lower.path.length) continue;
      const now = context.candidate.models[type.typedBy ?? ""];
      const was = context.head.models[type.typedBy ?? ""];
      const concept = type.eClasses[lower.path[0]]?.instanceOf ?? "";
      const gone = lower.path.length === 1 && !(concept in (now?.eClasses ?? {}));
      const renamed = gone && now && was ? renamedClasses(was, now).find(([from]) => from === concept)?.[1] : undefined;
      const proposal = renamed
        ? option(ADAPT, `retype ${link.ends.lower} to ${renamed}: the concept ${concept} is now ${renamed}`, {
            element: link.ends.lower,
            instanceOf: renamed,
          })
        : gone
          ? option(
              ADAPT,
              `give ${link.ends.lower} one of the shared concepts: ${concept || "its concept"} is no longer among them`,
              { element: link.ends.lower },
              false,
            )
          : option(
              ADAPT,
              `revise ${link.ends.lower} to follow the relations between the shared concepts: ${(link.props.reasons ?? []).join("; ")}`,
              { element: link.ends.lower },
              false,
            );
      this.rank([proposal]);
      out.push({
        drift: link.id,
        owner: modelOf(link.ends.lower),
        element: link.ends.lower,
        correspondence: null,
        options: [proposal],
      });
    }
    return out;
  }

  private rank(options: Option[]): void {
    options.forEach((o, index) => {
      o.id = "abcdefghijklmnopqrstuvwxyz"[index];
      o.rank = index + 1;
    });
  }

  // Every proposal is checked by applying it: an option enters the plan only
  // if its correspondence then holds (or is pending) and no other one breaks.
  private verify(context: PlanningContext, resolution: Resolution, proposal: Option): boolean {
    if (!proposal.automatic) return true;
    let result: Federation;
    try {
      result = applyOption(context.candidate, proposal);
    } catch (error) {
      if (error instanceof PlanError) return false;
      throw error;
    }
    const before = new Map(
      checkCorrespondences(context.candidate).map((s) => [s.correspondence, s.status]),
    );
    for (const status of checkCorrespondences(result)) {
      const mine = resolution.correspondence
        ? status.correspondence === resolution.correspondence
        : status.initiating === resolution.element;
      if (settled(status.status)) continue;
      if (mine || settled(before.get(status.correspondence))) return false;
    }
    proposal.changes = diff(context.candidate, result);
    return true;
  }

  private interim(context: PlanningContext): InterimEntry[] {
    const interim: InterimEntry[] = [];
    for (const link of linksOfType(context.impact, IMPACT)) {
      if (link.props.category !== "dependency") continue;
      const entry: InterimEntry = {
        element: link.ends.target,
        behaviour: link.props.interim,
        because: link.ends.source,
        until: "the plan is committed",
      };
      if (!interim.some((e) => JSON.stringify(e) === JSON.stringify(entry))) interim.push(entry);
    }
    return interim;
  }

  private deriveBroken(context: PlanningContext, link: WLink): Option[] {
    const participating = link.ends.participating;
    const initiating = link.ends.initiating;
    const correspondence: string | null = link.props.correspondence ?? null;
    if (!participating || correspondence === null) return [];
    const next = successorElement(context.head, context.candidate, participating);
    if (next === null) return [];
    const options: Option[] = [];
    const provided = resolve(context.candidate, next)?.attribute;
    const mapping = derivation(context.candidate, next, initiating);
    const params = { correspondence, participating: next };
    if (mapping === "") {
      options.push(option(ADAPT, `retarget ${correspondence} to ${next}`, params));
    } else if (mapping) {
      const wanted = parseRef(initiating).path.at(-1);
      options.push(
        option(
          DERIVE,
          `derive ${wanted} = ${mapping} from ${next}, as a mapping in ${correspondence}`,
          { ...params, mapping },
        ),
      );
    }
    const owner = parseRef(ownerOf(initiating));
    const revise = dependents(
      context.candidate,
      context.candidate.models[owner.model],
      owner.path[0],
    ).map(([obj]) => ref(owner.model, obj.name));
    const described = [provided?.eType, provided?.unit].filter(Boolean).join(", ");
    options.push(
      option(
        ADAPT,
        `adapt ${dtLabel(context.candidate, owner.model)} to consume ${next} ` +
          `(${described}) in place of ${initiating}: a new type version, and ` +
          `${revise.join(", ") || "its dependents"} revised by the modeler`,
        { ...params, revise },
        false,
      ),
    );
    return options;
  }

  /** Elements the participating DT already models that can provide what is missing. */
  private provide(context: PlanningContext, link: WLink): Option[] {
    const fed = context.candidate;
    const participating = link.ends.participating;
    const correspondence: string | null = link.props.correspondence ?? null;
    if (!participating || correspondence === null) return [];
    const instance = fed.models[parseRef(participating).model];
    const o1 = typeOf(fed, instance);
    if (!instance || o1 === null) return [];
    const options: Option[] = [];
    for (const obj of Object.values(instance.objects)) {
      for (const attribute of Object.keys(o1.eClasses[obj.instanceOf]?.eAttributes ?? {})) {
        const provided = ref(instance.name, obj.name, attribute);
        const mapping = derivation(fed, provided, link.ends.initiating);
        if (mapping === null) continue;
        options.push(
          option(
            mapping ? DERIVE : ADAPT,
            `provide ${link.ends.initiating} ${mapping ? `= ${mapping} ` : ""}from ${provided}`,
            { correspondence, participating: provided, mapping },
          ),
        );
      }
    }
    return options;
  }

  private changeRequest(context: PlanningContext, link: WLink): Option {
    const initiating = link.ends.initiating;
    const participating = link.ends.participating;
    const need = resolve(context.candidate, initiating)?.attribute;
    const described = (need ? [need.meaning, need.eType, need.unit] : []).filter(Boolean).join(", ");
    let request: string;
    if (link.props.status === MISSING) {
      const where = participating ? modelOf(participating) : "a participating DT";
      const key = need && participating ? providingKey(context.candidate, where, need) : null;
      request = key
        ? `model the observation key ${repr(key)} that ${where} already provides, for ${initiating} (${described})`
        : `new data source in ${where} providing ${initiating} (${described})`;
    } else {
      request =
        `restore ${participating} as expected by ${initiating}: ` +
        ((link.props.reasons ?? []) as string[]).join("; ");
    }
    const owner = ownerOf(initiating);
    const interim = this.interim(context)
      .filter((i) => this.reaches(context, owner, i.element))
      .map((i) => ({ element: i.element, behaviour: i.behaviour }));
    return option(
      CHANGE_REQUEST,
      `change request: ${request}; affected elements keep their interim behaviour in the meantime`,
      {
        correspondence: link.props.correspondence ?? null,
        element: initiating,
        request,
        interim,
      },
    );
  }

  private reaches(context: PlanningContext, start: string, target: string): boolean {
    const edges = new Map<string, string[]>();
    for (const link of linksOfType(context.impact, IMPACT)) {
      edges.set(link.ends.source, [...(edges.get(link.ends.source) ?? []), link.ends.target]);
    }
    const queue = [start];
    const seen = new Set([start]);
    while (queue.length) {
      for (const following of edges.get(queue.shift() as string) ?? []) {
        if (following === target) return true;
        if (!seen.has(following)) {
          seen.add(following);
          queue.push(following);
        }
      }
    }
    return false;
  }
}
