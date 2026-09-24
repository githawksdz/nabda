/**
 * Drug rendering mappers. Source wording is preserved.
 * Sections and tables are only regrouped for mobile display — never paraphrased,
 * never converted into dose or interaction rules.
 */

import { parseTopLevelRows } from "@/lib/nabda-db/html/drug-table-shape-analyzer";
import { splitTables } from "@/lib/nabda-db/html/drug-table-normalizer";
import { drugTabForKind, DRUG_TAB_ORDER } from "@/lib/nabda-db/html/drug-mobile-display-classifier";
import { htmlToPlainText } from "@/lib/nabda-db/html/html-cleaner";
import { sanitizePreviewHtml } from "@/lib/content-rendering/protocol";
import { drugSourceMediaHref } from "@/lib/content-rendering/render-state";
import type { NabdaDrugDetailTab, NabdaDrugSection } from "@/types/nabda-drug-sections";
import type { NabdaDrugTableCandidate } from "@/types/nabda-drug-tables";
import type {
  DrugRenderMode,
  DrugRenderSection,
  DrugRenderStats,
  DrugRenderTabFilter,
  DrugRenderTable,
} from "@/types/content-rendering-drug";

export const DRUG_PREVIEW_TAB_ORDER: NabdaDrugDetailTab[] = DRUG_TAB_ORDER;

export const DRUG_PHARMACIST_TAB_ORDER: NabdaDrugDetailTab[] = [
  "Sécurité",
  "Interactions",
  "Posologie",
  "Formes",
  "Sources",
  "Aperçu",
];

export const DRUG_TAB_FILTERS: Array<{ id: DrugRenderTabFilter; label: string }> = [
  { id: "tout", label: "Tout" },
  { id: "critique", label: "Critique" },
  { id: "tableaux", label: "Tableaux" },
  { id: "long", label: "Long" },
  { id: "renal", label: "Rénal/Hépatique" },
  { id: "france", label: "France" },
  { id: "images", label: "Images" },
];

const MAX_TABLE_ROWS = 200;
const LONG_SECTION_CHARS = 2500;

const INTERACTION_BUCKETS = [
  { id: "contre-indiquee", label: "Contre-indiquée", test: /contre[- ]indiqu/i },
  { id: "deconseillee", label: "Déconseillée", test: /d[ée]conseill/i },
  { id: "precaution", label: "Précaution d'emploi", test: /pr[ée]caution/i },
  { id: "prendre-en-compte", label: "À prendre en compte", test: /prendre en compte/i },
] as const;

const FREQUENCY_RE =
  /tr[eè]s fr[eé]quent|fr[eé]quent|peu fr[eé]quent|tr[eè]s rare|\brare\b|ind[eé]termin[eé]e?|\binconnu(?:e)?\b/i;

export const DRUG_SLUG_ALIASES: Record<string, string> = {
  "amoxicilline-1000-mg": "amoxicilline-1000mg-orale-dispersible",
  "paracetamol-500-mg": "paracetamol-500mg-orale-comprime",
  "warfarine-2-mg": "warfarine-2mg-orale-comprime",
  "ibuprofene-200-mg": "ibuprofene-200mg-orale-comprime",
  "amiodarone-iv": "amiodarone-150mg-voie-parenterale-injectable",
};

export function resolveDrugPreviewSlug(slug: string): string {
  return DRUG_SLUG_ALIASES[slug] ?? slug;
}

