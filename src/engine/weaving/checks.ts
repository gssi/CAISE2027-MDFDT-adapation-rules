/**
 * Checks on weaving models.
 *
 * `validateWeaving` checks the links against the weaving metamodel, including
 * the direction of each relation (peer or vertical).
 * `checkCorrespondences` is the correspondence check of the model repository:
 * the static properties (type, unit, meaning) of every correspondence, against
 * the participating element as it is now.
 */
import { checkConformance, type Issue } from "../conformance";
import {
  CORRESPONDENCE,
  REPRESENTATION,
  classProps,
  instances,
  levelOf,
  links,
  resolve,
  typeOf,
  type Federation,
} from "../federation";
import { PRIMITIVES, repr, str, valueConforms, type Dict } from "../kernel/model";
import { parseRef, ref } from "../kernel/refs";
import { MappingError, findRule, inferType, sameExpression } from "../mapping";
import { LINK_END, linkClass, weavingMetamodel, type WLink, type WModel } from "./model";

export const HOLDS = "holds";
export const BROKEN = "broken";
export const MISSING = "missing";
export const AMBIGUOUS = "ambiguous";
export const PENDING = "pending";

// -- conformance of links to the weaving metamodel ---------------------------

function checkValue(value: unknown, etype: string, many: boolean): boolean {
  if (many) return Array.isArray(value) && value.every((v) => valueConforms(v, etype));
  return valueConforms(value, etype);
}

function checkContained(where: string, className: string, data: unknown, issues: Issue[]): void {
  const eclass = weavingMetamodel().eClasses[className];
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    issues.push({ check: "weaving", element: where, message: `expected a ${className}` });
    return;
  }
  for (const [key, value] of Object.entries(data as Dict)) {
    const attribute = eclass.eAttributes[key];
    if (!attribute) {
      issues.push({
        check: "weaving",
        element: where,
        message: `${className} has no attribute ${repr(key)}`,
      });
    } else if (
      value !== null &&
      value !== undefined &&
      !checkValue(value, attribute.eType, attribute.upperBound !== 1)
    ) {
      issues.push({
        check: "weaving",
        element: where,
        message: `${key}=${repr(value)} does not conform to ${attribute.eType}`,
      });
    }
  }
}

function linkDirection(fed: Federation, link: WLink): string | null {
  const levels = new Set(Object.values(link.ends).map((end) => levelOf(fed, parseRef(end))));
  if (levels.has(null) || levels.size === 0) return null;
  return levels.size === 1 ? "peer" : "vertical";
}

export function validateWModel(fed: Federation, model: WModel): Issue[] {
  const issues: Issue[] = [];
  const add = (element: string, message: string) => issues.push({ check: "weaving", element, message });
  const seen = new Set<string>();
  for (const link of model.links) {
    const where = `${model.name}#${link.id}`;
    if (seen.has(link.id)) add(where, "duplicate link id");
    seen.add(link.id);
    const eclass = linkClass(link.type);
    if (eclass === null) {
      add(where, `unknown link type ${repr(link.type)}`);
      continue;
    }
    for (const [name, reference] of Object.entries(eclass.eReferences)) {
      if (reference.eType === LINK_END) {
        if (reference.lowerBound >= 1 && !(name in link.ends)) add(where, `end ${repr(name)} is required`);
        continue;
      }
      const value = link.props[name];
      if (value === null || value === undefined) continue;
      const items = reference.upperBound !== 1 ? value : [value];
      if (!Array.isArray(items)) {
        add(where, `${repr(name)} must be a list`);
        continue;
      }
      for (const item of items) checkContained(`${where}.${name}`, reference.eType, item, issues);
    }
    for (const [key, value] of Object.entries(link.props)) {
      if (key in eclass.eReferences || value === null || value === undefined) continue;
      const attribute = eclass.eAttributes[key];
      if (!attribute) {
        add(where, `${link.type} has no feature ${repr(key)}`);
      } else if (!checkValue(value, attribute.eType, attribute.upperBound !== 1)) {
        add(where, `${key}=${repr(value)} does not conform to ${attribute.eType}`);
      }
    }
    for (const end of Object.values(link.ends)) {
      if (levelOf(fed, parseRef(end)) === null) add(where, `end ${repr(end)} refers to an unknown model`);
    }
    if (link.type === REPRESENTATION && link.ends.entity && link.ends.dt) {
      const entity = parseRef(link.ends.entity);
      const dt = parseRef(link.ends.dt);
      const owner = fed.models[entity.model];
      if (owner && (owner.level !== "O0" || entity.path.length !== 1 || !(entity.path[0] in owner.objects))) {
        add(where, `${repr(link.ends.entity)} is not an object of a DT model`);
      }
      if (fed.models[dt.model] && (dt.path.length || dt.data || fed.models[dt.model].level !== "O0")) {
        add(where, `${repr(link.ends.dt)} is not a DT model`);
      }
      if (dt.model === entity.model) add(where, "a DT does not represent an entity of its own model");
      const key = `entity:${link.ends.entity}`;
      if (seen.has(key)) add(where, `${link.ends.entity} is already represented by a DT`);
      seen.add(key);
    }
    const declared: string = eclass.properties.direction ?? "any";
    const expected: string | undefined = declared === "any" ? link.props.direction : declared;
    const actual = linkDirection(fed, link);
    if (actual !== null && expected && actual !== expected) {
      add(where, `a ${expected} relation cannot have ${actual} ends`);
    }
  }
  return issues;
}

