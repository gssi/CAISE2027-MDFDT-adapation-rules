/**
 * Mapping expressions of correspondences and the derivation catalogue.
 *
 * A mapping derives the value expected by an initiating DT from the value a
 * participating DT provides, e.g. `count > 0`. The language is deliberately
 * small and strictly typed, so that a value can never be coerced across
 * meanings: there is no conditional, arithmetic rejects Booleans, and an
 * expression must read its source. A Boolean can therefore never become a number.
 */
import { NUMERIC, etypeOf, repr, valueConforms, type Dict } from "./kernel/model";

export const SOURCE_NAME = "value";

export class MappingError extends Error {}

type Node =
  | { kind: "name"; id: string }
  | { kind: "const"; value: number | boolean }
  | { kind: "compare"; op: string; left: Node; right: Node }
  | { kind: "binary"; op: string; left: Node; right: Node }
  | { kind: "bool"; op: "and" | "or"; values: Node[] }
  | { kind: "unary"; op: "not" | "-"; operand: Node };

const COMPARISONS = [">=", "<=", "==", "!=", ">", "<"];
const TOKEN = /\s*(>=|<=|==|!=|[()<>+\-*/]|\d+\.\d+|\d+|[A-Za-z_][A-Za-z_0-9]*)/y;

function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  TOKEN.lastIndex = 0;
  let position = 0;
  while (position < expression.length) {
    if (!expression.slice(position).trim()) break;
    TOKEN.lastIndex = position;
    const match = TOKEN.exec(expression);
    if (!match) throw new MappingError(`invalid mapping ${repr(expression)}: invalid syntax`);
    tokens.push(match[1]);
    position = TOKEN.lastIndex;
  }
  return tokens;
}

function parse(expression: string): Node {
  const tokens = tokenize(expression);
  let index = 0;
  const invalid = () => new MappingError(`invalid mapping ${repr(expression)}: invalid syntax`);
  const peek = () => tokens[index];
  const next = () => tokens[index++];

  function atom(): Node {
    const token = next();
    if (token === undefined) throw invalid();
    if (token === "(") {
      const inner = or();
      if (next() !== ")") throw invalid();
      return inner;
    }
    if (/^\d/.test(token)) return { kind: "const", value: Number(token) };
    if (token === "True" || token === "true") return { kind: "const", value: true };
    if (token === "False" || token === "false") return { kind: "const", value: false };
    if (["and", "or", "not", "if", "else"].includes(token)) throw invalid();
    if (/^[A-Za-z_]/.test(token)) return { kind: "name", id: token };
    throw invalid();
  }
  function unary(): Node {
    if (peek() === "-") {
      next();
      return { kind: "unary", op: "-", operand: unary() };
    }
    return atom();
  }
  function product(): Node {
    let left = unary();
    while (peek() === "*" || peek() === "/") left = { kind: "binary", op: next(), left, right: unary() };
    return left;
  }
  function sum(): Node {
    let left = product();
    while (peek() === "+" || peek() === "-") {
      left = { kind: "binary", op: next(), left, right: product() };
    }
    return left;
  }
  function comparison(): Node {
    const left = sum();
    if (!COMPARISONS.includes(peek())) return left;
    const op = next();
    const node: Node = { kind: "compare", op, left, right: sum() };
    if (COMPARISONS.includes(peek())) throw new MappingError("unsupported comparison");
    return node;
  }
  function not(): Node {
    if (peek() === "not") {
      next();
      return { kind: "unary", op: "not", operand: not() };
    }
    return comparison();
  }
  function and(): Node {
    const values = [not()];
    while (peek() === "and") {
      next();
      values.push(not());
    }
    return values.length === 1 ? values[0] : { kind: "bool", op: "and", values };
  }
  function or(): Node {
    const values = [and()];
    while (peek() === "or") {
      next();
      values.push(and());
    }
    return values.length === 1 ? values[0] : { kind: "bool", op: "or", values };
  }

  const tree = or();
  if (index < tokens.length) throw invalid();
  return tree;
}

