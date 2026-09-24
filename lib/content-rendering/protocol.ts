/**
 * Protocol rendering mappers. Source wording is preserved.
 * HTML is only rearranged for mobile display, never paraphrased.
 */

import {
  MOBILE_TAB_ORDER,
  SHIFT_GROUP_ORDER,
} from "@/lib/nabda-db/html/mobile-display-classifier";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import type {
  NabdaProtocolMobileTab,
  NabdaProtocolSection,
} from "@/types/nabda-protocol-sections";
import type {
  ProtocolRenderTable,
  ProtocolRenderChip,
  ProtocolRenderGroup,
  ProtocolRenderMode,
  ProtocolRenderSource,
} from "@/types/content-rendering-protocol";

const LONG_SECTION_CHARS = 1200;

export function sectionAnchorId(sectionId: string): string {
  return `section-${sectionId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function groupAnchorId(groupId: string): string {
  return `group-${groupId}`;
}

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Second-pass sanitizer for dry-run protocol HTML.
 * The normalizer already cleaned source HTML; this strips leftover executable bits
 * before dangerouslySetInnerHTML.
 */
export function sanitizePreviewHtml(
  html: string,
  keepInternalQuery = false,
  guidelinePreview: "protocol" | "cat" | "drug" | "calculator" = "protocol",
  linkMode: "public" | "internal" = "internal",
): string {
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<(iframe|object|embed|link|meta)\b[\s\S]*?<\/\1>/gi, "");
  out = out.replace(/<(iframe|object|embed|link|meta)\b[^>]*>/gi, "");
  out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/\shref\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, ' href="#"');
  out = out.replace(/\ssrc\s*=\s*(['"])\s*javascript:[\s\S]*?\1/gi, "");
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
    const alt = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const srcValue = src?.[2] ?? src?.[3] ?? "";
    const altValue = alt?.[2] ?? alt?.[3] ?? "Illustration";
    if (!srcValue || /^(media\/|nabda_db\/)/i.test(srcValue) || srcValue.startsWith("../")) {
      const safeAlt = altValue.replace(/</g, "");
      return `<p class="media-placeholder">${safeAlt} · média non monté dans cet aperçu</p>`;
    }
    return `<img src="${srcValue.replace(/"/g, "")}" alt="${altValue.replace(/"/g, "")}">`;
  });
  const suffix = keepInternalQuery ? "?preview=internal" : "";
  out = out.replace(
    /\shref\s*=\s*(['"])nabda:([^'"]+)\1/gi,
    (_match, quote: string, sourceId: string) => {
      const href = rewriteNabdaHref(sourceId, suffix, guidelinePreview, linkMode);
      return ` href=${quote}${href}${quote}`;
    },
  );
  return out;
}

export function rewriteNabdaHref(
  sourceId: string,
  previewSuffix = "",
  guidelinePreview: "protocol" | "cat" | "drug" | "calculator" = "protocol",
  linkMode: "public" | "internal" = "internal",
): string {
  const id = sourceId.trim();
  const slug = sourceIdToSlug(id);
  if (linkMode === "public") {
    if (id.startsWith("g.")) {
      return guidelinePreview === "cat" ? `/cat/${slug}` : `/protocols/${slug}`;
    }
    if (id.startsWith("calc.")) {
      return `/calculators/${slug}`;
    }
    return `/drugs/${slug}`;
  }
  if (id.startsWith("g.")) {
    const base =
      guidelinePreview === "cat"
        ? "/internal/cat-preview/"
        : "/internal/protocol-preview/";
    return `${base}${slug}${previewSuffix}`;
  }
  if (id.startsWith("calc.")) {
    if (guidelinePreview === "calculator") {
      return `/internal/calculator-preview/${slug}${previewSuffix}`;
    }
    return `/calculators/${slug}`;
  }
  if (guidelinePreview === "drug" && (id.startsWith("p.") || id.startsWith("s."))) {
    return `/internal/drug-preview/${slug}${previewSuffix}`;
  }
  return `/drugs/${slug}`;
}

export function extractHtmlTables(html: string): {
  tables: ProtocolRenderTable[];
  htmlWithoutTables: string;
} {
  const tables: ProtocolRenderTable[] = [];
  const htmlWithoutTables = html.replace(/<table\b[\s\S]*?<\/table>/gi, (tableHtml) => {
    const rows: string[][] = [];
    const rowMatches = tableHtml.match(/<tr\b[\s\S]*?<\/tr>/gi) ?? [];
    for (const rowHtml of rowMatches) {
      const cells = [...rowHtml.matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((cell) =>
        stripTags(cell[2] ?? ""),
      );
      if (cells.some((cell) => cell.length > 0)) {
        rows.push(cells);
      }
    }
    if (rows.length > 0) {
      const headerish = /<th\b/i.test(tableHtml);
      tables.push({
        headers: headerish ? rows[0] : rows[0].map((_, index) => `Colonne ${index + 1}`),
        rows: headerish ? rows.slice(1) : rows,
      });
    }
    return "";
  });
  return { tables, htmlWithoutTables };
}

export function extractLinkedChips(
  html: string,
  previewSuffix = "",
  guidelinePreview: "protocol" | "cat" | "drug" | "calculator" = "protocol",
  linkMode: "public" | "internal" = "internal",
): ProtocolRenderChip[] {
  const chips: ProtocolRenderChip[] = [];
  const seen = new Set<string>();
  const matches = html.matchAll(/<a\b[^>]*href=["']nabda:([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
  for (const match of matches) {
    const sourceId = match[1]?.trim();
    if (!sourceId || seen.has(sourceId)) {
      continue;
    }
    seen.add(sourceId);
    const kind: ProtocolRenderChip["kind"] = sourceId.startsWith("g.")
      ? "protocol"
      : sourceId.startsWith("calc.")
        ? "calculator"
        : "drug";
    chips.push({
      id: sourceId,
      label: stripTags(match[2] ?? sourceId) || sourceId,
      href: rewriteNabdaHref(sourceId, previewSuffix, guidelinePreview, linkMode),
      kind,
    });
  }
  return chips;
}

function sectionsById(sections: NabdaProtocolSection[]): Map<string, NabdaProtocolSection> {
  return new Map(sections.map((section) => [section.id, section]));
}

function resolveGroup(
  ids: string[],
  byId: Map<string, NabdaProtocolSection>,
): NabdaProtocolSection[] {
  return ids
    .map((id) => byId.get(id))
    .filter((section): section is NabdaProtocolSection => Boolean(section));
}

export function buildPreviewGroups(
  preview: ProtocolRenderSource,
  mode: ProtocolRenderMode,
): ProtocolRenderGroup[] {
  const byId = sectionsById(preview.sections);
  if (mode === "garde") {
    const groups: ProtocolRenderGroup[] = SHIFT_GROUP_ORDER.map((label) => ({
      id: slugifyGroup(label),
      label,
      sections: resolveGroup(preview.shiftGroups[label] ?? [], byId),
    })).filter((group) => group.sections.length > 0);

    const used = new Set(groups.flatMap((group) => group.sections.map((section) => section.id)));
    const leftover = preview.sections.filter((section) => !used.has(section.id));
    const background = leftover.filter(
      (section) =>
        section.kind === "disease_overview" ||
        section.kind === "advice" ||
        section.kind === "summary" ||
        section.priority === "background",
    );
    if (background.length > 0) {
      groups.push({
        id: "contexte",
        label: "Contexte",
        sections: background,
        collapsedByDefault: true,
      });
    }
    return groups;
  }

  return MOBILE_TAB_ORDER.map((label: NabdaProtocolMobileTab) => ({
    id: slugifyGroup(label),
    label,
    sections: resolveGroup(preview.tabGroups[label] ?? [], byId),
  })).filter((group) => group.sections.length > 0);
}

function slugifyGroup(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function heroSections(sections: NabdaProtocolSection[]): NabdaProtocolSection[] {
  return sections
    .filter((section) => section.display === "hero_summary")
    .sort((a, b) => a.order - b.order);
}

export function alertSections(sections: NabdaProtocolSection[]): NabdaProtocolSection[] {
  return sections
    .filter(
      (section) =>
        section.display === "alert_card" ||
        section.kind === "red_flags" ||
        (section.containsEmergencySignal && section.priority === "urgent"),
    )
    .sort((a, b) => a.order - b.order);
}

export function collectPreviewStats(sections: NabdaProtocolSection[]) {
  return {
    sectionCount: sections.length,
    longSectionCount: sections.filter((section) => section.text.length >= LONG_SECTION_CHARS).length,
    unresolvedHeadingCount: sections.filter((section) =>
      section.warnings.includes("unresolved_heading"),
    ).length,
    doseCount: sections.filter((section) => section.containsDose).length,
    emergencyCount: sections.filter((section) => section.containsEmergencySignal).length,
    tableCount: sections.filter((section) => section.containsTable).length,
    imageCount: sections.filter((section) => section.containsImage).length,
    imagemapCount: sections.filter((section) => section.containsImagemap).length,
  };
}
