/**
 * Server-only local drug monograph loader (internal preview / tooling).
 * Reads dry-run JSON + one monograph from disk. Does not query Supabase
 * or ship the 91k-section / 29k-table corpus to the client bundle.
 */

import fs from "node:fs";
import path from "node:path";
import { classifySectionTables } from "@/lib/nabda-db/html/drug-table-accordion-classifier";
import { sanitizeDrugMonograph } from "@/lib/nabda-db/html/drug-sanitizer";
import type { NabdaDbMonograph } from "@/lib/nabda-db/source-types";
import {
  collectDrugPreviewStats,
  fallbackSectionFromPreview,
  humanizeDrugSlug,
  prepareDrugSectionHtml,
  rebuildTabGroups,
  resolveDrugPreviewSlug,
  tablesFromSection,
} from "@/lib/content-rendering/drug";
import type {
  DrugRenderIndexItem,
  DrugRenderSource,
  DrugRenderSection,
  DrugRenderTable,
  DrugRenderWarning,
  DrugSanitizeCandidate,
  DrugSectionCandidatesFile,
  DrugTableCandidatesFile,
  DrugWarningFile,
} from "@/types/content-rendering-drug";
import type { NabdaDrugTableCandidate } from "@/types/nabda-drug-tables";

type PreviewCache = {
  htmlOmitted: boolean;
  bySlug: Map<string, DrugSanitizeCandidate>;
  index: DrugRenderIndexItem[];
  warningsBySource: Map<string, DrugRenderWarning[]>;
  tablesBySlug: Map<string, NabdaDrugTableCandidate[]> | null;
};

const ROOT = process.cwd();
const CANDIDATES_PATH = path.join(ROOT, "data", "drug-section-candidates.json");
const TABLE_CANDIDATES_PATH = path.join(ROOT, "data", "drug-table-candidates.json");
const SECTION_WARNINGS_PATH = path.join(ROOT, "data", "drug-sanitizer-warnings.json");
const TABLE_WARNINGS_PATH = path.join(ROOT, "data", "drug-table-accordion-warnings.json");

function monographsDir(): string {
  return [ROOT, "nabda_db", "drugs", "monographs"].join(path.sep);
}

function drugMediaDir(): string {
  return [ROOT, "nabda_db", "drugs", "media"].join(path.sep);
}

let cache: PreviewCache | null = null;

function warningSourceId(item: DrugRenderWarning): string | undefined {
  if (item.drugSourceId) return item.drugSourceId;
  const match = item.id?.match(/^(p\.[^:]+)/);
  return match?.[1];
}

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function loadCache(): PreviewCache {
  if (cache) {
    return cache;
  }
  const file = readJson<DrugSectionCandidatesFile>(CANDIDATES_PATH);
  const warningFile = readJson<DrugWarningFile>(SECTION_WARNINGS_PATH);
  const tableWarningFile = readJson<DrugWarningFile>(TABLE_WARNINGS_PATH);
  const bySlug = new Map<string, DrugSanitizeCandidate>();
  const index: DrugRenderIndexItem[] = [];
  const warningsBySource = new Map<string, DrugRenderWarning[]>();

  for (const item of [...(warningFile?.items ?? []), ...(tableWarningFile?.items ?? [])]) {
    const sourceId = warningSourceId(item);
    if (!sourceId) continue;
    const list = warningsBySource.get(sourceId) ?? [];
    list.push({ ...item, drugSourceId: sourceId });
    warningsBySource.set(sourceId, list);
  }

  for (const drug of file?.drugs ?? []) {
    bySlug.set(drug.drugSlug, drug);
    const tableCount = drug.sections.reduce(
      (sum, section) => sum + (section.tableStats?.tableCount ?? 0),
      0,
    );
    index.push({
      title: humanizeDrugSlug(drug.drugSlug),
      slug: drug.drugSlug,
      sourceId: drug.drugSourceId,
      sectionCount: drug.sections.length,
      tableCount,
      localeStatus: drug.localeStatus,
      hasFrancePrescription: drug.sections.some(
        (section) => section.containsFranceSpecificPrescription,
      ),
      hasRenalHepatic: drug.sections.some((section) => section.containsRenalHepatic),
      hasInteractions: drug.sections.some(
        (section) => section.kind === "interactions" || section.containsInteraction,
      ),
      hasNestedTables: drug.sections.some((section) => section.containsNestedTable),
      hasImages: drug.sections.some((section) => section.containsImage),
      hasMissingKeys: drug.missingExpectedKeys.length > 0,
      hasDose: drug.sections.some((section) => section.containsDose),
    });
  }

  index.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  cache = {
    htmlOmitted: file?.htmlOmitted !== false,
    bySlug,
    index,
    warningsBySource,
    tablesBySlug: null,
  };
  return cache;
}