function names(node: Node): string[] {
  switch (node.kind) {
    case "name":
      return [node.id];
    case "const":
      return [];
    case "unary":
      return names(node.operand);
    case "bool":
      return node.values.flatMap(names);
    default:
      return [...names(node.left), ...names(node.right)];
  }
}

function infer(node: Node, env: Record<string, string>): string {
  switch (node.kind) {
    case "name":
      if (!(node.id in env)) throw new MappingError(`unknown name ${repr(node.id)}`);
      return env[node.id];
    case "const":
      return etypeOf(node.value) as string;
    case "compare": {
      const left = infer(node.left, env);
      const right = infer(node.right, env);
      if (NUMERIC.includes(left) && NUMERIC.includes(right)) return "EBoolean";
      if (["==", "!="].includes(node.op) && left === "EBoolean" && right === "EBoolean") {
        return "EBoolean";
      }
      throw new MappingError(`cannot compare ${left} with ${right}`);
    }
    case "binary": {
      const left = infer(node.left, env);
      const right = infer(node.right, env);
      if (!NUMERIC.includes(left) || !NUMERIC.includes(right)) {
        throw new MappingError(
          "arithmetic on a Boolean is a value coercion across meanings and is not allowed",
        );
      }
      return node.op === "/" || left === "EDouble" || right === "EDouble" ? "EDouble" : "EInt";
    }
    case "bool":
      if (node.values.some((v) => infer(v, env) !== "EBoolean")) {
        throw new MappingError("logical operators need Boolean operands");
      }
      return "EBoolean";
    case "unary": {
      const operand = infer(node.operand, env);
      if (node.op === "not" && operand === "EBoolean") return "EBoolean";
      if (node.op === "-" && NUMERIC.includes(operand)) return operand;
      throw new MappingError("unsupported unary operator");
    }
  }
}

/** Result type of `expression` applied to a source of `sourceType`. */
export function inferType(expression: string, sourceName: string, sourceType: string): string {
  const node = parse(expression);
  const env = { [sourceName]: sourceType, [SOURCE_NAME]: sourceType };
  if (!names(node).some((name) => name in env)) {
    throw new MappingError("a mapping must read the value provided by the participating DT");
  }
  const result = infer(node, env);
  if (sourceType === "EBoolean" && NUMERIC.includes(result)) {
    throw new MappingError("a Boolean cannot be mapped to a number"); // unreachable by construction
  }
  return result;
}

function evaluateNode(node: Node, env: Dict): number | boolean {
  switch (node.kind) {
    case "name":
      return env[node.id];
    case "const":
      return node.value;
    case "compare": {
      const left = evaluateNode(node.left, env);
      const right = evaluateNode(node.right, env);
      if (node.op === ">") return left > right;
      if (node.op === ">=") return left >= right;
      if (node.op === "<") return left < right;
      if (node.op === "<=") return left <= right;
      if (node.op === "==") return left === right;
      return left !== right;
    }
    case "binary": {
      const left = evaluateNode(node.left, env) as number;
      const right = evaluateNode(node.right, env) as number;
      if (node.op === "+") return left + right;
      if (node.op === "-") return left - right;
      if (node.op === "*") return left * right;
      return left / right;
    }
    case "bool": {
      const values = node.values.map((v) => evaluateNode(v, env));
      return node.op === "and" ? values.every(Boolean) : values.some(Boolean);
    }
    case "unary": {
      const operand = evaluateNode(node.operand, env);
      return node.op === "not" ? !operand : -(operand as number);
    }
  }
}

/** Type-check, then evaluate `expression` on a runtime `value`. */
export function evaluate(
  expression: string,
  sourceName: string,
  sourceType: string,
  value: unknown,
): number | boolean {
  if (!valueConforms(value, sourceType)) {
    throw new MappingError(`value ${repr(value)} does not conform to ${sourceType}`);
  }
  inferType(expression, sourceName, sourceType);
  return evaluateNode(parse(expression), { [sourceName]: value, [SOURCE_NAME]: value });
}