export function humanizeDrugSlug(slug: string): string {
  const cleaned = slug.replace(/-/g, " ").replace(/(\d+)\s*mg/gi, "$1 mg");
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function drugSectionAnchorId(sectionId: string): string {
  return `drug-section-${sectionId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export function tabOrderForMode(mode: DrugRenderMode): NabdaDrugDetailTab[] {
  return mode === "pharmacien" ? DRUG_PHARMACIST_TAB_ORDER : DRUG_PREVIEW_TAB_ORDER;
}

export function previewTabForSection(section: DrugRenderSection): NabdaDrugDetailTab {
  if (section.containsFranceSpecificPrescription || section.kind === "prescription_status") {
    return "Sources";
  }
  return drugTabForKind(section.kind);
}

export function rebuildTabGroups(
  sections: DrugRenderSection[],
): Record<NabdaDrugDetailTab, string[]> {
  const groups: Record<NabdaDrugDetailTab, string[]> = {
    Aperçu: [],
    Posologie: [],
    Sécurité: [],
    Interactions: [],
    Formes: [],
    Sources: [],
  };
  for (const section of sections) {
    groups[previewTabForSection(section)].push(section.id);
  }
  return groups;
}

export function sectionMatchesFilter(
  section: DrugRenderSection,
  filter: DrugRenderTabFilter,
): boolean {
  if (filter === "tout") return true;
  if (filter === "critique") return section.priority === "critical";
  if (filter === "tableaux") return section.containsTable;
  if (filter === "long") {
    return (
      section.warnings.includes("section_too_long") ||
      section.text.length >= LONG_SECTION_CHARS ||
      (section.htmlChars ?? section.html.length) >= 8000
    );
  }
  if (filter === "renal") return section.containsRenalHepatic;
  if (filter === "france") return section.containsFranceSpecificPrescription;
  if (filter === "images") return section.containsImage;
  return true;
}

export function rewriteDrugMediaSrcs(
  html: string,
  keepInternalQuery: boolean,
  linkMode: "public" | "internal" = "internal",
): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
    const src = srcMatch?.[2] ?? srcMatch?.[3] ?? "";
    const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const alt = (altMatch?.[2] ?? altMatch?.[3] ?? "Illustration").replace(/"/g, "");
    if (!src || src.startsWith("/internal/") || src.startsWith("/content-media/") || /^(https?:)/i.test(src)) {
      return tag;
    }
    if (/^(media\/|nabda_db\/)/i.test(src) || src.startsWith("../")) {
      const filename = src.replace(/\\/g, "/").split("/").pop() ?? "";
      if (!filename) {
        return tag;
      }
      const href = drugSourceMediaHref(filename, linkMode === "public", keepInternalQuery);
      return `<img src="${href}" alt="${alt}">`;
    }
    return tag;
  });
}

export function prepareDrugSectionHtml(
  html: string,
  keepInternalQuery: boolean,
  linkMode: "public" | "internal" = "internal",
): string {
  const withMedia = rewriteDrugMediaSrcs(html, keepInternalQuery, linkMode);
  return sanitizePreviewHtml(withMedia, keepInternalQuery, "drug", linkMode);
}

function gridFromTableHtml(tableHtml: string): { headers: string[]; rows: string[][] } {
  const parsed = parseTopLevelRows(tableHtml);
  if (parsed.length === 0) {
    return { headers: [], rows: [] };
  }
  const firstIsHeader = parsed[0].some((cell) => cell.tag === "th");
  const headers = firstIsHeader
    ? parsed[0].map((cell) => cell.text)
    : parsed[0].map((_, index) => `Colonne ${index + 1}`);
  const body = firstIsHeader ? parsed.slice(1) : parsed;
  const rows = body.map((row) => row.map((cell) => cell.text));
  return { headers, rows };
}

export function tablesFromSection(
  section: NabdaDrugSection,
  classified: NabdaDrugTableCandidate[],
  keepInternalQuery: boolean,
  linkMode: "public" | "internal" = "internal",
): DrugRenderTable[] {
  const htmlTables = splitTables(section.html);
  return classified.map((candidate, index) => {
    const tableHtml = htmlTables[candidate.tableIndex] ?? htmlTables[index] ?? "";
    const grid = tableHtml
      ? gridFromTableHtml(tableHtml)
      : {
          headers: candidate.headerTexts,
          rows: candidate.cellPreview.slice(
            candidate.headerTexts.length ? 1 : 0,
          ),
        };
    const truncated = grid.rows.length > MAX_TABLE_ROWS;
    const needsHtml =
      candidate.display === "long_read_table" ||
      candidate.nestedDepth >= 2 ||
      candidate.display === "horizontal_scroll_table";
    return {
      ...candidate,
      headers: grid.headers,
      rows: truncated ? grid.rows.slice(0, MAX_TABLE_ROWS) : grid.rows,
      truncated,
      safeTableHtml: needsHtml && tableHtml
        ? prepareDrugSectionHtml(tableHtml, keepInternalQuery, linkMode)
        : undefined,
    };
  });
}

export function collectDrugPreviewStats(
  sections: DrugRenderSection[],
  tables: DrugRenderTable[],
  missingExpectedKeys: string[],
  htmlOmitted: boolean,
): DrugRenderStats {
  const strategy = new Map<string, number>();
  for (const table of tables) {
    strategy.set(table.display, (strategy.get(table.display) ?? 0) + 1);
  }
  return {
    sectionCount: sections.length,
    tableCount: tables.length,
    nestedTableCount: tables.filter((table) => table.nestedDepth >= 2).length,
    hugeTableCount: tables.filter(
      (table) => table.rowCount >= 20 || table.warnings.includes("large_table"),
    ).length,
    brokenImageCount: sections.filter((section) =>
      section.warnings.includes("broken_image"),
    ).length,
    francePrescriptionCount: sections.filter(
      (section) => section.containsFranceSpecificPrescription,
    ).length,
    renalHepaticPosologyCount: sections.filter(
      (section) =>
        section.kind === "posology" && section.containsRenalHepatic,
    ).length,
    missingRcpKeyCount: missingExpectedKeys.length,
    displayStrategyCounts: [...strategy.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count),
    htmlOmitted,
  };
}

export function frequencyChip(text: string): string | null {
  const match = text.match(FREQUENCY_RE);
  return match?.[0] ?? null;
}

export function groupAdverseEffectRows(table: DrugRenderTable): Array<{
  title: string;
  frequency?: string | null;
  rows: string[][];
}> {
  const groups = new Map<string, { frequency: string | null; rows: string[][] }>();
  for (const row of table.rows) {
    const label = row[0]?.trim() || "Autres";
    const blob = row.join(" ");
    const frequency = frequencyChip(blob);
    const current = groups.get(label) ?? { frequency, rows: [] };
    current.rows.push(row);
    if (!current.frequency && frequency) current.frequency = frequency;
    groups.set(label, current);
  }
  return [...groups.entries()].map(([title, value]) => ({
    title,
    frequency: value.frequency,
    rows: value.rows,
  }));
}

export function groupInteractionRows(table: DrugRenderTable): Array<{
  id: string;
  label: string;
  rows: string[][];
}> {
  const buckets = INTERACTION_BUCKETS.map((bucket) => ({
    id: bucket.id,
    label: bucket.label,
    rows: [] as string[][],
  }));
  const other: string[][] = [];
  for (const row of table.rows) {
    const blob = row.join(" ");
    const hit = INTERACTION_BUCKETS.findIndex((bucket) => bucket.test.test(blob));
    if (hit >= 0) {
      buckets[hit].rows.push(row);
    } else {
      other.push(row);
    }
  }
  const result: Array<{ id: string; label: string; rows: string[][] }> = buckets.filter(
    (bucket) => bucket.rows.length > 0,
  );
  if (other.length > 0) {
    result.push({ id: "autre", label: "Autre", rows: other });
  }
  return result;
}

export function fallbackSectionFromPreview(
  section: {
    id: string;
    drugSourceId?: string;
    drugSlug?: string;
    order: number;
    sourceKey?: string;
    sourceHeading: string;
    title: string;
    kind: NabdaDrugSection["kind"];
    priority: NabdaDrugSection["priority"];
    display: NabdaDrugSection["display"];
    textPreview?: string;
    html?: string;
    htmlChars?: number;
    containsDose: boolean;
    containsContraindication: boolean;
    containsInteraction: boolean;
    containsPregnancyLactation: boolean;
    containsRenalHepatic: boolean;
    containsTable: boolean;
    containsNestedTable: boolean;
    containsImage: boolean;
    containsFranceSpecificPrescription: boolean;
    warnings: string[];
    tableStats?: NabdaDrugSection["tableStats"];
  },
  sourceId: string,
  slug: string,
): DrugRenderSection {
  const text = section.textPreview ?? htmlToPlainText(section.html ?? "");
  const missing = !section.html;
  return {
    id: section.id,
    drugSourceId: sourceId,
    drugSlug: slug,
    order: section.order,
    sourceKey: section.sourceKey,
    sourceHeading: section.sourceHeading,
    title: section.title,
    kind: section.kind,
    priority: section.priority,
    display: section.display,
    html: section.html ?? "",
    text,
    textPreview: section.textPreview,
    htmlChars: section.htmlChars,
    missingFullHtml: missing,
    containsDose: section.containsDose,
    containsContraindication: section.containsContraindication,
    containsInteraction: section.containsInteraction,
    containsPregnancyLactation: section.containsPregnancyLactation,
    containsRenalHepatic: section.containsRenalHepatic,
    containsTable: section.containsTable,
    containsNestedTable: section.containsNestedTable,
    containsImage: section.containsImage,
    containsFranceSpecificPrescription: section.containsFranceSpecificPrescription,
    rawHtmlPreserved: true,
    warnings: missing
      ? [...new Set([...section.warnings, "full_html_omitted"])]
      : section.warnings,
    tableStats: section.tableStats,
  };
}
