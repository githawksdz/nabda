import type { ContentRenderProvenance } from "@/types/content-rendering-core";
import type {
  NabdaProtocolMobileTab,
  NabdaProtocolSection,
  NabdaProtocolShiftGroup,
  ProtocolNormalizeResult,
} from "@/types/nabda-protocol-sections";

export type ProtocolRenderSection = NabdaProtocolSection;

export type ProtocolRenderMode = "lecture" | "garde";

export type ProtocolRenderWarning = {
  type: string;
  protocolSourceId: string;
  sectionId?: string;
  heading?: string;
  kind?: string;
  textChars?: number;
};

export type ProtocolRenderIndexItem = {
  slug: string;
  title: string;
  sourceId: string;
  sectionCount: number;
  warningCount: number;
  hasDose: boolean;
  hasEmergency: boolean;
  hasTable: boolean;
  hasImage: boolean;
  hasImagemap: boolean;
  tooLong: boolean;
};

export type ProtocolRenderGroup = {
  id: string;
  label: string;
  sections: ProtocolRenderSection[];
  collapsedByDefault?: boolean;
};

export type ProtocolRenderStats = {
  sectionCount: number;
  longSectionCount: number;
  unresolvedHeadingCount: number;
  doseCount: number;
  emergencyCount: number;
  tableCount: number;
  imageCount: number;
  imagemapCount: number;
};

export type ProtocolRenderSource = {
  slug: string;
  title: string;
  sourceId: string;
  bodyChars: number;
  protocolWarnings: string[];
  sections: ProtocolRenderSection[];
  tabGroups: Record<NabdaProtocolMobileTab, string[]>;
  shiftGroups: Record<NabdaProtocolShiftGroup, string[]>;
  warningItems: ProtocolRenderWarning[];
  stats: ProtocolRenderStats;
};

export type ProtocolRenderProvenance = ContentRenderProvenance;

export type ProtocolRenderData = ProtocolRenderSource & ProtocolRenderProvenance;

export type ProtocolRenderTable = {
  caption?: string;
  headers: string[];
  rows: string[][];
};

export type ProtocolRenderChip = {
  id: string;
  label: string;
  href: string;
  kind: "drug" | "protocol" | "calculator";
};

export type ProtocolNormalizeFile = {
  generated_at?: string;
  protocols: ProtocolNormalizeResult[];
};

export type ProtocolWarningFile = {
  generated_at?: string;
  counts?: Array<{ key: string; count: number }>;
  items?: ProtocolRenderWarning[];
};
