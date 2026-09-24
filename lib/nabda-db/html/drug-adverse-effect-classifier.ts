/**
 * Display-only classification of adverse-effect RCP tables.
 * Does not rewrite effect names or infer severity.
 */

import type { NabdaAdverseEffectTablePattern } from "@/types/nabda-drug-tables";
import type { DrugTableShapeAnalysis } from "@/lib/nabda-db/html/drug-table-shape-analyzer";

const FREQUENCY_RE =
  /tr[eè]s fr[eé]quent|fr[eé]quent|peu fr[eé]quent|tr[eè]s rare|\brare\b|ind[eé]termin[eé]e?|\binconnu(?:e)?\b/i;

const SOC_RE =
  /syst[eè]me[- ]organe|classe de syst[eè]mes|affections |troubles |infections et infestations|MedDRA|SOC\b/i;

const SEVERITY_RE = /\b(s[eé]v[eè]re|grave|l[eé]ger|mod[eé]r[eé]|grade\s*[1-4]|CTCAE)\b/i;

export function hasFrequencyTokens(text: string): boolean {
  return FREQUENCY_RE.test(text);
}

export function hasSeverityTokens(text: string): boolean {
  return SEVERITY_RE.test(text);
}

export function classifyAdverseEffectTable(
  analysis: DrugTableShapeAnalysis,
  sectionText: string,
): NabdaAdverseEffectTablePattern {
  const blob = `${analysis.headerTexts.join(" ")}\n${analysis.joinedText}\n${sectionText}`;
  const frequency = FREQUENCY_RE.test(blob);
  const soc =
    SOC_RE.test(blob) ||
    analysis.firstColumnSamples.some((label) => /affections |troubles |infections /i.test(label)) ||
    analysis.joinedText.split("\n").filter((line) => /affections |troubles /i.test(line)).length >= 2;
  const severity = SEVERITY_RE.test(blob);
  if (frequency && soc) return "mixed_adverse_effect_table";
  if (frequency) return "frequency_table";
  if (soc) return "system_organ_class_table";
  if (severity) return "severity_table";
  if (analysis.rowCount <= 1 && analysis.columnCount <= 1) return "plain_adverse_effect_list";
  if (analysis.rowCount >= 3 && analysis.columnCount >= 2) return "mixed_adverse_effect_table";
  return "plain_adverse_effect_list";
}
