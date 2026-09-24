/**
 * Drug preview mappers.
 * Public-safe tab/table grouping lives in lib/content-rendering/drug.
 */

export {
  DRUG_PHARMACIST_TAB_ORDER,
  DRUG_PREVIEW_TAB_ORDER,
  DRUG_SLUG_ALIASES,
  DRUG_TAB_FILTERS,
  collectDrugPreviewStats,
  drugSectionAnchorId,
  fallbackSectionFromPreview,
  frequencyChip,
  groupAdverseEffectRows,
  groupInteractionRows,
  humanizeDrugSlug,
  prepareDrugSectionHtml,
  previewTabForSection,
  rebuildTabGroups,
  resolveDrugPreviewSlug,
  rewriteDrugMediaSrcs,
  sectionMatchesFilter,
  tablesFromSection,
  tabOrderForMode,
} from "@/lib/content-rendering/drug";

export function featuredDrugPreviewSlugs(): string[] {
  return [
    "amoxicilline-1000mg-orale-dispersible",
    "paracetamol-500mg-orale-comprime",
    "warfarine-2mg-orale-comprime",
    "ibuprofene-200mg-orale-comprime",
    "amiodarone-150mg-voie-parenterale-injectable",
  ];
}

export function drugWarningLabel(item: {
  type: string;
  sourceKey?: string;
  title?: string;
}): string {
  if (item.title) return `${item.type} · ${item.title}`;
  if (item.sourceKey) return `${item.type} · ${item.sourceKey}`;
  return item.type;
}
