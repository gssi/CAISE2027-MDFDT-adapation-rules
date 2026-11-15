/** Weaving models: relations between models, kept outside the woven models. */
import { loadYaml } from "../kernel/yaml";
import { modelFromDict, type Dict, type EClass, type Model } from "../kernel/model";
import { WEAVING_METAMODEL_YAML } from "./metamodel";

export const LINK_END = "WLinkEnd";
export const METAMODEL_NAME = "weaving";

let cached: Model | null = null;

export function weavingMetamodel(): Model {
  if (cached === null) cached = modelFromDict(loadYaml<Dict>(WEAVING_METAMODEL_YAML));
  return cached;
}

export function linkClass(linkType: string): EClass | null {
  return weavingMetamodel().eClasses[linkType] ?? null;
}

export function endNames(linkType: string): string[] {
  const eclass = linkClass(linkType);
  if (eclass === null) return [];
  return Object.entries(eclass.eReferences)
    .filter(([, reference]) => reference.eType === LINK_END)
    .map(([name]) => name);
}

export interface WLink {
  id: string;
  type: string;
  ends: Record<string, string>;
  props: Dict;
}

export interface WModel {
  name: string;
  typedBy: string;
  woven: string[];
  links: WLink[];
  props: Dict;
}

export function wlink(id: string, type: string, ends: Record<string, string>, props: Dict = {}) {
  return { id, type, ends, props } as WLink;
}

export function wmodel(name: string, init: Partial<WModel> = {}): WModel {
  return { name, typedBy: METAMODEL_NAME, woven: [], links: [], props: {}, ...init };
}

export function linkFromDict(data: Dict): WLink {
  const rest: Dict = { ...data };
  const { id, type } = rest;
  delete rest.id;
  delete rest.type;
  const ends: Record<string, string> = {};
  for (const name of endNames(type)) {
    if (rest[name] !== null && rest[name] !== undefined) ends[name] = rest[name];
    delete rest[name];
  }
  return { id, type, ends, props: rest };
}

export function linkToDict(link: WLink): Dict {
  const out: Dict = { id: link.id, type: link.type, ...link.ends };
  for (const [key, value] of Object.entries(link.props)) {
    if (value !== null && value !== undefined) out[key] = value;
  }
  return out;
}

export function wmodelFromDict(data: Dict): WModel {
  const rest: Dict = { ...data };
  const out: WModel = {
    name: rest.wModel,
    typedBy: rest.typedBy ?? METAMODEL_NAME,
    woven: [...(rest.woven ?? [])],
    links: ((rest.links ?? []) as Dict[]).map(linkFromDict),
    props: {},
  };
  for (const key of ["wModel", "typedBy", "woven", "links"]) delete rest[key];
  out.props = rest;
  return out;
}

export function wmodelToDict(model: WModel): Dict {
  const out: Dict = { wModel: model.name, typedBy: model.typedBy };
  if (model.woven.length) out.woven = [...model.woven];
  Object.assign(out, model.props);
  out.links = model.links.map(linkToDict);
  return out;
}

export function linkById(model: WModel, id: string): WLink | null {
  return model.links.find((link) => link.id === id) ?? null;
}

export function linksOfType(model: WModel, type: string): WLink[] {
  return model.links.filter((link) => link.type === type);
}
