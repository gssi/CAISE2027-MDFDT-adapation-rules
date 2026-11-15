/**
 * Element references, uniform across levels.
 *
 *   room@1#Occupancy.occupied   an attribute of an O1 class (type level)
 *   r1#occupancy.occupied       an attribute of an O0 object (instance level)
 *   r1@data#count               a runtime observation key of a DT (data level)
 *   r2                          a whole model
 */

const DATA_SUFFIX = "@data";

export interface ElementRef {
  model: string;
  path: string[];
  data: boolean;
}

export function parseRef(text: string): ElementRef {
  const hash = text.indexOf("#");
  let left = hash === -1 ? text : text.slice(0, hash);
  const right = hash === -1 ? "" : text.slice(hash + 1);
  const data = left.endsWith(DATA_SUFFIX);
  if (data) left = left.slice(0, -DATA_SUFFIX.length);
  return { model: left, path: right.split(".").filter(Boolean), data };
}

export function formatRef(ref: ElementRef): string {
  const left = ref.model + (ref.data ? DATA_SUFFIX : "");
  return ref.path.length ? `${left}#${ref.path.join(".")}` : left;
}

/** The object or class that owns the referenced feature. */
export function ownerOf(text: string): string {
  const parsed = parseRef(text);
  return formatRef({ ...parsed, path: parsed.path.slice(0, 1) });
}

export function dataRef(model: string, key: string): string {
  return formatRef({ model, path: [key], data: true });
}

export function ref(model: string, ...path: string[]): string {
  return formatRef({ model, path, data: false });
}
