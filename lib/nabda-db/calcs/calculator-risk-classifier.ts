/**
 * Risk classification for calculator dry-run.
 * High-risk / dosing calculators stay locked. Raw JS is never eval'd.
 */

import type { NabdaDbCalculator } from "@/lib/nabda-db/source-types";
import type { NabdaCalculatorRisk } from "@/types/nabda-calculator-analysis";

const HIGH_RISK_RE =
  /\b(dosing|dose calculator|posologie|anticoagul|warfarin|heparin|inr dose|insulin|opioid conversion|morphine equivalent|chemotherap|cytotoxic|antidote|n-acetylcysteine|naloxone|thromboly|alteplase|\btpa\b|tenecteplase|renal (drug )?adjust|adaptation posologique|suicide|self-harm|phq-9|c-ssrs|obstetric emergency|eclampsia|insulin drip)\b/i;

const PEDIATRIC_DOSE_RE = /pediatric dose|posologie p[ée]diatr|mg\/kg.*(enfant|child|pediatric)/i;
const EMERGENCY_RE = /\b(urgences|samu|stroke|avc|thromboly|sepsis|anaphyla|trauma|gcs|coma)\b/i;
const PEDIATRIC_RE = /\b(p[ée]diatr|enfant|nourrisson|neonat|newborn|child|infant|pgcs)\b/i;
const DOSING_LANG_RE =
  /\b(dose|posologie|mg\/kg|µg\/|mcg\/kg|units\/kg|bolus|perfusion|titrate)\b/i;

export function blobForRisk(source: NabdaDbCalculator): string {
  return [
    source.id,
    source.slug,
    source.title,
    source.short_title,
    source.short_description,
    source.medium_description,
    source.formula,
    (source.specialties ?? []).join(" "),
    (source.diseases ?? []).join(" "),
  ]
    .filter(Boolean)
    .join("\n");
}

export function hasDosingLanguage(source: NabdaDbCalculator): boolean {
  return Boolean(source.dosing) || DOSING_LANG_RE.test(blobForRisk(source));
}

export function hasEmergencyUse(source: NabdaDbCalculator): boolean {
  return EMERGENCY_RE.test(blobForRisk(source)) || (source.specialties ?? []).includes("urgences");
}

export function hasPediatricUse(source: NabdaDbCalculator): boolean {
  return (
    PEDIATRIC_RE.test(blobForRisk(source)) || (source.specialties ?? []).includes("pediatrie")
  );
}

export function isHighRiskCalculator(source: NabdaDbCalculator): boolean {
  if (source.dosing) return true;
  const blob = blobForRisk(source);
  return HIGH_RISK_RE.test(blob) || PEDIATRIC_DOSE_RE.test(blob);
}

export function classifyCalculatorRisk(input: {
  source: NabdaDbCalculator;
  highRisk: boolean;
  additive: boolean;
  hasRawJs: boolean;
  hasConditionalInputs: boolean;
}): { risk: NabdaCalculatorRisk; shouldStayLocked: boolean; warnings: string[] } {
  const warnings: string[] = [];
  if (input.highRisk) {
    warnings.push("high_risk_dosing");
    return { risk: "high", shouldStayLocked: true, warnings };
  }
  if (input.hasRawJs) warnings.push("raw_js_present");
  if (input.hasConditionalInputs) warnings.push("conditional_complexity");
  if (input.additive && !input.hasRawJs) {
    return { risk: "low", shouldStayLocked: false, warnings };
  }
  if (input.hasRawJs || input.hasConditionalInputs) {
    return { risk: "moderate", shouldStayLocked: false, warnings };
  }
  return { risk: "moderate", shouldStayLocked: false, warnings };
}
