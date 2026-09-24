/**
 * Linear CAT step candidates.
 * Dry-run only. Not a decision graph. Do not mount `html` in React.
 */

export type NabdaCatStepKind =
  | "entry"
  | "severity_check"
  | "red_flag"
  | "diagnostic_check"
  | "workup"
  | "management"
  | "treatment"
  | "monitoring"
  | "orientation"
  | "special_population"
  | "medication"
  | "calculator"
  | "source"
  | "other";

export type NabdaCatStepPriority = "critical" | "urgent" | "normal" | "background";

export type NabdaCatStepDisplay =
  | "step_card"
  | "alert_step"
  | "checklist_step"
  | "linked_tool_step"
  | "treatment_step"
  | "monitoring_step"
  | "source_step";

export type NabdaCatStep = {
  id: string;
  protocolSourceId: string;
  protocolSlug: string;
  sourceSectionId?: string;
  order: number;
  sourceOrder?: number;
  title: string;
  text: string;
  html: string;
  kind: NabdaCatStepKind;
  priority: NabdaCatStepPriority;
  display: NabdaCatStepDisplay;
  sourceSelector?: string;
  sourceHeading?: string;
  containsDose: boolean;
  containsDrugMention: boolean;
  containsCalculatorMention: boolean;
  containsEmergencySignal: boolean;
  containsTable: boolean;
  containsImage: boolean;
  linkedSourceIds?: string[];
  rawHtmlPreserved: true;
  warnings: string[];
};

export type NabdaCatEtapesGroup =
  | "Gravité"
  | "Diagnostic"
  | "Premières actions"
  | "Traitements"
  | "Surveillance"
  | "Orientation"
  | "Outils liés"
  | "Sources";

export type NabdaCatShiftGroup =
  | "Urgent maintenant"
  | "À vérifier"
  | "À faire"
  | "À surveiller"
  | "Liens utiles";

export type CatStepExtractInput = {
  id: string;
  title: string;
  body_html?: string;
  substance_ids?: string[];
  presentation_ids?: string[];
  calc_ids?: string[];
};

export type CatStepExtractResult = {
  protocolSourceId: string;
  protocolSlug: string;
  protocolTitle: string;
  hasStaticFlowchartImage: boolean;
  hasExtractedLinearSteps: boolean;
  hasInteractiveGraph: false;
  flowchartImages: string[];
  imagemapStripped: boolean;
  extractionMode: "itemcom" | "ordered_list" | "none";
  steps: NabdaCatStep[];
  warnings: string[];
  tabGroups: Record<NabdaCatEtapesGroup, string[]>;
  shiftGroups: Record<NabdaCatShiftGroup, string[]>;
};
