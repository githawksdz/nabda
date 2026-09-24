/**
 * Calculator rendering labels and DTO shaping.
 * Display / UX-planning only. Never eval equation_logic_text or emit formula_json.
 */

import {
  classifyCalculatorInputs,
  classifySourceInputType,
  hasConditionality,
  isYesNoInput,
  optionCount,
  type CalcInputExtended,
} from "@/lib/nabda-db/calcs/calculator-input-classifier";
import { formulaLooksLikeHtml, inspectEquationLogic } from "@/lib/nabda-db/calcs/calculator-formula-classifier";
import { mapCalculatorIdentity } from "@/lib/nabda-db/calculator-mapper";
import type { NabdaDbCalcInput, NabdaDbCalculator } from "@/lib/nabda-db/source-types";
import type { NabdaCalculatorAnalysis } from "@/types/nabda-calculator-analysis";
import type {
  CalculatorRenderIndexItem,
  CalculatorRenderInput,
  CalculatorRenderSource,
  CalculatorRenderReference,
  CalculatorRenderWarning,
  CalculatorRenderDemo,
} from "@/types/content-rendering-calculator";

export const CALCULATOR_SLUG_ALIASES: Record<string, string> = {
  "curb-65-score-for-pneumonia-severity-crb-65": "curb-65-score-pneumonia-severity",
  "tpa-dosing": "tpa-tissue-plasminogen-activator-dosing-stroke-calculator",
};

export const UX_PATTERN_LABELS: Record<string, string> = {
  tap_score: "Score tactile",
  compact_emergency: "Urgence compacte",
  numeric_formula: "Formule numérique",
  date_wheel: "Date",
  checklist: "Checklist",
  stepwise_wizard: "Assistant",
  long_form: "Formulaire long",
  locked_dosing: "Posologie verrouillée",
  unknown: "Non classé",
};

export const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  moderate: "Modéré",
  high: "Élevé",
};

export const KIND_LABELS: Record<string, string> = {
  simple_score: "Score simple",
  formula_calculator: "Formule",
  diagnostic_criteria: "Critères",
  dosing_or_high_risk: "Posologie à risque",
  rule_based: "Règles",
  date_calculator: "Date",
  mixed: "Mixte",
  unknown: "Inconnu",
};

export const FORMULA_TYPE_LABELS: Record<string, string> = {
  additive_points: "Points additifs",
  single_equation: "Équation unique",
  multi_equation: "Équations multiples",
  date_arithmetic: "Arithmétique de dates",
  rule_table: "Table de règles",
  algorithmic_branching: "Branchements",
  free_text_only: "Texte libre",
  dosing_formula: "Formule de dose",
  unknown: "Formule inconnue",
};

export const PUBLIC_CALCULATOR_DEMOS: Record<string, CalculatorRenderDemo> = {
  "calc.glasgow-coma-scale-score-gcs": {
    label: "Démo publique disponible",
    href: "/calculators/glasgow",
  },
  "calc.creatinine-clearance-cockcroft-gault-equation": {
    label: "Démo publique disponible",
    href: "/calculators/cockcroft-gault",
  },
};

const ADAPTED_LOCALE = new Set(["ok", "adapted"]);

export function resolveCalculatorPreviewSlug(slug: string): string {
  return CALCULATOR_SLUG_ALIASES[slug] ?? slug;
}

export function publicCalculatorHref(slug: string): string {
  if (slug === "glasgow-coma-scale-score-gcs" || slug === "glasgow") {
    return "/calculators/glasgow";
  }
  if (
    slug === "creatinine-clearance-cockcroft-gault-equation" ||
    slug === "cockcroft-gault"
  ) {
    return "/calculators/cockcroft-gault";
  }
  return `/calculators/${slug}`;
}

export function humanizeCalculatorSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

export function uxPatternLabel(pattern: string): string {
  return UX_PATTERN_LABELS[pattern] ?? pattern;
}

