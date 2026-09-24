/**
 * Sanitize nabda_db drug monograph HTML.
 * Strips DC banners, presentational markup, and Word junk. Does not rewrite wording.
 */

import { detectDose } from "@/lib/nabda-db/html/content-flags";
import {
  classifyDrugDisplay,
  classifyDrugPriority,
  drugTabForKind,
  DRUG_TAB_ORDER,
} from "@/lib/nabda-db/html/drug-mobile-display-classifier";
import {
  classifyDrugSectionKind,
  DRUG_SECTION_KEY_ORDER,
  EXPECTED_DRUG_KEYS,
  extractRcpBannerHeading,
  isWordJunkKey,
  titleForDrugKey,
} from "@/lib/nabda-db/html/drug-section-classifier";
import { analyzeDrugTables, tableDepth } from "@/lib/nabda-db/html/drug-table-normalizer";
import { htmlToPlainText } from "@/lib/nabda-db/html/html-cleaner";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import type {
  DrugSanitizeInput,
  DrugSanitizeResult,
  NabdaDrugDetailTab,
  NabdaDrugSection,
} from "@/types/nabda-drug-sections";

const EVENT_HANDLER_ATTR =
  /\s+on(?:mouseover|mouseout|mousemove|mouseenter|mouseleave|click|load|error|focus|blur)\s*=\s*("[\s\S]*?"|'[\s\S]*?')/gi;

const DRUG_DOSE_RE =
  /\b\d+([.,]\d+)?\s*(mg|µg|ug|mcg|g|ml|ui|meq)(\s*\/\s*kg)?\b|\b(mg\/kg|posologie|gouttes?|comprimés?|gélules?|gelules?|injection|perfusion|\d+\s*x\s*\/\s*j|\/jour|\/j)\b/i;

const RENAL_HEPATIC_RE =
  /insuffisance r[ée]nale|clairance|cr[ée]atinine|\bDFG\b|\brein\b|r[ée]nal|h[ée]patique|\bfoie\b/i;

const PREGNANCY_RE = /grossesse|enceinte|allaitement|lactation|femme enceinte/i;

