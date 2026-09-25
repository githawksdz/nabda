/**
 * Presentation-only control choice. Does not change engine input contracts.
 */

export type CalculatorControlKind =
  | "yes_no"
  | "segmented"
  | "select"
  | "checkbox_group"
  | "number"
  | "date"
  | "text";

const YES_NO = /^(oui|non|yes|no|vrai|faux|true|false)$/i;

export function isYesNoProposition(input: {
  type: string;
  yesNo?: boolean;
  options: Array<{ label: string; value: string }>;
}): boolean {
  if (input.yesNo) return true;
  if (input.type !== "toggle" && input.type !== "radio") return false;
  if (input.options.length !== 2) return false;
  return input.options.every((option) => YES_NO.test(option.label.trim()));
}

export function resolveCalculatorControl(input: {
  type: string;
  yesNo?: boolean;
  options: Array<{ label: string; value: string }>;
}): CalculatorControlKind {
  if (input.type === "date") return "date";
  if (input.type === "text") return "text";
  if (input.type === "number" || input.type === "unit_value") return "number";
  if (input.type === "multi_select") return "select";
  if (input.type === "computed") return "text";
  if (isYesNoProposition(input)) return "yes_no";

  const count = input.options.length;
  if (count === 0) {
    return input.type === "unknown" ? "text" : "number";
  }
  if (count <= 4 && (input.type === "radio" || input.type === "toggle" || input.type === "select")) {
    return "segmented";
  }
  return "select";
}
