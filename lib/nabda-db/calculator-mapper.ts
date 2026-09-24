import {
  identityImportDefaults,
  mapLocaleStatus,
  type CalculatorIdentity,
  type CalculatorRiskClassification,
  type NabdaDbCalcInput,
  type NabdaDbCalculator,
} from "@/lib/nabda-db/source-types";
import { calculatorSlug, sourceIdToSlug } from "@/lib/nabda-db/slugs";
import {
  mapSourceTagsToNabdaTags,
  mapSpecialtiesToCategoryAndTags,
} from "@/lib/nabda-db/taxonomy";

const FRENCH_HINT =
  /[àâäéèêëïîôùûüçœæ]|\b(pour|des|une|score de|critères|critere)\b/i;

function looksFrench(text?: string | null): boolean {
  return Boolean(text && FRENCH_HINT.test(text));
}

function looksEnglish(text?: string | null): boolean {
  if (!text) {
    return false;
  }
  return /\b(the|and|with|score|risk|criteria|years|history)\b/i.test(text);
}

function pickFrCandidate(
  language: string | null | undefined,
  primary: string | null | undefined,
  secondary?: string | null,
): string | null {
  if (language === "fr" && primary) {
    return primary;
  }
  if (looksFrench(primary)) {
    return primary ?? null;
  }
  if (looksFrench(secondary)) {
    return secondary ?? null;
  }
  return null;
}

function pickEnCandidate(
  language: string | null | undefined,
  primary: string | null | undefined,
  secondary?: string | null,
): string | null {
  if (language === "en" && primary && !(looksFrench(primary) && !looksEnglish(primary))) {
    return primary;
  }
  if (looksEnglish(primary) && !looksFrench(primary)) {
    return primary ?? null;
  }
  if (looksEnglish(secondary) && !looksFrench(secondary)) {
    return secondary ?? null;
  }
  if (looksFrench(primary) && !looksEnglish(primary)) {
    return null;
  }
  return language === "fr" ? null : (primary ?? null);
}

function isNumericOption(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function isSimpleAdditive(inputs: NabdaDbCalcInput[]): boolean {
  const scored = inputs.filter(
    (input) => input.type !== "subheading" && input.type !== "visual",
  );
  if (scored.length === 0) {
    return false;
  }
  return scored.every(
    (input) =>
      Array.isArray(input.options) &&
      input.options.length > 0 &&
      input.options.every((option) => isNumericOption(option.value)),
  );
}

function classifyRisk(source: NabdaDbCalculator): CalculatorRiskClassification {
  if (source.dosing) {
    return "dosing_or_high_risk";
  }
  const inputs = source.input_schema ?? [];
  if (isSimpleAdditive(inputs)) {
    return "later_additive_candidate";
  }
  if (source.calc_type === "diagnostic_criteria") {
    return "needs_manual_logic_review";
  }
  if (source.equation_logic_text || source.logic_language === "javascript") {
    return "needs_manual_logic_review";
  }
  if (source.formula) {
    return "needs_manual_logic_review";
  }
  return "identity_only";
}

function formulaLooksLikeHtml(formula?: string | null): boolean {
  if (!formula) {
    return false;
  }
  return /<\/?[a-z][\s\S]*>/i.test(formula);
}

/**
 * Identity only. Does not execute equation_logic_text or emit formula_json.
 */
export function mapCalculatorIdentity(
  source: NabdaDbCalculator,
): CalculatorIdentity {
  const specialties = source.specialties ?? [];
  const mapped = mapSpecialtiesToCategoryAndTags(specialties);
  const purposeTags = mapSourceTagsToNabdaTags(source.purpose ?? []);
  const language = source.language ?? null;
  const description = source.medium_description || source.short_description || null;

  return {
    ...identityImportDefaults(),
    source_id: source.id,
    source_prefix: "calc",
    source_slug: sourceIdToSlug(source.id),
    slug: calculatorSlug(source),
    title_en: pickEnCandidate(language, source.title, source.short_title),
    title_fr_candidate: pickFrCandidate(language, source.title, source.short_title),
    description_en: pickEnCandidate(language, description),
    description_fr_candidate: pickFrCandidate(language, description),
    language,
    specialty_slugs: specialties,
    category_slug: mapped.category_slug,
    tag_slugs: [...new Set([...mapped.tag_slugs, ...purposeTags, "scores"])],
    calc_type: source.calc_type ?? null,
    input_count: (source.input_schema ?? []).filter(
      (input) => input.type !== "subheading",
    ).length,
    input_types: [
      ...new Set(
        (source.input_schema ?? [])
          .map((input) => input.type)
          .filter((type): type is string => Boolean(type)),
      ),
    ],
    has_formula_html: formulaLooksLikeHtml(source.formula),
    has_equation_logic_text: Boolean(source.equation_logic_text),
    is_runnable_source: Boolean(source.runnable) && !source.disabled,
    needs_adaptation:
      source.locale_status !== "ok" && source.locale_status !== "adapted",
    risk_classification: classifyRisk(source),
    local_adaptation_status: mapLocaleStatus(source.locale_status),
    source_trace: {
      pack: "nabda_db",
      file: `calcs/${source.id}.json`,
      source_context: source.source_context ?? null,
      locale_status: source.locale_status ?? null,
      logic_language: source.logic_language ?? null,
      dosing: Boolean(source.dosing),
      equation_logic_not_executed: true,
      formula_json_not_generated: true,
      unmapped_specialties: mapped.unmapped_specialties,
      db_local_adaptation_status_candidate: mapLocaleStatus(source.locale_status),
    },
  };
}
