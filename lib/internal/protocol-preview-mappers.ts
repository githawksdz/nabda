/**
 * Protocol preview mappers.
 * Public-safe grouping/sanitizer live in lib/content-rendering/protocol.
 */

export {
  alertSections,
  buildPreviewGroups,
  collectPreviewStats,
  extractHtmlTables,
  extractLinkedChips,
  groupAnchorId,
  heroSections,
  rewriteNabdaHref,
  sanitizePreviewHtml,
  sectionAnchorId,
  stripTags,
} from "@/lib/content-rendering/protocol";

import type { ProtocolRenderWarning } from "@/types/content-rendering-protocol";

export function featuredPreviewSlugs(): string[] {
  return ["asthme-aigu-grave", "abces-cutanes-furoncles-anthrax", "maladies-rares"];
}

export function warningLabel(item: ProtocolRenderWarning): string {
  if (item.heading) {
    return `${item.type} · ${item.heading}`;
  }
  return item.type;
}
