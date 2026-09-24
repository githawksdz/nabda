/**
 * Structured protocol section candidates.
 * Dry-run / future import only. Do not mount `html` in React.
 * Wording is source-preserved, not rewritten.
 */

export type NabdaProtocolSectionKind =
  | "summary"
  | "disease_overview"
  | "objectives"
  | "diagnosis"
  | "red_flags"
  | "workup"
  | "management"
  | "treatment"
  | "dosage"
  | "monitoring"
  | "orientation"
  | "special_population"
  | "advice"
  | "medications_cited"
  | "references"
  | "source"
  | "other";

export type NabdaProtocolSectionPriority = "urgent" | "normal" | "background";

export type NabdaProtocolSectionDisplay =
  | "hero_summary"
  | "quick_card"
  | "alert_card"
  | "collapsible"
  | "table_cards"
  | "linked_chips"
  | "long_read"
  | "source_drawer";

export type NabdaProtocolSection = {
  id: string;
  protocolSourceId: string;
  protocolSlug: string;
  sourceHeading: string;
  title: string;
  kind: NabdaProtocolSectionKind;
  priority: NabdaProtocolSectionPriority;
  display: NabdaProtocolSectionDisplay;
  order: number;
  html: string;
  text: string;
  containsDose: boolean;
  containsDrugMention: boolean;
  containsCalculatorMention: boolean;
  containsEmergencySignal: boolean;
  containsTable: boolean;
  containsImage: boolean;
  containsImagemap: boolean;
  rawHtmlPreserved: true;
  warnings: string[];
  linkedSourceIds?: string[];
};

export type NabdaProtocolMobileTab =
  | "Aperçu"
  | "Diagnostic"
  | "Prise en charge"
  | "Traitements"
  | "Médicaments"
  | "Sources";

export type NabdaProtocolShiftGroup =
  | "Gravité"
  | "Premières étapes"
  | "Traitements"
  | "Outils liés"
  | "Sources";

export type ContentItemBlock = {
  className: string;
  start: number;
  end: number;
  depth: number;
  title: string;
};

export type ProtocolNormalizeInput = {
  id: string;
  title: string;
  body_html?: string;
  substance_ids?: string[];
  presentation_ids?: string[];
  calc_ids?: string[];
};

export type ProtocolNormalizeResult = {
  protocolSourceId: string;
  protocolSlug: string;
  protocolTitle: string;
  bodyChars: number;
  sections: NabdaProtocolSection[];
  warnings: string[];
  tabGroups: Record<NabdaProtocolMobileTab, string[]>;
  shiftGroups: Record<NabdaProtocolShiftGroup, string[]>;
};
