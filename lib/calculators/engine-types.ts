/**
 * Typed calculator engine contract.
 * Engines are compiled TypeScript — never eval / new Function / equation_logic_text.
 */

export type CalculatorValidationIssue = {
  code: string;
  field?: string;
  message: string;
};

export type CalculatorValidationResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: CalculatorValidationIssue[] };

export type CalculatorEngineErrorCode =
  | "incomplete_input"
  | "invalid_unit"
  | "out_of_range"
  | "invalid_value"
  | "unsupported"
  | "engine_unavailable";

export type CalculatorEngineSuccess<Output> = {
  ok: true;
  output: Output;
};

export type CalculatorEngineFailure = {
  ok: false;
  error: {
    code: CalculatorEngineErrorCode;
    message: string;
    fields?: string[];
  };
};

export type CalculatorEngineResult<Output> =
  | CalculatorEngineSuccess<Output>
  | CalculatorEngineFailure;

export type CalculatorEngine<Input, Output> = {
  slug: string;
  version: string;
  formulaType:
    | "simple_score"
    | "formula_calculator"
    | "rule_based_calculator"
    | "diagnostic_criteria"
    | "date_calculator"
    | "dosing_or_high_risk"
    | "unsupported_or_ambiguous";
  validate(input: Input): CalculatorValidationResult;
  /** Never throws for normal user input; returns typed ok/error. */
  calculate(input: Input): CalculatorEngineResult<Output>;
};

export type AdditiveOption = {
  label: string;
  value: number;
};

export type AdditiveInputDef = {
  name: string;
  label: string;
  type: "radio" | "toggle" | "select" | "multi_select";
  optional?: boolean;
  options: AdditiveOption[];
};

export type AdditivePointsInput = {
  /** Selected option value per input name. */
  selections: Record<string, number | null | undefined>;
  schema: AdditiveInputDef[];
};

export type AdditivePointsOutput = {
  total: number;
  max: number;
  breakdown: Array<{ name: string; label: string; value: number }>;
};
