/**
 * Build-time codegen: FormulaProgram → TypeScript engine module source.
 * Emits explicit arithmetic; no runtime parser / eval.
 */
import type { FormulaNode, FormulaProgram } from "./formula-ast";
import { validateProgramOrThrow } from "./formula-validator";

function emitExpr(node: FormulaNode): string {
  switch (node.type) {
    case "constant":
      return JSON.stringify(node.value);
    case "input":
      return `__num(input[${JSON.stringify(node.key)}])`;
    case "add":
      return `(${node.values.map(emitExpr).join(" + ")})`;
    case "subtract":
      return `(${emitExpr(node.left)} - ${emitExpr(node.right)})`;
    case "multiply":
      return `(${node.values.map(emitExpr).join(" * ")})`;
    case "divide":
      return `__div(${emitExpr(node.numerator)}, ${emitExpr(node.denominator)})`;
    case "power":
      return `Math.pow(${emitExpr(node.base)}, ${emitExpr(node.exponent)})`;
    case "sqrt":
      return `Math.sqrt(${emitExpr(node.value)})`;
    case "log":
      return `Math.log(${emitExpr(node.value)})`;
    case "exp":
      return `Math.exp(${emitExpr(node.value)})`;
    case "abs":
      return `Math.abs(${emitExpr(node.value)})`;
    case "min":
      return `Math.min(${node.values.map(emitExpr).join(", ")})`;
    case "max":
      return `Math.max(${node.values.map(emitExpr).join(", ")})`;
    case "round": {
      const d = node.decimals ?? 0;
      return `__round(${emitExpr(node.value)}, ${d})`;
    }
    case "floor":
      return `Math.floor(${emitExpr(node.value)})`;
    case "ceil":
      return `Math.ceil(${emitExpr(node.value)})`;
    case "clamp":
      return `Math.min(${emitExpr(node.max)}, Math.max(${emitExpr(node.min)}, ${emitExpr(node.value)}))`;
    case "compare": {
      const op =
        node.operator === "=="
          ? "==="
          : node.operator === "!="
            ? "!=="
            : node.operator;
      return `(${emitExpr(node.left)} ${op} ${emitExpr(node.right)})`;
    }
    case "and":
      return `(${node.values.map(emitExpr).join(" && ")})`;
    case "or":
      return `(${node.values.map(emitExpr).join(" || ")})`;
    case "not":
      return `!(${emitExpr(node.value)})`;
    case "conditional":
      return `((${emitExpr(node.condition)}) ? (${emitExpr(node.whenTrue)}) : (${emitExpr(node.whenFalse)}))`;
    case "lookup": {
      const rows = JSON.stringify(node.rows);
      return `__lookup(${emitExpr(node.input)}, ${rows})`;
    }
    case "dateDifference":
      return `__dateDiff(input[${JSON.stringify(node.startInput)}], input[${JSON.stringify(node.endInput)}], ${JSON.stringify(node.unit)})`;
    default: {
      const _exhaustive: never = node;
      return _exhaustive;
    }
  }
}

function folderForSlug(category: string): string {
  switch (category) {
    case "date_arithmetic":
      return "dates";
    case "rule_based":
    case "lookup_table":
      return "rules";
    case "diagnostic_criteria":
      return "diagnostic";
    case "dosing_formula":
      return "dosing";
    default:
      return "formula";
  }
}

