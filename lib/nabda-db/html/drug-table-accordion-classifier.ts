/**
 * Map analyzed RCP tables to mobile display candidates.
 * Display classification only — cells are not rewritten into rules or doses.
 */

import {
  classifyAdverseEffectTable,
  hasFrequencyTokens,
  hasSeverityTokens,
} from "@/lib/nabda-db/html/drug-adverse-effect-classifier";
import { classifyInteractionTable, hasInteractionTokens } from "@/lib/nabda-db/html/drug-interaction-table-classifier";
import { analyzeTableShape } from "@/lib/nabda-db/html/drug-table-shape-analyzer";
import { splitTables } from "@/lib/nabda-db/html/drug-table-normalizer";
import type { NabdaDrugSection } from "@/types/nabda-drug-sections";
import type {
  NabdaDrugTableCandidate,
  NabdaDrugTableDisplay,
  NabdaDrugTableKind,
  NabdaDrugTableRisk,
  NabdaPosologyTablePattern,
} from "@/types/nabda-drug-tables";

const DOSE_RE =
  /\b\d+([.,]\d+)?\s*(mg|µg|ug|mcg|g|ml|ui|meq)(\s*\/\s*kg)?\b|\b(mg\/kg|posologie|gouttes?|comprimés?|gélules?|injection|perfusion|\/jour|\/j)\b/i;

const RENAL_HEPATIC_RE =
  /insuffisance r[ée]nale|clairance|cr[ée]atinine|\bDFG\b|\brein\b|r[ée]nal|h[ée]patique|\bfoie\b/i;

const PREGNANCY_RE = /grossesse|enceinte|allaitement|lactation|femme enceinte/i;

