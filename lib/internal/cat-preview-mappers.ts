/**
 * CAT preview mappers.
 * Public-safe grouping/labels live in lib/content-rendering/cat.
 */

export {
  CAT_STICKY_CHIPS,
  ETAPES_PREVIEW_GROUP_ORDER,
  SHIFT_PREVIEW_GROUP_ORDER,
  buildCatPreviewGroups,
  catGroupAnchorId,
  catImageAnchorId,
  collectCatLinkedTools,
  collectCatPreviewStats,
  etapesGroupForStep,
  extractionStatusCopy,
  flowchartFilename,
  mapFlowchartImages,
  priorityLabel,
  shiftGroupForStep,
  slugifyCatGroup,
} from "@/lib/content-rendering/cat";

export function featuredCatPreviewSlugs(): string[] {
  return [
    "abces-cutanes-furoncles-anthrax",
    "asthme-aigu-grave",
    "cancers-complications-des-chimiotherapies",
  ];
}

export function catWarningLabel(item: {
  type: string;
  title?: string;
  stepId?: string;
}): string {
  if (item.title) {
    return `${item.type} · ${item.title}`;
  }
  if (item.stepId) {
    return `${item.type} · ${item.stepId}`;
  }
  return item.type;
}
