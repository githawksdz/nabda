import type {
  CalculatorEngineErrorCode,
  CalculatorEngineFailure,
  CalculatorValidationIssue,
  CalculatorValidationResult,
} from "@/lib/calculators/engine-types";

export function validationOk(): CalculatorValidationResult {
  return { ok: true, issues: [] };
}

export function validationFail(
  issues: CalculatorValidationIssue[],
): CalculatorValidationResult {
  return { ok: false, issues };
}

export function engineFail(
  code: CalculatorEngineErrorCode,
  message: string,
  fields?: string[],
): CalculatorEngineFailure {
  return { ok: false, error: { code, message, fields } };
}

export function incompleteInput(
  fields: string[],
  message = "Saisie incomplète",
): CalculatorEngineFailure {
  return engineFail("incomplete_input", message, fields);
}

export function invalidValue(
  field: string,
  message: string,
): CalculatorEngineFailure {
  return engineFail("invalid_value", message, [field]);
}

export function outOfRange(
  field: string,
  message: string,
): CalculatorEngineFailure {
  return engineFail("out_of_range", message, [field]);
}

export function invalidUnit(
  field: string,
  message: string,
): CalculatorEngineFailure {
  return engineFail("invalid_unit", message, [field]);
}

export function unsupportedEngine(
  message = "Moteur non disponible pour ce calculateur",
): CalculatorEngineFailure {
  return engineFail("engine_unavailable", message);
}
