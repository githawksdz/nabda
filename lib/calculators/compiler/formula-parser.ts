/**
 * Build-time JS → restricted Formula AST.
 * Uses acorn to parse; never executes source.
 */
import { parse as acornParse, type Node, type AnyNode } from "acorn";
import type {
  FormulaNode,
  FormulaOutputDecl,
  FormulaProgram,
  ParseResult,
  CompareOperator,
} from "./formula-ast";

const MATH_FN = new Set([
  "pow",
  "sqrt",
  "log",
  "log10",
  "exp",
  "abs",
  "min",
  "max",
  "round",
  "floor",
  "ceil",
]);

type Env = {
  inputs: Set<string>;
  locals: Map<string, FormulaNode>;
  outputs: FormulaOutputDecl[];
  errors: string[];
};

function fail(reason: string, detail?: string): ParseResult {
  return { ok: false, reason, detail };
}

function isIdent(node: AnyNode): node is AnyNode & { type: "Identifier"; name: string } {
  return node.type === "Identifier";
}

function convertExpr(node: AnyNode, env: Env): FormulaNode | null {
  switch (node.type) {
    case "Literal": {
      const lit = node as AnyNode & { value: unknown };
      if (
        typeof lit.value === "number" ||
        typeof lit.value === "string" ||
        typeof lit.value === "boolean"
      ) {
        return { type: "constant", value: lit.value };
      }
      env.errors.push(`Unsupported literal at ${node.start}`);
      return null;
    }
    case "Identifier": {
      const name = (node as AnyNode & { name: string }).name;
      if (env.locals.has(name)) return env.locals.get(name)!;
      if (env.inputs.has(name) || name === "UOMSYSTEM") {
        return { type: "input", key: name };
      }
      // Undeclared identifier treated as input if looks like field
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name !== "undefined") {
        env.inputs.add(name);
        return { type: "input", key: name };
      }
      env.errors.push(`Unknown identifier ${name}`);
      return null;
    }
    case "UnaryExpression": {
      const u = node as AnyNode & {
        operator: string;
        argument: AnyNode;
      };
      const arg = convertExpr(u.argument, env);
      if (!arg) return null;
      if (u.operator === "-") {
        return {
          type: "subtract",
          left: { type: "constant", value: 0 },
          right: arg,
        };
      }
      if (u.operator === "!") return { type: "not", value: arg };
      if (u.operator === "+") return arg;
      if (u.operator === "typeof") {
        // typeof checks are treated as presence → compare to empty
        return {
          type: "compare",
          operator: "!=",
          left: arg,
          right: { type: "constant", value: "" },
        };
      }
      env.errors.push(`Unsupported unary ${u.operator}`);
      return null;
    }
    case "BinaryExpression":
    case "LogicalExpression": {
      const b = node as AnyNode & {
        operator: string;
        left: AnyNode;
        right: AnyNode;
      };
      const left = convertExpr(b.left, env);
      const right = convertExpr(b.right, env);
      if (!left || !right) return null;
      switch (b.operator) {
        case "+":
          return { type: "add", values: [left, right] };
        case "-":
          return { type: "subtract", left, right };
        case "*":
          return { type: "multiply", values: [left, right] };
        case "/":
          return { type: "divide", numerator: left, denominator: right };
        case "%":
          // Emulate modulo via subtract/multiply/floor in restricted AST:
          // a % b = a - floor(a/b)*b
          return {
            type: "subtract",
            left,
            right: {
              type: "multiply",
              values: [
                { type: "floor", value: { type: "divide", numerator: left, denominator: right } },
                right,
              ],
            },
          };
        case "**":
          return { type: "power", base: left, exponent: right };
        case "&&":
          return { type: "and", values: [left, right] };
        case "||":
          return { type: "or", values: [left, right] };
        case "==":
        case "===":
          return { type: "compare", operator: "==", left, right };
        case "!=":
        case "!==":
          return { type: "compare", operator: "!=", left, right };
        case "<":
        case "<=":
        case ">":
        case ">=":
          return {
            type: "compare",
            operator: b.operator as CompareOperator,
            left,
            right,
          };
        default:
          env.errors.push(`Unsupported operator ${b.operator}`);
          return null;
      }
    }
    case "ConditionalExpression": {
      const c = node as AnyNode & {
        test: AnyNode;
        consequent: AnyNode;
        alternate: AnyNode;
      };
      const condition = convertExpr(c.test, env);
      const whenTrue = convertExpr(c.consequent, env);
      const whenFalse = convertExpr(c.alternate, env);
      if (!condition || !whenTrue || !whenFalse) return null;
      return { type: "conditional", condition, whenTrue, whenFalse };
    }
    case "CallExpression": {
      const call = node as AnyNode & {
        callee: AnyNode;
        arguments: AnyNode[];
      };
      // parseFloat(x) / parseInt(x) / Number(x)
      if (isIdent(call.callee)) {
        const fn = call.callee.name;
        if (fn === "parseFloat" || fn === "parseInt" || fn === "Number") {
          if (call.arguments.length < 1) return null;
          return convertExpr(call.arguments[0]!, env);
        }
      }
      // Math.pow / Math.sqrt / ...
      if (
        call.callee.type === "MemberExpression" &&
        (call.callee as AnyNode & { object: AnyNode; property: AnyNode }).object
          .type === "Identifier" &&
        ((call.callee as AnyNode & { object: AnyNode & { name: string } }).object
          .name === "Math")
      ) {
        const prop = (call.callee as AnyNode & { property: AnyNode }).property;
        const fn = isIdent(prop) ? prop.name : null;
        if (!fn || !MATH_FN.has(fn)) {
          env.errors.push(`Unsupported Math.${fn}`);
          return null;
        }
        const args = call.arguments.map((a) => convertExpr(a, env));
        if (args.some((a) => !a)) return null;
        const a0 = args[0]!;
        switch (fn) {
          case "pow":
            return { type: "power", base: a0, exponent: args[1]! };
          case "sqrt":
            return { type: "sqrt", value: a0 };
          case "log":
          case "log10":
            return { type: "log", value: a0 };
          case "exp":
            return { type: "exp", value: a0 };
          case "abs":
            return { type: "abs", value: a0 };
          case "min":
            return { type: "min", values: args as FormulaNode[] };
          case "max":
            return { type: "max", values: args as FormulaNode[] };
          case "round":
            return { type: "round", value: a0 };
          case "floor":
            return { type: "floor", value: a0 };
          case "ceil":
            return { type: "ceil", value: a0 };
        }
      }
      // x.toFixed(n) → round
      if (
        call.callee.type === "MemberExpression" &&
        isIdent((call.callee as AnyNode & { property: AnyNode }).property) &&
        ((call.callee as AnyNode & { property: AnyNode & { name: string } })
          .property.name === "toFixed")
      ) {
        const obj = convertExpr(
          (call.callee as AnyNode & { object: AnyNode }).object,
          env,
        );
        if (!obj) return null;
        let decimals = 0;
        if (call.arguments[0]?.type === "Literal") {
          decimals = Number(
            (call.arguments[0] as AnyNode & { value: unknown }).value,
          );
        }
        return { type: "round", value: obj, decimals };
      }
      env.errors.push(`Unsupported call at ${call.start}`);
      return null;
    }
    case "MemberExpression": {
      // Only Math.E / Math.PI constants
      const m = node as AnyNode & { object: AnyNode; property: AnyNode };
      if (isIdent(m.object) && m.object.name === "Math" && isIdent(m.property)) {
        if (m.property.name === "PI") return { type: "constant", value: Math.PI };
        if (m.property.name === "E") return { type: "constant", value: Math.E };
      }
      env.errors.push(`Unsupported member access at ${node.start}`);
      return null;
    }
    case "TemplateLiteral": {
      // Concatenate only constant parts + rejected if expressions complex
      const t = node as AnyNode & {
        quasis: Array<{ value: { cooked?: string | null } }>;
        expressions: AnyNode[];
      };
      if (t.expressions.length === 0) {
        return {
          type: "constant",
          value: t.quasis.map((q) => q.value.cooked ?? "").join(""),
        };
      }
      env.errors.push("Template literals with expressions unsupported");
      return null;
    }
    default:
      env.errors.push(`Unsupported expression ${node.type}`);
      return null;
  }
}