const INTERACTION_RE =
  /interaction|association d[ée]conseill[ée]e|contre-indiqu[ée]e|pr[ée]caution d['’]emploi|\bINR\b|\bAVK\b|\bCYP\d/i;

const CONTRAINDICATION_RE = /contre[- ]indicat/i;

const FRANCE_PRESCRIPTION_RE =
  /s[ée]curit[ée] sociale|agr[éeé]e? aux collectivit[ée]s|liste I+\b|\bSMR\b|\bASMR\b|\bCPAM\b|\bALD\b|rembours/i;

const LONG_SECTION_CHARS = 20_000;

function unwrapFont(html: string): { html: string; removed: boolean } {
  const next = html.replace(/<\/?font\b[^>]*>/gi, "");
  return { html: next, removed: next !== html };
}

function stripHashedClasses(html: string): { html: string; removed: boolean } {
  const next = html.replace(/\sclass="style_[a-f0-9]+"/gi, "");
  return { html: next, removed: next !== html };
}

function stripInlineStyles(html: string): { html: string; removed: boolean } {
  const next = html.replace(/\sstyle\s*=\s*("[\s\S]*?"|'[\s\S]*?')/gi, "");
  return { html: next, removed: next !== html };
}

function stripPresentationalAttrs(html: string): string {
  return html.replace(
    /\s(?:bgcolor|face|color|size|border|cellpadding|cellspacing|width|height)\s*=\s*("[\s\S]*?"|'[\s\S]*?'|[^\s>]+)/gi,
    "",
  );
}

function stripWordJunkAnchors(html: string): { html: string; removed: boolean } {
  const next = html
    .replace(/<a\b[^>]*(?:name|id)\s*=\s*["']_?(?:hlk|ftn)[^"']*["'][^>]*>\s*<\/a>/gi, "")
    .replace(/<a\b[^>]*href\s*=\s*["']#_?(?:hlk|ftn|pub)[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");
  return { html: next, removed: next !== html };
}

function isDcBannerTable(tableHtml: string): boolean {
  const compact = tableHtml.replace(/\s+/g, " ");
  if (/début page|#pub/i.test(compact) && /<b>/i.test(compact)) {
    return true;
  }
  return /bgcolor\s*=\s*["']?#990000/i.test(compact) && /\bDC\b/.test(compact);
}

function stripDcBanners(html: string): { html: string; removed: boolean } {
  let depth = 0;
  let start = -1;
  let out = "";
  let cursor = 0;
  let removed = false;
  const re = /<\/?table\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const isClose = match[0].toLowerCase().startsWith("</");
    if (!isClose) {
      if (depth === 0) start = match.index;
      depth += 1;
    } else {
      depth = Math.max(0, depth - 1);
      if (depth === 0 && start >= 0) {
        const table = html.slice(start, match.index + match[0].length);
        if (isDcBannerTable(table)) {
          out += html.slice(cursor, start);
          cursor = match.index + match[0].length;
          removed = true;
        }
        start = -1;
      }
    }
  }
  out += html.slice(cursor);
  return { html: out, removed };
}

export function sanitizeDrugHtml(html: string): {
  html: string;
  warnings: string[];
  keptImageSrcs: string[];
} {
  const warnings: string[] = [];
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(EVENT_HANDLER_ATTR, "");
  out = out.replace(/\s+href\s*=\s*["']javascript:[^"']*["']/gi, ' href="#"');

  const banners = stripDcBanners(out);
  out = banners.html;
  if (banners.removed) warnings.push("dc_banner_removed");

  const fonts = unwrapFont(out);
  out = fonts.html;
  if (fonts.removed) warnings.push("font_tag_removed");

  const hashed = stripHashedClasses(out);
  out = hashed.html;
  if (hashed.removed) warnings.push("hashed_class_removed");

  const styles = stripInlineStyles(out);
  out = styles.html;
  if (styles.removed) warnings.push("inline_style_removed");

  out = stripPresentationalAttrs(out);

  const junk = stripWordJunkAnchors(out);
  out = junk.html;
  if (junk.removed) warnings.push("word_junk_removed");

  out = out.replace(/<span(?:\s[^>]*)?>\s*<\/span>/gi, "");
  while (/<span(?:\s[^>]*)?>([^<]*)<\/span>/i.test(out)) {
    out = out.replace(/<span(?:\s[^>]*)?>([^<]*)<\/span>/gi, "$1");
  }
  out = out.replace(/<br\s*\/?>\s*(?=<br|$)/gi, "");

  const keptImageSrcs: string[] = [];
  out = out.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
    const src = srcMatch?.[2] ?? srcMatch?.[3] ?? "";
    if (src) keptImageSrcs.push(src);
    const altMatch = tag.match(/\balt\s*=\s*("([^"]*)"|'([^']*)')/i);
    const alt = (altMatch?.[2] ?? altMatch?.[3] ?? "").replace(/"/g, "");
    return `<img src="${src.replace(/"/g, "")}" alt="${alt}">`;
  });

  return {
    html: out.replace(/\n{3,}/g, "\n\n").trim(),
    warnings: [...new Set(warnings)],
    keptImageSrcs,
  };
}

function emptyTabs(): DrugSanitizeResult["tabGroups"] {
  return {
    Aperçu: [],
    Posologie: [],
    Sécurité: [],
    Interactions: [],
    Formes: [],
    Sources: [],
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function detectFrancePrescription(
  sourceKey: string,
  locale: string | undefined,
  text: string,
): boolean {
  if (sourceKey === "prescription") return true;
  if (locale === "france_specific") return true;
  return FRANCE_PRESCRIPTION_RE.test(text);
}

export function sanitizeDrugMonograph(source: DrugSanitizeInput): DrugSanitizeResult {
  const drugSourceId = source.id;
  const drugSlug = sourceIdToSlug(source.id);
  const sectionsMap = source.sections ?? {};
  const warnings: string[] = [];
  const skippedJunkKeys: string[] = [];
  const keys = Object.keys(sectionsMap);
  const ordered = [
    ...DRUG_SECTION_KEY_ORDER.filter((key) => key in sectionsMap),
    ...keys.filter((key) => !DRUG_SECTION_KEY_ORDER.includes(key as (typeof DRUG_SECTION_KEY_ORDER)[number])),
  ];

  const sections: NabdaDrugSection[] = [];
  let order = 0;
  for (const sourceKey of ordered) {
    if (isWordJunkKey(sourceKey)) {
      skippedJunkKeys.push(sourceKey);
      warnings.push("word_junk_removed");
      continue;
    }
    const raw = sectionsMap[sourceKey] ?? "";
    if (!raw.trim()) {
      continue;
    }
    const cleaned = sanitizeDrugHtml(raw);
    const text = htmlToPlainText(cleaned.html);
    if (!text && !cleaned.keptImageSrcs.length) {
      continue;
    }
    const classified = classifyDrugSectionKind(sourceKey);
    const sourceHeading = extractRcpBannerHeading(raw) || titleForDrugKey(sourceKey, "");
    const locale = source.section_locale?.[sourceKey];
    const containsFranceSpecificPrescription = detectFrancePrescription(sourceKey, locale, text);
    const tableStats = analyzeDrugTables(cleaned.html, classified.kind);
    const containsTable = tableStats.tableCount > 0;
    const containsNestedTable = tableStats.hasNestedTables || tableDepth(cleaned.html) >= 2;
    const containsDose = detectDose(cleaned.html, text) || DRUG_DOSE_RE.test(text);
    const containsRenalHepatic = RENAL_HEPATIC_RE.test(text);
    const containsPregnancyLactation =
      classified.kind === "pregnancy_lactation" || PREGNANCY_RE.test(text);
    const containsInteraction = classified.kind === "interactions" || INTERACTION_RE.test(text);
    const containsContraindication =
      classified.kind === "contraindications" || CONTRAINDICATION_RE.test(text);
    const sectionWarnings = [...cleaned.warnings];
    if (classified.unresolved) sectionWarnings.push("unresolved_heading");
    if (containsFranceSpecificPrescription) sectionWarnings.push("france_specific_prescription");
    if (containsRenalHepatic && classified.kind === "posology") {
      sectionWarnings.push("renal_hepatic_inside_posology");
    }
    if (text.length >= LONG_SECTION_CHARS) sectionWarnings.push("section_too_long");
    if (tableStats.patterns.includes("nested_table") || containsNestedTable) {
      sectionWarnings.push("nested_table");
    }
    if (tableStats.patterns.includes("large_table") || tableStats.maxRows >= 20) {
      sectionWarnings.push("huge_table");
    }
    if (classified.kind === "posology") {
      sectionWarnings.push("posology_locked_until_pharmacist_review");
    }
    order += 1;
    const display = classifyDrugDisplay({
      kind: classified.kind,
      textLength: text.length,
      containsTable,
      containsNestedTable,
      containsRenalHepatic,
      containsFranceSpecificPrescription,
      recommendedTableDisplay: tableStats.recommendedDisplay,
    });
    sections.push({
      id: `${drugSourceId}:${sourceKey}`,
      drugSourceId,
      drugSlug,
      order,
      sourceKey,
      sourceHeading,
      title: titleForDrugKey(sourceKey, sourceHeading),
      kind: classified.kind,
      priority: classifyDrugPriority(classified.kind),
      display,
      html: cleaned.html,
      text,
      containsDose,
      containsContraindication,
      containsInteraction,
      containsPregnancyLactation,
      containsRenalHepatic,
      containsTable,
      containsNestedTable,
      containsImage: cleaned.keptImageSrcs.length > 0,
      containsFranceSpecificPrescription,
      rawHtmlPreserved: true,
      warnings: [...new Set(sectionWarnings)],
      tableStats,
    });
  }

  const sourcePath = typeof source.sources?.html === "string" ? source.sources.html : "";
  if (sourcePath) {
    order += 1;
    const html = `<p>${escapeHtml(sourcePath)}</p>`;
    sections.push({
      id: `${drugSourceId}:sources`,
      drugSourceId,
      drugSlug,
      order,
      sourceKey: "sources",
      sourceHeading: "Sources",
      title: "Sources",
      kind: "references",
      priority: classifyDrugPriority("references"),
      display: classifyDrugDisplay({
        kind: "references",
        textLength: sourcePath.length,
        containsTable: false,
        containsNestedTable: false,
        containsRenalHepatic: false,
        containsFranceSpecificPrescription: false,
      }),
      html,
      text: sourcePath,
      containsDose: false,
      containsContraindication: false,
      containsInteraction: false,
      containsPregnancyLactation: false,
      containsRenalHepatic: false,
      containsTable: false,
      containsNestedTable: false,
      containsImage: false,
      containsFranceSpecificPrescription: false,
      rawHtmlPreserved: true,
      warnings: [],
    });
  }

  const present = new Set(sections.map((section) => section.sourceKey));
  const missingExpectedKeys = EXPECTED_DRUG_KEYS.filter((key) => !present.has(key));
  if (missingExpectedKeys.length) {
    warnings.push("missing_expected_rcp_keys");
  }
  if (skippedJunkKeys.length) {
    warnings.push("word_junk_keys_skipped");
  }

  const tabGroups = emptyTabs();
  for (const section of sections) {
    const tab = drugTabForKind(section.kind);
    tabGroups[tab].push(section.id);
  }
  for (const tab of DRUG_TAB_ORDER) {
    tabGroups[tab as NabdaDrugDetailTab] = [...new Set(tabGroups[tab])];
  }

  return {
    drugSourceId,
    drugSlug,
    presentationId: source.presentation_id ?? source.id,
    localeStatus: source.locale_status ?? null,
    sections,
    missingExpectedKeys: [...missingExpectedKeys],
    skippedJunkKeys,
    warnings: [...new Set(warnings)],
    tabGroups,
  };
}
