/**
 * Client-safe calculator preview labels, filters, and grouping.
 * Catalog/index helpers stay here. Renderer labels live in lib/content-rendering/calculator.
 */

import type { CalculatorRenderIndexItem } from "@/types/content-rendering-calculator";
import type {
  CalculatorPreviewFilter,
  CalculatorPreviewGroupBy,
  CalculatorPreviewMetrics,
} from "@/types/internal-preview";
import {
  languageLabel,
  riskLabel,
  uxPatternLabel,
} from "@/lib/content-rendering/calculator";

export {
  CALCULATOR_SLUG_ALIASES,
  FORMULA_TYPE_LABELS,
  KIND_LABELS,
  RISK_LABELS,
  UX_PATTERN_LABELS,
  formulaTypeLabel,
  humanizeCalculatorSlug,
  kindLabel,
  languageLabel,
  publicCalculatorHref,
  resolveCalculatorPreviewSlug,
  riskLabel,
  uxPatternLabel,
} from "@/lib/content-rendering/calculator";

export const CALCULATOR_PREVIEW_PAGE_SIZE = 40;

export const CALCULATOR_FILTERS: Array<{ id: CalculatorPreviewFilter; label: string }> = [
  { id: "tous", label: "Tous" },
  { id: "tap_score", label: "Tap score" },
  { id: "urgence", label: "Urgence" },
  { id: "numeric_formula", label: "Formule numérique" },
  { id: "checklist", label: "Checklist" },
  { id: "date", label: "Date" },
  { id: "dosing_locked", label: "Dosing verrouillé" },
  { id: "a_adapter", label: "À adapter" },
];

export const CALCULATOR_GROUP_OPTIONS: Array<{ id: CalculatorPreviewGroupBy; label: string }> = [
  { id: "ux", label: "UX" },
  { id: "risk", label: "Risque" },
  { id: "specialty", label: "Spécialité" },
  { id: "language", label: "Langue" },
];

const WARNING_LABELS: Record<string, string> = {
  raw_js_present: "JS source présent · non exécuté",
  never_eval_imported_js: "Jamais d’eval du JS importé",
  logic_language_javascript: "Langage source JavaScript",
  logic_language_r: "Logique R",
  eval_in_source_js: "eval dans le JS source",
  high_risk_dosing: "Haut risque / posologie",
  mixed_language: "Libellés FR/EN mélangés",
  long_labels_or_tips: "Libellés longs",
  too_many_inputs: "Plus de 8 champs",
  conditional_complexity: "Conditionnalité",
  missing_formula: "Formule manquante",
  unknown_input_type: "Type d’entrée inconnu",
  already_has_local_demo_engine: "Moteur démo local existant",
  unknown_ux_pattern: "UX non classée",
};

export function featuredCalculatorPreviewSlugs(): string[] {
  return [
    "glasgow-coma-scale-score-gcs",
    "creatinine-clearance-cockcroft-gault-equation",
    "apgar-score",
    "cha2ds2-va-score-atrial-fibrillation-stroke-risk",
    "curb-65-score-pneumonia-severity",
    "tpa-tissue-plasminogen-activator-dosing-stroke-calculator",
  ];
}

export function calculatorWarningLabel(type: string): string {
  return WARNING_LABELS[type] ?? type.replace(/_/g, " ");
}

export function summarizeCalculatorPreviewIndex(
  items: CalculatorRenderIndexItem[],
): CalculatorPreviewMetrics {
  return {
    total: items.length,
    tapScore: items.filter((item) => item.uxPattern === "tap_score").length,
    emergency: items.filter((item) => item.hasEmergencyUse || item.uxPattern === "compact_emergency")
      .length,
    numeric: items.filter((item) => item.uxPattern === "numeric_formula").length,
    locked: items.filter((item) => item.locked).length,
    rawJs: items.filter((item) => item.hasRawJs).length,
    demos: items.filter((item) => item.alreadyHasLocalDemoEngine).length,
    french: items.filter((item) => item.language === "fr").length,
  };
}

export function itemMatchesFilter(
  item: CalculatorRenderIndexItem,
  filter: CalculatorPreviewFilter,
): boolean {
  if (filter === "tous") return true;
  if (filter === "tap_score") return item.uxPattern === "tap_score";
  if (filter === "urgence") return item.hasEmergencyUse || item.uxPattern === "compact_emergency";
  if (filter === "numeric_formula") return item.uxPattern === "numeric_formula";
  if (filter === "checklist") return item.uxPattern === "checklist";
  if (filter === "date") return item.uxPattern === "date_wheel" || item.kind === "date_calculator";
  if (filter === "dosing_locked") return item.locked || item.uxPattern === "locked_dosing";
  if (filter === "a_adapter") return item.needsAdaptation;
  return true;
}

export function groupKeyForItem(
  item: CalculatorRenderIndexItem,
  groupBy: CalculatorPreviewGroupBy,
): string {
  if (groupBy === "ux") return item.uxPattern;
  if (groupBy === "risk") return item.risk;
  if (groupBy === "language") return item.language ?? "unknown";
  return item.specialties[0] ?? "unmapped";
}

export function groupLabel(groupBy: CalculatorPreviewGroupBy, key: string): string {
  if (groupBy === "ux") return uxPatternLabel(key);
  if (groupBy === "risk") return `Risque ${riskLabel(key).toLowerCase()}`;
  if (groupBy === "language") return languageLabel(key === "unknown" ? null : key);
  if (key === "unmapped") return "Spécialité non mappée";
  return key.replace(/_/g, " ");
}