export function validateWeaving(fed: Federation): Issue[] {
  return Object.values(fed.weaving).flatMap((model) => validateWModel(fed, model));
}

// -- correspondence check ----------------------------------------------------

export interface CorrespondenceStatus {
  status: string;
  initiating: string;
  correspondence: string | null;
  participating: string | null;
  reasons: string[];
}

function checkLink(fed: Federation, link: WLink): CorrespondenceStatus {
  const initiatingRef = link.ends.initiating ?? "";
  const participatingRef = link.ends.participating ?? null;
  const result: CorrespondenceStatus = {
    status: HOLDS,
    initiating: initiatingRef,
    correspondence: link.id,
    participating: participatingRef,
    reasons: [],
  };

  const initiating = resolve(fed, initiatingRef);
  if (initiating === null || initiating.attribute === null || initiating.obj === null) {
    result.status = BROKEN;
    result.reasons.push(`the initiating element ${initiatingRef} does not exist`);
    return result;
  }
  if (link.props.status === PENDING) {
    result.status = PENDING;
    if (!link.props.changeRequest) {
      result.status = BROKEN;
      result.reasons.push("a pending correspondence must carry a change request");
    }
    return result;
  }

  if (participatingRef === null || !parseRef(participatingRef).path.length) {
    result.status = MISSING;
    const where = participatingRef || "any participating DT";
    result.reasons.push(`no element of ${where} corresponds to ${initiatingRef}`);
    return result;
  }
  const participating = resolve(fed, participatingRef);
  const expects: Dict = link.props.expects ?? {};
  const participant = fed.models[parseRef(participatingRef).model];
  if (participating !== null && participating.model.name === initiating.model.name) {
    result.reasons.push("a correspondence relates two different DTs");
  }
  // The version the correspondence was verified against. A newer version of the
  // participant is not drift in itself: it is said only next to what is wrong.
  const moved =
    participant &&
    expects.typeVersion !== undefined &&
    expects.typeVersion !== null &&
    expects.typeVersion !== participant.typedBy
      ? `expects ${expects.typeVersion}, but ${participant.name} conforms to ${participant.typedBy}`
      : null;
  const broken = () => {
    if (moved) result.reasons.unshift(moved);
    result.status = BROKEN;
    return result;
  };
  if (participating === null || participating.attribute === null || participating.obj === null) {
    result.reasons.push(`the participating element ${participatingRef} no longer exists`);
    return broken();
  }

  const provided = participating.attribute;
  const expected = initiating.attribute;
  for (const name of ["eType", "unit", "meaning"] as const) {
    const wanted = expects[name];
    if (wanted !== undefined && wanted !== null && wanted !== provided[name]) {
      result.reasons.push(
        `expects ${name} ${wanted}, but ${participatingRef} has ${str(provided[name])}`,
      );
    }
  }
  if (expects.eType !== undefined && expects.eType !== null && !PRIMITIVES.includes(expects.eType)) {
    result.reasons.push(`unknown expected eType ${repr(expects.eType)}`);
  }

  const mapping: string | null = link.props.mapping ?? null;
  const sameMeaning = provided.meaning === expected.meaning;
  if (mapping === null) {
    if (provided.eType !== expected.eType) {
      result.reasons.push(
        `${participatingRef} provides ${provided.eType}, ${initiatingRef} needs ` +
          `${expected.eType}, and there is no mapping`,
      );
    }
    if (provided.unit !== expected.unit) {
      result.reasons.push(
        `unit ${repr(provided.unit)} does not match the expected unit ${repr(expected.unit)}`,
      );
    }
    if (!sameMeaning) {
      result.reasons.push(
        `meaning ${repr(provided.meaning)} differs from ${repr(expected.meaning)}: ` +
          "no value coercion across meanings",
      );
    }
  } else {
    let valid = true;
    try {
      const derived = inferType(mapping, provided.name, provided.eType);
      if (derived !== expected.eType) {
        result.reasons.push(
          `the mapping yields ${derived}, ${initiatingRef} needs ${expected.eType}`,
        );
      }
    } catch (error) {
      if (!(error instanceof MappingError)) throw error;
      valid = false;
      result.reasons.push(`invalid mapping ${repr(mapping)}: ${error.message}`);
    }
    if (!sameMeaning) {
      const rule = findRule(fed.derivations, provided.meaning, expected.meaning);
      if (rule === null) {
        result.reasons.push(
          `no admitted derivation from ${repr(provided.meaning)} to ${repr(expected.meaning)}: ` +
            "no value coercion across meanings",
        );
      } else if (valid) {
        let same = true;
        try {
          same = sameExpression(mapping, rule.expression, provided.name);
        } catch (error) {
          if (!(error instanceof MappingError)) throw error;
        }
        if (!same) {
          result.reasons.push(
            `the mapping differs from the admitted derivation ${repr(rule.expression)}`,
          );
        }
      }
    }
  }
  return result.reasons.length ? broken() : result;
}