// -- conditions: a Boolean expression over several named values --------------

/** The names an expression reads. */
export function namesIn(expression: string): string[] {
  return [...new Set(names(parse(expression)))];
}

/** The type of `expression` over values of the given types; throws when it does not type-check. */
export function conditionType(expression: string, types: Record<string, string>): string {
  const node = parse(expression);
  if (!names(node).length) throw new MappingError("a condition must read a value");
  return infer(node, types);
}

/** Whether a condition holds for the given values, typed as in `types`. */
export function conditionValue(expression: string, types: Record<string, string>, values: Dict): boolean {
  if (conditionType(expression, types) !== "EBoolean") throw new MappingError("a condition must be Boolean");
  for (const name of namesIn(expression)) {
    if (!valueConforms(values[name], types[name])) {
      throw new MappingError(`value ${repr(values[name])} of ${name} does not conform to ${types[name]}`);
    }
  }
  return evaluateNode(parse(expression), values) === true;
}

function rename(node: Node, from: string, to: string): Node {
  switch (node.kind) {
    case "name":
      return node.id === from ? { kind: "name", id: to } : node;
    case "const":
      return node;
    case "unary":
      return { ...node, operand: rename(node.operand, from, to) };
    case "bool":
      return { ...node, values: node.values.map((v) => rename(v, from, to)) };
    default:
      return { ...node, left: rename(node.left, from, to), right: rename(node.right, from, to) };
  }
}

const PRECEDENCE: Record<string, number> = { or: 1, and: 2, not: 3, "*": 6, "/": 6 };

function precedence(node: Node): number {
  if (node.kind === "bool") return PRECEDENCE[node.op];
  if (node.kind === "unary") return node.op === "not" ? 3 : 7;
  if (node.kind === "compare") return 4;
  if (node.kind === "binary") return PRECEDENCE[node.op] ?? 5;
  return 9;
}

function unparse(node: Node): string {
  const wrap = (child: Node, min: number) =>
    precedence(child) < min ? `(${unparse(child)})` : unparse(child);
  switch (node.kind) {
    case "name":
      return node.id;
    case "const":
      return typeof node.value === "boolean" ? (node.value ? "True" : "False") : String(node.value);
    case "unary":
      return node.op === "not" ? `not ${wrap(node.operand, 3)}` : `-${wrap(node.operand, 7)}`;
    case "bool":
      return node.values.map((v) => wrap(v, precedence(node) + 1)).join(` ${node.op} `);
    default: {
      const own = precedence(node);
      return `${wrap(node.left, own)} ${node.op} ${wrap(node.right, own + 1)}`;
    }
  }
}

export function renameSource(expression: string, from: string, to: string): string {
  return unparse(rename(parse(expression), from, to));
}

/** Structural equality once the source is called `value` on both sides. */
export function sameExpression(left: string, right: string, sourceName: string): boolean {
  const normal = (e: string) => JSON.stringify(rename(parse(e), sourceName, SOURCE_NAME));
  return normal(left) === normal(right);
}

/** An admitted derivation between meanings, e.g. people-count -> occupancy.
 * The catalogue is data of the modeling layer: the modelling assistant only
 * proposes derivations that are listed here. */
export interface DerivationRule {
  source: string;
  target: string;
  expression: string;
}

export function ruleFromDict(data: Dict): DerivationRule {
  return { source: data.from, target: data.to, expression: data.expression };
}

export function ruleToDict(rule: DerivationRule): Dict {
  return { from: rule.source, to: rule.target, expression: rule.expression };
}

export function findRule(
  rules: DerivationRule[],
  source: string | null | undefined,
  target: string | null | undefined,
): DerivationRule | null {
  if (!source || !target) return null;
  return rules.find((rule) => rule.source === source && rule.target === target) ?? null;
}