export function codegenEngineModule(
  program: FormulaProgram,
  category: string,
): { relativePath: string; source: string; folder: string } {
  validateProgramOrThrow(program);
  const folder = folderForSlug(category);
  const relativePath = `${folder}/${program.slug}.ts`;
  const requiredInputs = program.inputs.filter((k) => k !== "UOMSYSTEM");
  const primary = program.outputs[0]!;
  const extraOutputs = program.outputs.slice(1);

  const source = `/* eslint-disable */
// @ts-nocheck
/**
 * GENERATED calculator engine — do not edit by hand.
 * sourceId: ${program.sourceId}
 * slug: ${program.slug}
 * version: ${program.version}
 * Build-time AST codegen only. No source JS execution.
 */
import type { CalculatorEngine, CalculatorEngineResult } from "@/lib/calculators/engine-types";
import { incompleteInput, invalidValue, engineFail } from "@/lib/calculators/engine-errors";

export type GeneratedInput = Record<string, number | string | boolean | null | undefined>;

export type GeneratedOutput = {
  value: number | string | boolean;
  label: string;
  unit?: string;
  extras?: Array<{ id: string; value: number | string | boolean; label: string }>;
};

function __num(v: unknown): number {
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(String(v).replace(",", "."));
    if (Number.isFinite(n)) return n;
  }
  return Number.NaN;
}

function __div(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return Number.NaN;
  return a / b;
}

function __round(v: number, d: number): number {
  const f = 10 ** d;
  return Math.round(v * f) / f;
}

function __lookup(
  input: number | string | boolean,
  rows: Array<{ min?: number; max?: number; equals?: string | number | boolean; output: number | string }>,
): number | string {
  for (const row of rows) {
    if (row.equals !== undefined && row.equals === input) return row.output;
    if (typeof input === "number") {
      if (row.min !== undefined && input < row.min) continue;
      if (row.max !== undefined && input > row.max) continue;
      if (row.min !== undefined || row.max !== undefined) return row.output;
    }
  }
  return Number.NaN;
}

function __dateDiff(
  start: unknown,
  end: unknown,
  unit: "days" | "weeks" | "months" | "years",
): number {
  const s = start instanceof Date ? start : new Date(String(start));
  const e = end instanceof Date ? end : new Date(String(end));
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return Number.NaN;
  const ms = e.getTime() - s.getTime();
  const days = ms / 86400000;
  if (unit === "days") return days;
  if (unit === "weeks") return days / 7;
  if (unit === "months") return days / 30.4375;
  return days / 365.25;
}

const REQUIRED = ${JSON.stringify(requiredInputs)} as const;

export const engine: CalculatorEngine<GeneratedInput, GeneratedOutput> = {
  slug: ${JSON.stringify(program.slug)},
  version: ${JSON.stringify(program.version)},
  formulaType: "formula_calculator",
  validate(input) {
    const issues = [];
    for (const key of REQUIRED) {
      const raw = input?.[key];
      if (raw === null || raw === undefined || raw === "") {
        issues.push({ code: "required", field: key, message: key + " requis" });
      } else if (typeof raw !== "boolean" && Number.isNaN(__num(raw))) {
        issues.push({ code: "invalid", field: key, message: key + " invalide" });
      }
    }
    return issues.length ? { ok: false as const, issues } : { ok: true as const, issues: [] as [] };
  },
  calculate(input): CalculatorEngineResult<GeneratedOutput> {
    const v = this.validate(input);
    if (!v.ok) {
      return incompleteInput(
        v.issues.map((i) => i.field).filter(Boolean) as string[],
        v.issues[0]?.message,
      );
    }
    try {
      const primaryValue = ${emitExpr(primary.value)};
      if (typeof primaryValue === "number" && !Number.isFinite(primaryValue)) {
        return engineFail("invalid_value", "Résultat non fini (division par zéro ou domaine invalide)");
      }
      const extras = [
${extraOutputs
  .map(
    (o) =>
      `        { id: ${JSON.stringify(o.id)}, label: ${JSON.stringify(o.label)}, value: ${emitExpr(o.value)} },`,
  )
  .join("\n")}
      ];
      return {
        ok: true,
        output: {
          value: primaryValue,
          label: ${JSON.stringify(primary.label)},
          unit: ${
            typeof primary.unit === "string"
              ? JSON.stringify(primary.unit)
              : primary.unit
                ? `String(${emitExpr(primary.unit)})`
                : "undefined"
          },
          extras,
        },
      };
    } catch {
      return invalidValue("input", "Calcul impossible");
    }
  },
};

export default engine;
`;

  return { relativePath, source, folder };
}

export function stableEngineHash(source: string): string {
  let h = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    h ^= source.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
