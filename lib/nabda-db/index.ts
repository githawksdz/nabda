export {
  IDENTITY_IMPORT_DEFAULTS,
  IMPORTED_FROM_NABDA_DB,
  identityImportDefaults,
  mapLocaleStatus,
  toDbLocalAdaptationStatus,
} from "@/lib/nabda-db/source-types";
export type {
  CalculatorIdentity,
  CalculatorRiskClassification,
  CatIdentity,
  ContentLinkIdentity,
  DrugIdentity,
  NabdaDbAtc,
  NabdaDbCalculator,
  NabdaDbGuideline,
  NabdaDbLink,
  NabdaDbMonograph,
  NabdaDbPresentation,
  NabdaDbProduct,
  NabdaDbSubstance,
  ProtocolIdentity,
} from "@/lib/nabda-db/source-types";

export { calculatorSlug, sourceIdToSlug } from "@/lib/nabda-db/slugs";

export {
  UNCATEGORIZED,
  isUncategorized,
  mapAtcCodeToCategory,
  mapGuidelineTaxonomy,
  mapSourceCategoryToNabdaCategory,
  mapSourceSpecialtyToNabdaCategory,
  mapSourceTagsToNabdaTags,
  mapSpecialtiesToCategoryAndTags,
} from "@/lib/nabda-db/taxonomy";

export {
  hasFlowchartImage,
  mapGuidelineToProtocolIdentity,
} from "@/lib/nabda-db/protocol-mapper";

export { mapCatIdentity, shouldMapGuidelineToCat } from "@/lib/nabda-db/cat-mapper";
export { extractCatSteps } from "@/lib/nabda-db/cat/cat-step-extractor";

export { mapDrugIdentity } from "@/lib/nabda-db/drug-mapper";
export type { DrugMapperInput } from "@/lib/nabda-db/drug-mapper";

export { mapCalculatorIdentity } from "@/lib/nabda-db/calculator-mapper";
export { analyzeCalculator } from "@/lib/nabda-db/calcs/calculator-analyzer";

export { mapContentLink, mapContentLinks } from "@/lib/nabda-db/link-mapper";

export { normalizeProtocolHtml } from "@/lib/nabda-db/html/protocol-normalizer";
export { cleanProtocolHtml } from "@/lib/nabda-db/html/html-cleaner";
export { sanitizeDrugMonograph, sanitizeDrugHtml } from "@/lib/nabda-db/html/drug-sanitizer";
export { classifySectionTables } from "@/lib/nabda-db/html/drug-table-accordion-classifier";
export { classifyProtocolSectionKind } from "@/lib/nabda-db/html/section-classifier";
export {
  classifyProtocolDisplay,
  classifyProtocolPriority,
} from "@/lib/nabda-db/html/mobile-display-classifier";

export { loadNabdaDbIdentities } from "@/lib/nabda-db/load-identities";
export type { LoadedIdentities } from "@/lib/nabda-db/load-identities";

export {
  IMPLEMENTED_CONTENT_CATEGORIES,
  buildImportPlan,
  compactImportPlan,
} from "@/lib/nabda-db/import-plan";
export type { ImportPlan, PlannedRow } from "@/lib/nabda-db/import-plan";
