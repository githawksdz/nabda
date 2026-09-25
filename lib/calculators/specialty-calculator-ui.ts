/**
 * Maps resolved calculator slugs to dedicated client UI shells.
 * Publication/entitlement is never decided here — only which local UI to mount.
 */
import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";

export type SpecialtyCalculatorUiKind = "glasgow" | "cockcroft";

const SPECIALTY_UI_BY_RESOLVED_SLUG: Record<string, SpecialtyCalculatorUiKind> = {
  "glasgow-coma-scale-score-gcs": "glasgow",
  "creatinine-clearance-cockcroft-gault-equation": "cockcroft",
};

export function specialtyCalculatorUiKind(
  slug: string,
): SpecialtyCalculatorUiKind | null {
  const resolved = resolveCalculatorSlug(slug);
  return SPECIALTY_UI_BY_RESOLVED_SLUG[resolved] ?? null;
}

export function listDedicatedSpecialtyUiSlugs(): string[] {
  return Object.keys(SPECIALTY_UI_BY_RESOLVED_SLUG);
}