export function riskLabel(risk: string): string {
  return RISK_LABELS[risk] ?? risk;
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

export function formulaTypeLabel(type: string): string {
  return FORMULA_TYPE_LABELS[type] ?? type;
}

export function languageLabel(language: string | null): string {
  if (language === "fr") return "Français";
  if (language === "en") return "Anglais";
  return language || "Langue inconnue";
}

export function calculatorPreviewTitle(analysis: NabdaCalculatorAnalysis): string {
  return analysis.titleFrCandidate || analysis.titleEn || humanizeCalculatorSlug(analysis.slug);
}

export function isAdaptedLocale(localeStatus: string | null | undefined): boolean {
  if (!localeStatus) return false;
  return ADAPTED_LOCALE.has(localeStatus);
}

export function mapIndexItem(
  analysis: NabdaCalculatorAnalysis,
  extras?: { specialties?: string[]; localeStatus?: string | null },
): CalculatorRenderIndexItem {
  const localeStatus = extras?.localeStatus ?? null;
  return {
    title: calculatorPreviewTitle(analysis),
    slug: analysis.slug,
    sourceId: analysis.sourceId,
    kind: analysis.kind,
    uxPattern: analysis.uxPattern,
    risk: analysis.risk,
    inputCount: analysis.inputCount,
    formulaType: analysis.formulaType,
    hasRawJs: analysis.hasRawJs,
    language: analysis.language,
    warningCount: analysis.warnings.length,
    locked: false, // Product: risk must not lock UI; engines gate interactivity.
    hasEmergencyUse: analysis.hasEmergencyUse,
    needsAdaptation: !isAdaptedLocale(localeStatus) && (localeStatus != null || analysis.language !== "fr"),
    alreadyHasLocalDemoEngine: analysis.alreadyHasLocalDemoEngine,
    specialties: extras?.specialties ?? [],
  };
}

function formatReference(ref: unknown): CalculatorRenderReference | null {
  if (typeof ref === "string") {
    const label = ref.trim();
    return label ? { label } : null;
  }
  if (!ref || typeof ref !== "object") return null;
  const record = ref as Record<string, unknown>;
  const label = String(
    record.title ?? record.citation ?? record.name ?? record.label ?? record.source ?? "",
  ).trim();
  const href = typeof record.url === "string" ? record.url : undefined;
  if (!label && !href) return null;
  return { label: label || href || "Référence", href };
}

export function mapCalculatorInputs(raw: NabdaDbCalcInput[] | undefined): CalculatorRenderInput[] {
  const classified = classifyCalculatorInputs(raw);
  return classified.scoredInputs.map((input: CalcInputExtended) => {
    const type = classifySourceInputType(input);
    const options = (input.options ?? []).map((option) => ({
      label: String(option.label ?? option.value ?? ""),
      value: String(option.value ?? ""),
    }));
    const longLabel = (input.label?.length ?? 0) > 80 || (input.tips?.length ?? 0) > 160;
    return {
      name: input.name ?? "",
      label: input.label || input.name || "Champ",
      type,
      sourceType: input.type ?? null,
      options,
      optionCount: optionCount(input),
      unit: input.unit ?? null,
      optional: input.optional === true,
      required: input.optional !== true,
      conditional: hasConditionality(input),
      conditionality: input.conditionality,
      longLabel,
      tips: input.tips,
      yesNo: isYesNoInput(input),
    };
  });
}

export function mapCalculatorPreviewModel(input: {
  source: NabdaDbCalculator;
  analysis: NabdaCalculatorAnalysis;
  warningItems: CalculatorRenderWarning[];
}): CalculatorRenderSource {
  const { source, analysis } = input;
  const identity = mapCalculatorIdentity(source);
  const logic = inspectEquationLogic(source.equation_logic_text);
  const formulaHtml = formulaLooksLikeHtml(source.formula) ? (source.formula ?? undefined) : undefined;
  const references = (source.references ?? [])
    .map(formatReference)
    .filter((item): item is CalculatorRenderReference => Boolean(item));

  return {
    slug: analysis.slug,
    title: calculatorPreviewTitle(analysis),
    sourceId: analysis.sourceId,
    description: analysis.descriptionEn ?? identity.description_fr_candidate ?? undefined,
    kind: analysis.kind,
    uxPattern: analysis.uxPattern,
    risk: analysis.risk,
    formulaType: analysis.formulaType,
    language: analysis.language,
    localeStatus: source.locale_status ?? null,
    specialties: source.specialties ?? [],
    categorySlug: identity.category_slug || null,
    inputCount: analysis.inputCount,
    optionCount: analysis.optionCount,
    locked: false, // Product: do not lock catalogue/interactive UX by risk classification.
    hasRawJs: analysis.hasRawJs,
    hasEquationLogicText: analysis.hasEquationLogicText,
    logicLanguage: source.logic_language ?? null,
    jsCharCount: logic.charCount,
    jsLooksLikeJs: logic.looksLikeJs,
    jsContainsEval: logic.containsEval,
    alreadyHasLocalDemoEngine: analysis.alreadyHasLocalDemoEngine,
    publicDemo: PUBLIC_CALCULATOR_DEMOS[analysis.sourceId] ?? null,
    canBecomeTapScoreCandidate: analysis.canBecomeTapScoreCandidate,
    canBecomeNumericFormulaCandidate: analysis.canBecomeNumericFormulaCandidate,
    requiresStepwiseUx: analysis.requiresStepwiseUx,
    hasConditionalInputs: analysis.hasConditionalInputs,
    hasDosingLanguage: analysis.hasDosingLanguage,
    hasEmergencyUse: analysis.hasEmergencyUse,
    hasPediatricUse: analysis.hasPediatricUse,
    hasFormulaHtml: analysis.hasFormulaHtml,
    hasReferences: analysis.hasReferences,
    missingFormula: analysis.warnings.includes("missing_formula"),
    formulaPreview: analysis.formulaHtmlPreview,
    formulaHtml,
    // Never expose equation_logic_text / jsPreview on public DTOs.
    jsPreview: undefined,
    inputs: mapCalculatorInputs(source.input_schema),
    references,
    relatedCalcIds: source.related_calc_ids ?? [],
    warnings: analysis.warnings,
    warningItems: input.warningItems,
  };
}
