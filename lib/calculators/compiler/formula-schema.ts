import type { FormulaNode, FormulaProgram } from "./formula-ast";

const ALLOWED_TYPES = new Set([
  "constant",
  "input",
  "add",
  "subtract",
  "multiply",
  "divide",
  "power",
  "sqrt",
  "log",
  "exp",
  "abs",
  "min",
  "max",
  "round",
  "floor",
  "ceil",
  "clamp",
  "compare",
  "and",
  "or",
  "not",
  "conditional",
  "lookup",
  "dateDifference",
]);

export function assertSafeFormulaNode(
  node: FormulaNode,
  path = "root",
): string[] {
  const errors: string[] = [];
  if (!node || typeof node !== "object" || !("type" in node)) {
    return [`${path}: missing type`];
  }
  if (!ALLOWED_TYPES.has(node.type)) {
    return [`${path}: forbidden type ${String((node as { type: string }).type)}`];
  }

  const walk = (n: FormulaNode, p: string) => {
    errors.push(...assertSafeFormulaNode(n, p));
  };

  switch (node.type) {
    case "constant":
    case "input":
    case "dateDifference":
      break;
    case "add":
    case "multiply":
    case "min":
    case "max":
    case "and":
    case "or":
      node.values.forEach((v, i) => walk(v, `${path}.values[${i}]`));
      break;
    case "subtract":
      walk(node.left, `${path}.left`);
      walk(node.right, `${path}.right`);
      break;
    case "divide":
      walk(node.numerator, `${path}.numerator`);
      walk(node.denominator, `${path}.denominator`);
      break;
    case "power":
      walk(node.base, `${path}.base`);
      walk(node.exponent, `${path}.exponent`);
      break;
    case "sqrt":
    case "log":
    case "exp":
    case "abs":
    case "floor":
    case "ceil":
    case "not":
      walk(node.value, `${path}.value`);
      break;
    case "round":
      walk(node.value, `${path}.value`);
      break;
    case "clamp":
      walk(node.value, `${path}.value`);
      walk(node.min, `${path}.min`);
      walk(node.max, `${path}.max`);
      break;
    case "compare":
      walk(node.left, `${path}.left`);
      walk(node.right, `${path}.right`);
      break;
    case "conditional":
      walk(node.condition, `${path}.condition`);
      walk(node.whenTrue, `${path}.whenTrue`);
      walk(node.whenFalse, `${path}.whenFalse`);
      break;
    case "lookup":
      walk(node.input, `${path}.input`);
      break;
    default:
      errors.push(`${path}: unhandled`);
  }
  return errors;
}

export function validateFormulaProgram(program: FormulaProgram): string[] {
  const errors: string[] = [];
  if (!program.slug) errors.push("missing slug");
  if (!program.sourceId) errors.push("missing sourceId");
  if (!program.outputs.length) errors.push("no outputs");
  for (const [i, a] of program.assignments.entries()) {
    errors.push(...assertSafeFormulaNode(a.value, `assignments[${i}]`));
  }
  for (const [i, o] of program.outputs.entries()) {
    errors.push(...assertSafeFormulaNode(o.value, `outputs[${i}].value`));
  }
  return errors;
}