function loadTablesBySlug(): Map<string, NabdaDrugTableCandidate[]> {
  const loaded = loadCache();
  if (loaded.tablesBySlug) {
    return loaded.tablesBySlug;
  }
  const file = readJson<DrugTableCandidatesFile>(TABLE_CANDIDATES_PATH);
  const map = new Map<string, NabdaDrugTableCandidate[]>();
  for (const table of file?.tables ?? []) {
    const list = map.get(table.drugSlug) ?? [];
    list.push(table);
    map.set(table.drugSlug, list);
  }
  loaded.tablesBySlug = map;
  return map;
}

function loadMonograph(sourceId: string): NabdaDbMonograph | null {
  const filename = `${sourceId}.json`;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  const absolute = [monographsDir(), filename].join(path.sep);
  const relative = path.relative(monographsDir(), absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(absolute)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8")) as NabdaDbMonograph;
}

export function getDrugPreviewIndex(): DrugRenderIndexItem[] {
  return loadCache().index;
}

export function isAllowedDrugPreviewMedia(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  if (!/^[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(filename)) {
    return false;
  }
  const absolute = [drugMediaDir(), filename].join(path.sep);
  const relative = path.relative(drugMediaDir(), absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return false;
  }
  return fs.existsSync(absolute);
}

export function resolveDrugPreviewMediaPath(filename: string): string | null {
  if (!isAllowedDrugPreviewMedia(filename)) {
    return null;
  }
  return [drugMediaDir(), filename].join(path.sep);
}

export function getDrugPreviewBySlug(
  slug: string,
  keepInternalQuery = false,
  linkMode: "public" | "internal" = "internal",
): DrugRenderSource | null {
  const loaded = loadCache();
  const resolved = resolveDrugPreviewSlug(slug);
  const candidate = loaded.bySlug.get(resolved);
  if (!candidate) {
    return null;
  }

  const monograph = loadMonograph(candidate.drugSourceId);
  let sections: DrugRenderSection[];
  let tables: DrugRenderTable[] = [];
  const missingFullHtml = !monograph;
  const protocolWarnings = [...candidate.warnings];

  if (monograph) {
    const sanitized = sanitizeDrugMonograph(monograph);
    sections = sanitized.sections.map((section) => ({
      ...section,
      html: prepareDrugSectionHtml(section.html, keepInternalQuery, linkMode),
      missingFullHtml: false,
    }));
    tables = sanitized.sections.flatMap((section) =>
      tablesFromSection(section, classifySectionTables(section), keepInternalQuery, linkMode),
    );
    for (const warning of sanitized.warnings) {
      if (!protocolWarnings.includes(warning)) protocolWarnings.push(warning);
    }
  } else {
    protocolWarnings.push("full_html_omitted");
    sections = candidate.sections.map((section) =>
      fallbackSectionFromPreview(section, candidate.drugSourceId, candidate.drugSlug),
    );
    const fallbackTables = loadTablesBySlug().get(candidate.drugSlug) ?? [];
    tables = fallbackTables.map((table) => ({
      ...table,
      headers: table.headerTexts,
      rows: table.cellPreview.slice(table.headerTexts.length ? 1 : 0),
      truncated: table.rowCount > (table.cellPreview.length || 0),
    }));
  }

  if (loaded.htmlOmitted && missingFullHtml) {
    protocolWarnings.push("preview_json_html_omitted");
  }

  return {
    slug: candidate.drugSlug,
    title: humanizeDrugSlug(candidate.drugSlug),
    sourceId: candidate.drugSourceId,
    localeStatus: candidate.localeStatus,
    htmlOmitted: loaded.htmlOmitted,
    missingFullHtml,
    protocolWarnings: [...new Set(protocolWarnings)],
    missingExpectedKeys: candidate.missingExpectedKeys,
    skippedJunkKeys: candidate.skippedJunkKeys,
    sections,
    tables,
    tabGroups: rebuildTabGroups(sections),
    warningItems: loaded.warningsBySource.get(candidate.drugSourceId) ?? [],
    stats: collectDrugPreviewStats(
      sections,
      tables,
      candidate.missingExpectedKeys,
      loaded.htmlOmitted,
    ),
  };
}
