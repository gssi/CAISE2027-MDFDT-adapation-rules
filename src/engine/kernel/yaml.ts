/** YAML helpers: human-readable, diffable, key order preserved. */
import { parse, stringify } from "yaml";

export function loadYaml<T = unknown>(text: string): T {
  return parse(text) as T;
}

export function dumpYaml(data: unknown): string {
  return stringify(data, { aliasDuplicateObjects: false, lineWidth: 100 });
}