const ADULT_RE = /\badulte|\b≥\s*40|\bfrom 18\b|poids.+(adulte|40\s*kg)/i;
const PEDIATRIC_RE = /\benfant|\bp[ée]diatr|\bnourrisson|\bnouveau[- ]n[ée]|kg\b.{0,12}(ans|mois)/i;
const ADMIN_RE = /mode d['’]administration|voie (orale|intraveineuse|parent[ée]rale)|perfusion|injection/i;

function classifyPosologyPattern(
  text: string,
  renal: boolean,
  hepatic: boolean,
): NabdaPosologyTablePattern {
  const renalHit = renal || /insuffisance r[ée]nale|clairance|cr[ée]atinine|\bDFG\b/i.test(text);
  const hepaticHit = hepatic || /h[ée]patique|\bfoie\b|insuffisance h[ée]pat/i.test(text);
  if (renalHit && hepaticHit) return "mixed_posology_table";
  if (renalHit) return "renal_adjustment";
  if (hepaticHit) return "hepatic_adjustment";
  const adult = ADULT_RE.test(text);
  const pediatric = PEDIATRIC_RE.test(text);
  if (adult && pediatric) return "mixed_posology_table";
  if (pediatric) return "pediatric_dosing_table";
  if (adult) return "adult_dosing_table";
  if (ADMIN_RE.test(text)) return "administration_mode_table";
  return "mixed_posology_table";
}

function classifyKind(
  sectionKind: string,
  nestedDepth: number,
  rowCount: number,
  columnCount: number,
): NabdaDrugTableKind {
  if (sectionKind === "adverse_effects") return "adverse_effect";
  if (sectionKind === "interactions") return "interaction";
  if (sectionKind === "posology") return "posology";
  if (sectionKind === "composition" || sectionKind === "forms") return "composition";
  if (sectionKind === "pharmacology") return "pharmacology";
  if (nestedDepth >= 2) return "nested";
  if (rowCount >= 20 || columnCount >= 8) return "large";
  if (columnCount <= 2 && rowCount <= 12) return "simple";
  return "unknown";
}

function classifyDisplay(input: {
  kind: NabdaDrugTableKind;
  nestedDepth: number;
  rowCount: number;
  columnCount: number;
  renalHepatic: boolean;
  adverseEffectPattern?: ReturnType<typeof classifyAdverseEffectTable>;
  interactionPattern?: ReturnType<typeof classifyInteractionTable>;
  posologyPattern?: NabdaPosologyTablePattern;
}): NabdaDrugTableDisplay {
  const { kind, nestedDepth, rowCount, columnCount, renalHepatic } = input;
  if (kind === "adverse_effect") {
    if (input.adverseEffectPattern === "frequency_table" || input.adverseEffectPattern === "mixed_adverse_effect_table") {
      return rowCount >= 20 ? "searchable_table" : "frequency_grouped_accordion";
    }
    if (input.adverseEffectPattern === "system_organ_class_table") return "accordion_group";
    if (rowCount >= 20) return "searchable_table";
    return "stacked_cards";
  }
  if (kind === "interaction") {
    if (rowCount >= 20 || (columnCount >= 4 && rowCount >= 8)) return "searchable_table";
    if (
      input.interactionPattern === "contraindicated_associations" ||
      input.interactionPattern === "not_recommended_associations" ||
      input.interactionPattern === "precaution_use" ||
      input.interactionPattern === "to_consider" ||
      input.interactionPattern === "mixed_interaction_table"
    ) {
      return "interaction_precaution_list";
    }
    return "stacked_cards";
  }
  if (kind === "posology") {
    if (renalHepatic || input.posologyPattern === "renal_adjustment" || input.posologyPattern === "hepatic_adjustment") {
      return "accordion_group";
    }
    if (rowCount >= 20) return "searchable_table";
    if (input.posologyPattern === "mixed_posology_table" && rowCount >= 8) return "long_read_table";
    if (rowCount < 8) return "stacked_cards";
    return "long_read_table";
  }
  if (nestedDepth >= 2) {
    return rowCount >= 8 || columnCount >= 4 ? "long_read_table" : "accordion_group";
  }
  if (columnCount >= 6) return "horizontal_scroll_table";
  if (columnCount === 2 && rowCount <= 8) return "key_value_card";
  if (rowCount < 8) return "stacked_cards";
  if (rowCount >= 20) return "searchable_table";
  return "long_read_table";
}

function classifyRisk(
  kind: NabdaDrugTableKind,
  sectionKind: string,
  nestedDepth: number,
  rowCount: number,
  warnings: string[],
): NabdaDrugTableRisk {
  if (kind === "posology" || kind === "interaction" || kind === "adverse_effect") return "high";
  if (sectionKind === "prescription_status") return "low";
  if (nestedDepth >= 2 && rowCount >= 8) return "high";
  if (warnings.includes("large_table") || warnings.includes("merged_cells") || warnings.includes("missing_headers")) {
    return "moderate";
  }
  if (kind === "nested" || kind === "large") return "moderate";
  return "low";
}

export function classifySectionTables(section: NabdaDrugSection): NabdaDrugTableCandidate[] {
  const tables = splitTables(section.html);
  const candidates: NabdaDrugTableCandidate[] = [];
  tables.forEach((tableHtml, tableIndex) => {
    const analysis = analyzeTableShape(tableHtml, section.kind);
    if (analysis.rowCount === 0 && analysis.columnCount === 0) return;
    const blob = `${analysis.joinedText}\n${section.text}`;
    const containsDose = DOSE_RE.test(blob) || section.containsDose;
    const containsRenalHepatic = RENAL_HEPATIC_RE.test(blob) || section.containsRenalHepatic;
    const containsPregnancyLactation = PREGNANCY_RE.test(blob) || section.containsPregnancyLactation;
    const containsFrequency = hasFrequencyTokens(blob);
    const containsSeverity = hasSeverityTokens(blob);
    const containsInteraction = section.kind === "interactions" || hasInteractionTokens(blob);
    const containsAdverseEffect = section.kind === "adverse_effects" || containsFrequency;
    const kind = classifyKind(section.kind, analysis.nestedDepth, analysis.rowCount, analysis.columnCount);
    const adverseEffectPattern =
      kind === "adverse_effect" ? classifyAdverseEffectTable(analysis, section.text) : undefined;
    const interactionPattern =
      kind === "interaction" ? classifyInteractionTable(analysis, section.text) : undefined;
    const posologyPattern =
      kind === "posology"
        ? classifyPosologyPattern(blob, containsRenalHepatic, /h[ée]patique|\bfoie\b/i.test(blob))
        : undefined;
    const display = classifyDisplay({
      kind,
      nestedDepth: analysis.nestedDepth,
      rowCount: analysis.rowCount,
      columnCount: analysis.columnCount,
      renalHepatic: containsRenalHepatic,
      adverseEffectPattern,
      interactionPattern,
      posologyPattern,
    });
    const warnings = [...analysis.warnings];
    if (section.containsFranceSpecificPrescription || section.kind === "prescription_status") {
      warnings.push("france_prescription_table");
    }
    if (kind === "posology" && containsRenalHepatic) {
      warnings.push("renal_hepatic_inside_posology");
    }
    const shouldNotBecomeRules = kind === "interaction" || kind === "adverse_effect" || kind === "posology";
    candidates.push({
      id: `${section.id}:table:${tableIndex}`,
      drugSourceId: section.drugSourceId,
      drugSlug: section.drugSlug,
      sectionId: section.id,
      sectionKind: section.kind,
      sourceKey: section.sourceKey,
      sourceHeading: section.sourceHeading,
      tableIndex,
      kind,
      display,
      risk: classifyRisk(kind, section.kind, analysis.nestedDepth, analysis.rowCount, warnings),
      shape: analysis.shape,
      adverseEffectPattern,
      interactionPattern,
      posologyPattern,
      rowCount: analysis.rowCount,
      columnCount: analysis.columnCount,
      nestedDepth: analysis.nestedDepth,
      headerTexts: analysis.headerTexts,
      firstColumnSamples: analysis.firstColumnSamples,
      cellPreview: analysis.cellPreview,
      containsDose,
      containsInteraction,
      containsAdverseEffect,
      containsFrequency,
      containsSeverity,
      containsRenalHepatic,
      containsPregnancyLactation,
      preserveCells: true,
      shouldNotBecomeRules,
      warnings: [...new Set(warnings)],
    });
  });
  return candidates;
}
