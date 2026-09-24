import { validateFormulaProgram } from "./formula-schema";
import type { FormulaProgram } from "./formula-ast";

export function validateProgramOrThrow(program: FormulaProgram): void {
  const errors = validateFormulaProgram(program);
  if (errors.length) {
    throw new Error(`Invalid formula program: ${errors.join("; ")}`);
  }
}
