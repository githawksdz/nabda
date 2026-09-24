/**
 * Drug RCP table display candidates.
 * Dry-run / future rendering only. Cells are source-preserved, not rewritten.
 * Do not convert these into interaction rules or dosing logic.
 */

import type { NabdaDrugSectionKind } from "@/types/nabda-drug-sections";

export type NabdaDrugTableKind =
  | "simple"
  | "nested"
  | "large"
  | "posology"
  | "interaction"
  | "adverse_effect"
  | "composition"
  | "pharmacology"
  | "unknown";

export type NabdaDrugTableDisplay =
  | "key_value_card"
  | "stacked_cards"
  | "accordion_group"
  | "searchable_table"
  | "frequency_grouped_accordion"
  | "interaction_precaution_list"
  | "horizontal_scroll_table"
  | "long_read_table";

export type NabdaDrugTableRisk = "low" | "moderate" | "high";

export type NabdaDrugTableShape =
  | "small_key_value"
  | "two_column_label_value"
  | "multi_column_grid"
  | "nested_layout_table"
  | "long_adverse_effect_table"
  | "interaction_table"
  | "posology_table"
  | "composition_table"
  | "pharmacology_table"
  | "unknown";

export type NabdaAdverseEffectTablePattern =
  | "frequency_table"
  | "system_organ_class_table"
  | "severity_table"
  | "mixed_adverse_effect_table"
  | "plain_adverse_effect_list";

export type NabdaInteractionTablePattern =
  | "contraindicated_associations"
  | "not_recommended_associations"
  | "precaution_use"
  | "to_consider"
  | "mixed_interaction_table"
  | "plain_interaction_text";

export type NabdaPosologyTablePattern =
  | "adult_dosing_table"
  | "pediatric_dosing_table"
  | "renal_adjustment"
  | "hepatic_adjustment"
  | "administration_mode_table"
  | "mixed_posology_table";

export type NabdaDrugTableCandidate = {
  id: string;
  drugSourceId: string;
  drugSlug: string;
  sectionId: string;
  sectionKind: NabdaDrugSectionKind | string;
  sourceKey?: string;
  sourceHeading: string;

  tableIndex: number;
  kind: NabdaDrugTableKind;
  display: NabdaDrugTableDisplay;
  risk: NabdaDrugTableRisk;
  shape: NabdaDrugTableShape;
  adverseEffectPattern?: NabdaAdverseEffectTablePattern;
  interactionPattern?: NabdaInteractionTablePattern;
  posologyPattern?: NabdaPosologyTablePattern;

  rowCount: number;
  columnCount: number;
  nestedDepth: number;

  headerTexts: string[];
  firstColumnSamples: string[];
  cellPreview: string[][];

  containsDose: boolean;
  containsInteraction: boolean;
  containsAdverseEffect: boolean;
  containsFrequency: boolean;
  containsSeverity: boolean;
  containsRenalHepatic: boolean;
  containsPregnancyLactation: boolean;

  preserveCells: true;
  shouldNotBecomeRules: boolean;

  warnings: string[];
};
