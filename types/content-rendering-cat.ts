import type { ContentRenderProvenance } from "@/types/content-rendering-core";
import type {
  CatStepExtractResult,
  NabdaCatStep,
} from "@/types/nabda-cat-steps";

export type CatRenderStep = NabdaCatStep;

export type CatRenderMode = "etapes" | "garde" | "image";

export type CatRenderEtapesGroup =
  | "Entrée"
  | "Gravité"
  | "Diagnostic"
  | "Examens"
  | "Prise en charge"
  | "Traitements"
  | "Surveillance"
  | "Orientation"
  | "Outils"
  | "Sources";

export type CatRenderShiftGroup =
  | "Urgent maintenant"
  | "À vérifier"
  | "À faire"
  | "À surveiller"
  | "Liens utiles"
  | "Contexte";

export type CatRenderWarning = {
  type: string;
  protocolSourceId: string;
  stepId?: string;
  title?: string;
};

export type CatRenderIndexItem = {
  title: string;
  slug: string;
  sourceId: string;
  stepCount: number;
  warningCount: number;
  hasStaticPng: boolean;
  pngFileAvailable: boolean;
  hasImagemapStripped: boolean;
  hasEmergency: boolean;
  hasDose: boolean;
  hasCalculator: boolean;
};

export type CatRenderMedia = {
  sourcePath: string;
  filename: string;
  href: string;
  available: boolean;
};

export type CatRenderChip = {
  id: string;
  label: string;
  href: string;
  kind: "drug" | "protocol" | "calculator" | "cat";
};

export type CatRenderGroup = {
  id: string;
  label: string;
  steps: CatRenderStep[];
  collapsedByDefault?: boolean;
};

export type CatRenderStats = {
  stepCount: number;
  doseCount: number;
  emergencyCount: number;
  calculatorCount: number;
  drugCount: number;
  tableCount: number;
  unresolvedTitleCount: number;
  samu15Count: number;
  tooManySteps: boolean;
  skippedSectionCount: number;
  skippedSectionTitles: string[];
  pngAvailableCount: number;
  pngMissingCount: number;
  imagemapStripped: boolean;
  hasInteractiveGraph: false;
};

export type CatRenderSource = {
  slug: string;
  title: string;
  sourceId: string;
  extractionMode: CatStepExtractResult["extractionMode"];
  hasStaticFlowchartImage: boolean;
  hasExtractedLinearSteps: boolean;
  hasInteractiveGraph: false;
  imagemapStripped: boolean;
  protocolWarnings: string[];
  steps: CatRenderStep[];
  images: CatRenderMedia[];
  warningItems: CatRenderWarning[];
  linkedTools: CatRenderChip[];
  stats: CatRenderStats;
};

export type CatRenderProvenance = ContentRenderProvenance;

export type CatRenderData = CatRenderSource & CatRenderProvenance;

export type CatStepCandidatesFile = {
  generated_at?: string;
  hasInteractiveGraph?: false;
  protocols: CatStepExtractResult[];
};

export type CatWarningFile = {
  generated_at?: string;
  counts?: Array<{ key: string; count: number }>;
  items?: CatRenderWarning[];
};

export type CatRenderChipId = "tout" | "image" | string;
