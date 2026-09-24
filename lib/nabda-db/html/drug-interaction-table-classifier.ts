/**
 * Display-only classification of interaction RCP tables.
 * Does not create an interaction engine or clinical rules.
 */

import type { NabdaInteractionTablePattern } from "@/types/nabda-drug-tables";
import type { DrugTableShapeAnalysis } from "@/lib/nabda-db/html/drug-table-shape-analyzer";

const CONTRA_RE = /association[s]? contre[- ]indiqu/i;
const NOT_RECOMMENDED_RE = /association[s]? d[eé]conseill/i;
const PRECAUTION_RE = /pr[eé]caution d['’]emploi/i;
const CONSIDER_RE = /[àa] prendre en compte/i;
const MARKER_RE = /\bINR\b|\bAVK\b|\bCYP\d|prolongation(?: du)? QT|\bQT\b/i;

export function hasInteractionTokens(text: string): boolean {
  return (
    CONTRA_RE.test(text) ||
    NOT_RECOMMENDED_RE.test(text) ||
    PRECAUTION_RE.test(text) ||
    CONSIDER_RE.test(text) ||
    MARKER_RE.test(text) ||
    /interaction/i.test(text)
  );
}

export function classifyInteractionTable(
  analysis: DrugTableShapeAnalysis,
  sectionText: string,
): NabdaInteractionTablePattern {
  const blob = `${analysis.headerTexts.join(" ")}\n${analysis.joinedText}\n${sectionText}`;
  const contra = CONTRA_RE.test(blob);
  const notRec = NOT_RECOMMENDED_RE.test(blob);
  const precaution = PRECAUTION_RE.test(blob);
  const consider = CONSIDER_RE.test(blob);
  const hits = [contra, notRec, precaution, consider].filter(Boolean).length;
  if (hits >= 2) return "mixed_interaction_table";
  if (contra) return "contraindicated_associations";
  if (notRec) return "not_recommended_associations";
  if (precaution) return "precaution_use";
  if (consider) return "to_consider";
  if (analysis.rowCount <= 1) return "plain_interaction_text";
  if (analysis.rowCount >= 8 && analysis.columnCount >= 3) return "mixed_interaction_table";
  return "plain_interaction_text";
}
