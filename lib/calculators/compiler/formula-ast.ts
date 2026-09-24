/**
 * Restricted formula AST — build-time only.
 * Never execute; never ship a runtime JS evaluator.
 */

export type CompareOperator = "==" | "!=" | "<" | "<=" | ">" | ">=";

export type FormulaNode =
  | { type: "constant"; value: number | string | boolean }
  | { type: "input"; key: string }
  | { type: "add"; values: FormulaNode[] }
  | { type: "subtract"; left: FormulaNode; right: FormulaNode }
  | { type: "multiply"; values: FormulaNode[] }
  | { type: "divide"; numerator: FormulaNode; denominator: FormulaNode }
  | { type: "power"; base: FormulaNode; exponent: FormulaNode }
  | { type: "sqrt"; value: FormulaNode }
  | { type: "log"; value: FormulaNode }
  | { type: "exp"; value: FormulaNode }
  | { type: "abs"; value: FormulaNode }
  | { type: "min"; values: FormulaNode[] }
  | { type: "max"; values: FormulaNode[] }
  | { type: "round"; value: FormulaNode; decimals?: number }
  | { type: "floor"; value: FormulaNode }
  | { type: "ceil"; value: FormulaNode }
  | { type: "clamp"; value: FormulaNode; min: FormulaNode; max: FormulaNode }
  | {
      type: "compare";
      operator: CompareOperator;
      left: FormulaNode;
      right: FormulaNode;
    }
  | { type: "and"; values: FormulaNode[] }
  | { type: "or"; values: FormulaNode[] }
  | { type: "not"; value: FormulaNode }
  | {
      type: "conditional";
      condition: FormulaNode;
      whenTrue: FormulaNode;
      whenFalse: FormulaNode;
    }
  | {
      type: "lookup";
      input: FormulaNode;
      rows: Array<{
        min?: number;
        max?: number;
        equals?: string | number | boolean;
        output: number | string;
      }>;
    }
  | {
      type: "dateDifference";
      startInput: string;
      endInput: string;
      unit: "days" | "weeks" | "months" | "years";
    };

export type FormulaOutputDecl = {
  id: string;
  label: string;
  value: FormulaNode;
  unit?: FormulaNode | string;
  message?: FormulaNode | string;
};

export type FormulaProgram = {
  sourceId: string;
  slug: string;
  version: string;
  inputs: string[];
  assignments: Array<{ name: string; value: FormulaNode }>;
  outputs: FormulaOutputDecl[];
};

export type ParseFailure = {
  ok: false;
  reason: string;
  detail?: string;
};

export type ParseSuccess = {
  ok: true;
  program: FormulaProgram;
};

export type ParseResult = ParseSuccess | ParseFailure;