function convertStatement(node: AnyNode, env: Env): boolean {
  switch (node.type) {
    case "VariableDeclaration": {
      const decl = node as AnyNode & {
        declarations: Array<{ id: AnyNode; init: AnyNode | null }>;
      };
      for (const d of decl.declarations) {
        if (!isIdent(d.id)) {
          env.errors.push("Unsupported variable declaration pattern");
          return false;
        }
        if (d.id.name === "calc_output") {
          continue;
        }
        if (!d.init) {
          // `var units;` — initialize as empty string constant
          env.locals.set(d.id.name, { type: "constant", value: "" });
          continue;
        }
        const value = convertExpr(d.init, env);
        if (!value) return false;
        env.locals.set(d.id.name, value);
      }
      return true;
    }
    case "ExpressionStatement": {
      const expr = (node as AnyNode & { expression: AnyNode }).expression;
      // assignment
      if (expr.type === "AssignmentExpression") {
        const a = expr as AnyNode & {
          left: AnyNode;
          right: AnyNode;
          operator: string;
        };
        if (!isIdent(a.left)) {
          env.errors.push("Unsupported assignment");
          return false;
        }
        const right = convertExpr(a.right, env);
        if (!right) return false;
        const name = a.left.name;
        if (a.operator === "=") {
          env.locals.set(name, right);
          return true;
        }
        const prev = env.locals.get(name) ?? { type: "input" as const, key: name };
        if (a.operator === "+=") {
          env.locals.set(name, { type: "add", values: [prev, right] });
          return true;
        }
        if (a.operator === "-=") {
          env.locals.set(name, { type: "subtract", left: prev, right });
          return true;
        }
        if (a.operator === "*=") {
          env.locals.set(name, { type: "multiply", values: [prev, right] });
          return true;
        }
        if (a.operator === "/=") {
          env.locals.set(name, {
            type: "divide",
            numerator: prev,
            denominator: right,
          });
          return true;
        }
        env.errors.push("Unsupported assignment");
        return false;
      }
      // calc_output.push({...})
      if (
        expr.type === "CallExpression" &&
        (expr as AnyNode & { callee: AnyNode }).callee.type === "MemberExpression"
      ) {
        const callee = (expr as AnyNode & { callee: AnyNode }).callee as AnyNode & {
          object: AnyNode;
          property: AnyNode;
        };
        if (
          isIdent(callee.object) &&
          callee.object.name === "calc_output" &&
          isIdent(callee.property) &&
          callee.property.name === "push"
        ) {
          const arg = (expr as AnyNode & { arguments: AnyNode[] }).arguments[0];
          if (!arg || arg.type !== "ObjectExpression") {
            env.errors.push("calc_output.push requires object literal");
            return false;
          }
          const props = (
            arg as AnyNode & {
              properties: Array<{
                key: AnyNode;
                value: AnyNode;
              }>;
            }
          ).properties;
          const getProp = (name: string) => {
            const p = props.find(
              (x) => isIdent(x.key) && x.key.name === name,
            );
            return p?.value ?? null;
          };
          const valueNode = getProp("value");
          if (!valueNode) {
            env.errors.push("calc_output.push missing value");
            return false;
          }
          const value = convertExpr(valueNode, env);
          if (!value) return false;
          const nameNode = getProp("name");
          const msgNode = getProp("message");
          const unitNode = getProp("value_text");
          const id =
            nameNode && nameNode.type === "Literal"
              ? String((nameNode as AnyNode & { value: unknown }).value)
              : `out_${env.outputs.length}`;
          const label =
            msgNode && msgNode.type === "Literal"
              ? String((msgNode as AnyNode & { value: unknown }).value).replace(
                  /<[^>]+>/g,
                  " ",
                )
              : id;
          const out: FormulaOutputDecl = {
            id,
            label: label.slice(0, 120),
            value,
          };
          if (unitNode?.type === "Literal") {
            out.unit = String((unitNode as AnyNode & { value: unknown }).value);
          } else if (unitNode && isIdent(unitNode) && env.locals.has(unitNode.name)) {
            out.unit = env.locals.get(unitNode.name);
          } else if (unitNode) {
            const u = convertExpr(unitNode, env);
            if (u) out.unit = u;
          }
          env.outputs.push(out);
          return true;
        }
      }
      env.errors.push(`Unsupported expression statement ${expr.type}`);
      return false;
    }
    case "IfStatement": {
      const iff = node as AnyNode & {
        test: AnyNode;
        consequent: AnyNode;
        alternate: AnyNode | null;
      };
      const condition = convertExpr(iff.test, env);
      if (!condition) return false;
      // Only support simple then/else blocks that assign to locals we track
      // by converting both branches into conditional nodes for assigned vars.
      // Simplified: execute consequent statements in a branch-local env merge via conditional.
      const thenEnv: Env = {
        inputs: env.inputs,
        locals: new Map(env.locals),
        outputs: env.outputs,
        errors: env.errors,
      };
      const elseEnv: Env = {
        inputs: env.inputs,
        locals: new Map(env.locals),
        outputs: env.outputs,
        errors: env.errors,
      };
      const thenOk = convertBlock(iff.consequent, thenEnv);
      const elseOk = iff.alternate
        ? convertBlock(iff.alternate, elseEnv)
        : true;
      if (!thenOk || !elseOk) return false;
      // Merge locals that changed
      const keys = new Set([...thenEnv.locals.keys(), ...elseEnv.locals.keys()]);
      for (const key of keys) {
        const t = thenEnv.locals.get(key);
        const e = elseEnv.locals.get(key);
        if (t && e && JSON.stringify(t) !== JSON.stringify(e)) {
          env.locals.set(key, {
            type: "conditional",
            condition,
            whenTrue: t,
            whenFalse: e,
          });
        } else if (t && !e) {
          env.locals.set(key, {
            type: "conditional",
            condition,
            whenTrue: t,
            whenFalse: env.locals.get(key) ?? { type: "constant", value: 0 },
          });
        } else if (e && !t) {
          env.locals.set(key, {
            type: "conditional",
            condition,
            whenTrue: env.locals.get(key) ?? { type: "constant", value: 0 },
            whenFalse: e,
          });
        } else if (t) {
          env.locals.set(key, t);
        }
      }
      return true;
    }
    case "EmptyStatement":
    case "DebuggerStatement":
      return true;
    default:
      // Allow skipping comments-only; reject functions/loops
      if (
        node.type === "FunctionDeclaration" ||
        node.type === "ForStatement" ||
        node.type === "WhileStatement" ||
        node.type === "DoWhileStatement" ||
        node.type === "ForInStatement" ||
        node.type === "ForOfStatement"
      ) {
        env.errors.push(`Forbidden statement ${node.type}`);
        return false;
      }
      env.errors.push(`Unsupported statement ${node.type}`);
      return false;
  }
}

