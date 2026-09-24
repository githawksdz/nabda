/** Public calculator slug helpers (no mock catalog dependency). */

const CALCULATOR_SLUG_ALIASES: Record<string, string> = {
  "clairance-creatinine-cockcroft-gault": "cockcroft-gault",
  puqe: "score-puqe",
  "sofa-qsofa": "sofa",
  "chads-vasc": "cha2ds2-vasc",
  glasgow: "glasgow-coma-scale-score-gcs",
  "glasgow-coma-scale-score-gcs": "glasgow-coma-scale-score-gcs",
  cockcroft: "creatinine-clearance-cockcroft-gault-equation",
  "cockcroft-gault": "creatinine-clearance-cockcroft-gault-equation",
};

export function resolveCalculatorSlug(slug: string): string {
  return CALCULATOR_SLUG_ALIASES[slug] ?? slug;
}

export function isGlasgowSlug(slug: string): boolean {
  const resolved = resolveCalculatorSlug(slug);
  return resolved === "glasgow" || resolved === "glasgow-coma-scale-score-gcs";
}

export function isCockcroftSlug(slug: string): boolean {
  const resolved = resolveCalculatorSlug(slug);
  return (
    resolved === "cockcroft-gault" ||
    resolved === "creatinine-clearance-cockcroft-gault-equation"
  );
}

export function isPuqeSlug(slug: string): boolean {
  return resolveCalculatorSlug(slug) === "score-puqe";
}

export function hasActiveCalculatorEngine(slug: string): boolean {
  return isGlasgowSlug(slug) || isCockcroftSlug(slug);
}

export function isAdditiveFormulaType(formulaType: string | null | undefined): boolean {
  return formulaType === "additive_points";
}
