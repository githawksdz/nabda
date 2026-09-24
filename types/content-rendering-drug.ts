import type { ContentRenderProvenance } from "@/types/content-rendering-core";
import type {
  NabdaDrugDetailTab,
  NabdaDrugSection,
  NabdaDrugSectionDisplay,
  NabdaDrugSectionKind,
  NabdaDrugSectionPriority,
} from "@/types/nabda-drug-sections";
import type {
  NabdaDrugTableCandidate,
  NabdaDrugTableDisplay,
} from "@/types/nabda-drug-tables";

export type DrugRenderTab = NabdaDrugDetailTab;

export type DrugRenderMode = "standard" | "pharmacien";

export type DrugRenderTabFilter =
  | "tout"
  | "critique"
  | "tableaux"
  | "long"
  | "renal"
  | "france"
  | "images";

export type DrugRenderWarning = {
  type: string;
  drugSourceId?: string;
  sourceKey?: string;
  title?: string;
  id?: string;
};

export type DrugRenderIndexItem = {
  title: string;
  slug: string;
  sourceId: string;
  sectionCount: number;
  tableCount: number;
  localeStatus: string | null;
  hasFrancePrescription: boolean;
  hasRenalHepatic: boolean;
  hasInteractions: boolean;
  hasNestedTables: boolean;
  hasImages: boolean;
  hasMissingKeys: boolean;
  hasDose: boolean;
};

export type DrugRenderSection = NabdaDrugSection & {
  textPreview?: string;
  htmlChars?: number;
  missingFullHtml?: boolean;
};

export type DrugRenderTable = NabdaDrugTableCandidate & {
  headers: string[];
  rows: string[][];
  safeTableHtml?: string;
  truncated?: boolean;
};

export type DrugRenderStats = {
  sectionCount: number;
  tableCount: number;
  nestedTableCount: number;
  hugeTableCount: number;
  brokenImageCount: number;
  francePrescriptionCount: number;
  renalHepaticPosologyCount: number;
  missingRcpKeyCount: number;
  displayStrategyCounts: Array<{ key: NabdaDrugTableDisplay | string; count: number }>;
  htmlOmitted: boolean;
};

export type DrugRenderSource = {
  slug: string;
  title: string;
  sourceId: string;
  localeStatus: string | null;
  htmlOmitted: boolean;
  missingFullHtml: boolean;
  protocolWarnings: string[];
  missingExpectedKeys: string[];
  skippedJunkKeys: string[];
  sections: DrugRenderSection[];
  tables: DrugRenderTable[];
  tabGroups: Record<DrugRenderTab, string[]>;
  warningItems: DrugRenderWarning[];
  stats: DrugRenderStats;
};

export type DrugRenderProvenance = ContentRenderProvenance;

export type DrugRenderData = DrugRenderSource & DrugRenderProvenance;

export type DrugSectionCandidate = {
  id: string;
  order: number;
  sourceKey?: string;
  sourceHeading: string;
  title: string;
  kind: NabdaDrugSectionKind;
  priority: NabdaDrugSectionPriority;
  display: NabdaDrugSectionDisplay;
  htmlChars?: number;
  textChars?: number;
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
  tableStats?: NabdaDrugSection["tableStats"];
  textPreview?: string;
  html?: string;
};

export type DrugSanitizeCandidate = {
  drugSourceId: string;
  drugSlug: string;
  localeStatus: string | null;
  warnings: string[];
  missingExpectedKeys: string[];
  skippedJunkKeys: string[];
  tabGroups: Record<DrugRenderTab, string[]>;
  sections: DrugSectionCandidate[];
};

export type DrugSectionCandidatesFile = {
  generated_at?: string;
  htmlOmitted?: boolean;
  drugs: DrugSanitizeCandidate[];
};

export type DrugTableCandidatesFile = {
  generated_at?: string;
  previewOnly?: boolean;
  tables: NabdaDrugTableCandidate[];
};

export type DrugWarningFile = {
  generated_at?: string;
  counts?: Array<{ key: string; count: number }>;
  items?: DrugRenderWarning[];
};