function convertBlock(node: AnyNode, env: Env): boolean {
  if (node.type === "BlockStatement") {
    const body = (node as AnyNode & { body: AnyNode[] }).body;
    for (const stmt of body) {
      if (!convertStatement(stmt, env)) return false;
    }
    return true;
  }
  return convertStatement(node, env);
}

const FORBIDDEN_SOURCE =
  /\b(eval|Function|require|import\s|export\s|fetch\s*\(|XMLHttp|localStorage|sessionStorage|window\.|document\.|globalThis|process\.|setTimeout|setInterval|async\s|await\s|Proxy|Reflect|with\s*\()/;

export function parseEquationLogicToProgram(args: {
  sourceId: string;
  slug: string;
  equationLogicText: string;
  inputNames?: string[];
  version?: string;
}): ParseResult {
  const src = args.equationLogicText.trim();
  if (!src) return fail("empty_equation_logic");
  if (FORBIDDEN_SOURCE.test(src)) {
    return fail("forbidden_js_construct", "Source contains forbidden APIs");
  }

  let ast: Node;
  try {
    ast = acornParse(src, {
      ecmaVersion: 2020,
      sourceType: "script",
      allowReturnOutsideFunction: false,
    });
  } catch (error) {
    return fail(
      "acorn_parse_error",
      error instanceof Error ? error.message : String(error),
    );
  }

  const env: Env = {
    inputs: new Set(args.inputNames ?? []),
    locals: new Map(),
    outputs: [],
    errors: [],
  };

  const body = (ast as AnyNode & { body: AnyNode[] }).body;
  for (const stmt of body) {
    if (!convertStatement(stmt, env)) {
      return fail("unsupported_statement", env.errors.slice(-3).join("; "));
    }
  }

  if (!env.outputs.length) {
    // Fallback: last numeric local as output
    const last = [...env.locals.entries()].filter(
      ([k]) => k !== "units" && k !== "msg" && k !== "string",
    );
    if (last.length) {
      const [name, value] = last[last.length - 1]!;
      env.outputs.push({ id: name, label: name, value });
    }
  }

  if (!env.outputs.length) {
    return fail("no_outputs", env.errors.join("; ") || "No calc_output.push found");
  }

  if (env.errors.length) {
    // Soft errors during conversion of optional paths — still fail closed
    return fail("conversion_errors", env.errors.slice(0, 5).join("; "));
  }

  const program: FormulaProgram = {
    sourceId: args.sourceId,
    slug: args.slug,
    version: args.version ?? "1.0.0",
    inputs: [...env.inputs],
    assignments: [...env.locals.entries()].map(([name, value]) => ({
      name,
      value,
    })),
    outputs: env.outputs.slice(0, 8),
  };
  return { ok: true, program };
}
