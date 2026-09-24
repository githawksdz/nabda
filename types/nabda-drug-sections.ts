/**
 * Sanitized drug monograph section candidates.
 * Dry-run / future import only. Do not mount `html` in React.
 * Wording is source-preserved, not rewritten.
 */

export type NabdaDrugSectionKind =
  | "identity"
  | "forms"
  | "composition"
  | "indications"
  | "posology"
  | "contraindications"
  | "warnings"
  | "interactions"
  | "pregnancy_lactation"
  | "adverse_effects"
  | "overdose"
  | "pharmacology"
  | "storage"
  | "prescription_status"
  | "references"
  | "other";

export type NabdaDrugSectionPriority = "critical" | "normal" | "background";

export type NabdaDrugSectionDisplay =
  | "identity_card"
  | "availability_card"
  | "safety_card"
  | "posology_card"
  | "interaction_table"
  | "adverse_effect_table"
  | "collapsible"
  | "table_cards"
  | "long_read"
  | "source_drawer";

export type NabdaDrugTablePattern =
  | "simple_table"
  | "nested_table"
  | "large_table"
  | "interaction_table"
  | "adverse_effect_table"
  | "posology_table"
  | "composition_table"
  | "other_table";

export type NabdaDrugTableStats = {
  tableCount: number;
  maxRows: number;
  maxColumns: number;
  hasNestedTables: boolean;
  patterns: NabdaDrugTablePattern[];
  recommendedDisplay: NabdaDrugSectionDisplay;
};

export type NabdaDrugSection = {
  id: string;
  drugSourceId: string;
  drugSlug: string;
  order: number;
  sourceKey?: string;
  sourceHeading: string;
  title: string;
  kind: NabdaDrugSectionKind;
  priority: NabdaDrugSectionPriority;
  display: NabdaDrugSectionDisplay;
  html: string;
  text: string;
  containsDose: boolean;
  containsContraindication: boolean;
  containsInteraction: boolean;
  containsPregnancyLactation: boolean;
  containsRenalHepatic: boolean;
  containsTable: boolean;
  containsNestedTable: boolean;
  containsImage: boolean;
  containsFranceSpecificPrescription: boolean;
  rawHtmlPreserved: true;
  warnings: string[];
  tableStats?: NabdaDrugTableStats;
};

export type NabdaDrugDetailTab =
  | "Aperçu"
  | "Posologie"
  | "Sécurité"
  | "Interactions"
  | "Formes"
  | "Sources";

export type NabdaDrugLocalGroup =
  | "Disponibilité DZ"
  | "Présentations"
  | "Produits"
  | "Laboratoires";

export type NabdaDrugPharmacistGroup =
  | "Sécurité"
  | "Interactions"
  | "Formes"
  | "DCI/produits"
  | "Sources";

export type DrugSanitizeInput = {
  id: string;
  presentation_id?: string;
  sections?: Record<string, string>;
  section_locale?: Record<string, string>;
  locale_status?: string;
  source_context?: string;
  sources?: Record<string, unknown>;
};

export type DrugSanitizeResult = {
  drugSourceId: string;
  drugSlug: string;
  presentationId: string | null;
  localeStatus: string | null;
  sections: NabdaDrugSection[];
  missingExpectedKeys: string[];
  skippedJunkKeys: string[];
  warnings: string[];
  tabGroups: Record<NabdaDrugDetailTab, string[]>;
};