/** Status of every correspondence, plus the observations that nothing provides. */
export function checkCorrespondences(fed: Federation): CorrespondenceStatus[] {
  const results = links(fed, CORRESPONDENCE).map((link) => checkLink(fed, link));

  const byInitiating = new Map<string, CorrespondenceStatus[]>();
  for (const result of results) {
    if (result.status === HOLDS || result.status === BROKEN) {
      byInitiating.set(result.initiating, [...(byInitiating.get(result.initiating) ?? []), result]);
    }
  }
  for (const [initiating, group] of byInitiating) {
    if (group.length > 1) {
      const others = group.map((r) => String(r.correspondence)).join(", ");
      for (const result of group) {
        result.status = AMBIGUOUS;
        result.reasons.push(`${initiating} has several correspondences: ${others}`);
      }
    }
  }

  const covered = new Set(results.map((r) => r.initiating));
  for (const instance of instances(fed)) {
    const o1 = typeOf(fed, instance);
    if (o1 === null) continue;
    for (const obj of Object.values(instance.objects)) {
      const eclass = o1.eClasses[obj.instanceOf];
      if (!eclass || !classProps(fed, o1, eclass.name).requiresSource) continue;
      for (const attribute of Object.keys(eclass.eAttributes)) {
        const element = ref(instance.name, obj.name, attribute);
        if (attribute in obj.bindings || attribute in obj.slots || covered.has(element)) continue;
        results.push({
          status: MISSING,
          initiating: element,
          correspondence: null,
          participating: null,
          reasons: [`${element} is neither bound to data nor provided by another DT`],
        });
      }
    }
  }
  return results;
}

export function correspondenceIssues(fed: Federation): Issue[] {
  return checkCorrespondences(fed)
    .filter((result) => result.status !== HOLDS && result.status !== PENDING)
    .map((result) => ({
      check: `correspondence:${result.status}`,
      element: result.correspondence || result.initiating,
      message: result.reasons.join("; "),
    }));
}

/** Conformance gate (O0 to O1, O1 to O2) and correspondence check. */
export function gate(fed: Federation): Issue[] {
  return [...checkConformance(fed), ...validateWeaving(fed), ...correspondenceIssues(fed)];
}
