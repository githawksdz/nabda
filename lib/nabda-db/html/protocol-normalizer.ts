/**
 * Split protocol body_html into NabdaProtocolSection candidates.
 * Preserves medical wording. Does not import or render.
 */

import {
  cleanProtocolHtml,
  extractFirstTitle,
  extractLibreTitle,
  extractLinkedSourceIds,
  findContentItemBlocks,
  findDivRanges,
  htmlToPlainText,
} from "@/lib/nabda-db/html/html-cleaner";
import {
  classifyProtocolDisplay,
  classifyProtocolPriority,
  mobileTabForKind,
  shiftGroupForKind,
  SHIFT_GROUP_ORDER,
  MOBILE_TAB_ORDER,
} from "@/lib/nabda-db/html/mobile-display-classifier";
import {
  classifyProtocolSectionKind,
  isNestedChipClass,
  isPromotedSectionClass,
} from "@/lib/nabda-db/html/section-classifier";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import type {
  NabdaProtocolSection,
  ProtocolNormalizeInput,
  ProtocolNormalizeResult,
} from "@/types/nabda-protocol-sections";

const MIN_SECTION_CHARS = 40;
const TOO_MANY_SECTIONS = 18;
const LONG_SECTION_CHARS = 12_000;
const LONG_PROTOCOL_CHARS = 120_000;

const DOSE_RE =
  /\b\d+([.,]\d+)?\s*(mg|µg|ug|mcg|g|ml|ui|meq)(\s*\/\s*kg)?\b|\b(mg\/kg|posologie|gouttes?|comprimés?|injection|perfusion|\d+\s*x\s*\/\s*j|\/jour|\/j)\b/i;

const EMERGENCY_RE =
  /\b(samu|appeler le 15|\(15\)|en urgence|aux urgences|urgence vitale|détresse|detresse|état de choc|etat de choc|choc anaphylactique|instabilité hémodynamique|instabilite hemodynamique|coma|convulsion|douleur thoracique|dyspnée aiguë|dyspnee aigue|signes? de gravité|signes? de gravite)\b/i;

const CALCULATOR_RE =
  /\b(calculateur|score de|score d'|glasgow|cockcroft|wells|cha2ds2|qsofa|imc|clairance de la créatinine|clairance de la creatinine)\b/i;

const DRUG_CLASS_RE = /\b(class="[^"]*\b(dci|spe|lstdci|nommed)\b|nabda:[sp]\.)/i;

const SAMU_15_RE = /\b(samu|\(15\)|appeler le 15|le 15\b)/i;

type RawBlock = {
  className: string;
  start: number;
  end: number;
  depth: number;
  title: string;
};

function slugPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function isContainedIn(child: RawBlock, parent: RawBlock): boolean {
  return child.start >= parent.start && child.end <= parent.end && child !== parent;
}

function directPromotedChildren(parent: RawBlock, promoted: RawBlock[]): RawBlock[] {
  const nested = promoted.filter((block) => block !== parent && isContainedIn(block, parent));
  return nested.filter(
    (block) =>
      !nested.some(
        (other) => other !== block && isContainedIn(block, other),
      ),
  );
}

function sliceExcludingChildren(html: string, parent: RawBlock, children: RawBlock[]): string {
  const sorted = [...children].sort((a, b) => a.start - b.start);
  let out = "";
  let cursor = parent.start;
  for (const child of sorted) {
    if (child.start < cursor) {
      continue;
    }
    out += html.slice(cursor, child.start);
    cursor = child.end;
  }
  out += html.slice(cursor, parent.end);
  return out;
}

function detectDose(html: string, text: string): boolean {
  return DOSE_RE.test(text) || DOSE_RE.test(html);
}

function detectEmergency(text: string): boolean {
  return EMERGENCY_RE.test(text);
}

function detectCalculator(html: string, text: string, calcIds: string[]): boolean {
  if (calcIds.length > 0 && /nabda:calc\./i.test(html)) {
    return true;
  }
  return CALCULATOR_RE.test(text);
}

function detectDrugMention(html: string, linkedIds: string[], substanceIds: string[]): boolean {
  if (linkedIds.some((id) => id.startsWith("s.") || id.startsWith("p."))) {
    return true;
  }
  if (substanceIds.length > 0 && /nabda:[sp]\./i.test(html)) {
    return true;
  }
  return DRUG_CLASS_RE.test(html);
}

function emptyGroups(): ProtocolNormalizeResult["tabGroups"] {
  return {
    Aperçu: [],
    Diagnostic: [],
    "Prise en charge": [],
    Traitements: [],
    Médicaments: [],
    Sources: [],
  };
}

function emptyShift(): ProtocolNormalizeResult["shiftGroups"] {
  return {
    Gravité: [],
    "Premières étapes": [],
    Traitements: [],
    "Outils liés": [],
    Sources: [],
  };
}

function mergeTinySections(sections: NabdaProtocolSection[]): NabdaProtocolSection[] {
  if (sections.length < 2) {
    return sections;
  }
  const merged: NabdaProtocolSection[] = [];
  for (const section of sections) {
    if (section.text.length >= MIN_SECTION_CHARS || !merged.length) {
      merged.push(section);
      continue;
    }
    const previous = merged[merged.length - 1];
    previous.html = `${previous.html}\n${section.html}`;
    previous.text = `${previous.text}\n${section.text}`.trim();
    previous.warnings = [...new Set([...previous.warnings, ...section.warnings, "orphan_fragment_merged"])];
    previous.containsDose = previous.containsDose || section.containsDose;
    previous.containsDrugMention = previous.containsDrugMention || section.containsDrugMention;
    previous.containsCalculatorMention =
      previous.containsCalculatorMention || section.containsCalculatorMention;
    previous.containsEmergencySignal =
      previous.containsEmergencySignal || section.containsEmergencySignal;
    previous.containsTable = previous.containsTable || section.containsTable;
    previous.containsImage = previous.containsImage || section.containsImage;
    previous.containsImagemap = previous.containsImagemap || section.containsImagemap;
    previous.linkedSourceIds = [...new Set([...(previous.linkedSourceIds ?? []), ...(section.linkedSourceIds ?? [])])];
  }
  return merged;
}

export function normalizeProtocolHtml(source: ProtocolNormalizeInput): ProtocolNormalizeResult {
  const protocolSourceId = source.id;
  const protocolSlug = sourceIdToSlug(source.id);
  const body = source.body_html ?? "";
  const protocolWarnings: string[] = [];
  const substanceIds = source.substance_ids ?? [];
  const calcIds = source.calc_ids ?? [];

  if (!body.trim()) {
    protocolWarnings.push("empty_body_html");
    return {
      protocolSourceId,
      protocolSlug,
      protocolTitle: source.title,
      bodyChars: 0,
      sections: [],
      warnings: protocolWarnings,
      tabGroups: emptyGroups(),
      shiftGroups: emptyShift(),
    };
  }

  const items = findContentItemBlocks(body);
  const promoted: RawBlock[] = [];
  for (const item of items) {
    if (isNestedChipClass(item.className)) {
      continue;
    }
    const title = extractFirstTitle(body.slice(item.start, item.end));
    if (!isPromotedSectionClass(item.className) && !title) {
      continue;
    }
    if (!isPromotedSectionClass(item.className)) {
      const classified = classifyProtocolSectionKind({ title, className: item.className });
      if (classified.unresolved) {
        continue;
      }
    }
    promoted.push({
      className: item.className,
      start: item.start,
      end: item.end,
      depth: item.depth,
      title,
    });
  }

  for (const range of findDivRanges(body, ["deflibre"])) {
    const overlaps = promoted.some(
      (block) => range.start >= block.start && range.end <= block.end,
    );
    if (overlaps) {
      continue;
    }
    const title = extractLibreTitle(body.slice(range.start, range.end));
    if (!title) {
      continue;
    }
    promoted.push({
      className: "deflibre",
      start: range.start,
      end: range.end,
      depth: 0,
      title,
    });
  }
  promoted.sort((a, b) => a.start - b.start);

  const rawSections: NabdaProtocolSection[] = [];
  for (const block of promoted) {
    const children = directPromotedChildren(block, promoted);
    const rawHtml = sliceExcludingChildren(body, block, children);
    const cleaned = cleanProtocolHtml(rawHtml);
    const title = block.title || extractFirstTitle(cleaned.html) || block.className;
    const classified = classifyProtocolSectionKind({
      title,
      className: block.className,
    });
    const text = htmlToPlainText(cleaned.html);
    if (!text && !cleaned.keptImageSrcs.length) {
      continue;
    }
    const linkedSourceIds = extractLinkedSourceIds(cleaned.html);
    const containsImagemap = cleaned.strippedImagemap;
    const containsImage = cleaned.keptImageSrcs.length > 0 || /<img\b/i.test(cleaned.html);
    const containsTable = /<table\b/i.test(cleaned.html);
    const containsEmergencySignal = detectEmergency(text);
    const containsDose = detectDose(cleaned.html, text);
    const containsDrugMention = detectDrugMention(cleaned.html, linkedSourceIds, substanceIds);
    const containsCalculatorMention = detectCalculator(cleaned.html, text, calcIds);
    const warnings = [...cleaned.warnings];
    if (classified.unresolved) {
      warnings.push("unresolved_heading");
    }
    if (containsImagemap) {
      warnings.push("flowchart_kept_as_static_media");
    }
    if (SAMU_15_RE.test(text)) {
      warnings.push("samu_15_france");
    }
    if (text.length >= LONG_SECTION_CHARS) {
      warnings.push("section_too_long_for_mobile");
    }
    if (containsDose && (classified.kind === "treatment" || classified.kind === "management" || classified.kind === "dosage")) {
      warnings.push("dose_bearing_section");
    }
    const displaySignals = {
      kind: classified.kind,
      textLength: text.length,
      containsTable,
      containsEmergencySignal,
      sourceHeading: title,
    };
    rawSections.push({
      id: `${protocolSourceId}:${slugPart(classified.kind)}:${slugPart(title) || block.className}`,
      protocolSourceId,
      protocolSlug,
      sourceHeading: title,
      title,
      kind: classified.kind,
      priority: classifyProtocolPriority(displaySignals),
      display: classifyProtocolDisplay(displaySignals),
      order: 0,
      html: cleaned.html,
      text,
      containsDose,
      containsDrugMention,
      containsCalculatorMention,
      containsEmergencySignal,
      containsTable,
      containsImage,
      containsImagemap,
      rawHtmlPreserved: true,
      warnings: [...new Set(warnings)],
      linkedSourceIds: linkedSourceIds.length ? linkedSourceIds : undefined,
    });
  }

  const merged = mergeTinySections(rawSections);
  const usedIds = new Set<string>();
  const sections = merged.map((section, index) => {
    let id = section.id;
    if (usedIds.has(id)) {
      id = `${id}-${index + 1}`;
    }
    usedIds.add(id);
    return { ...section, id, order: index + 1 };
  });

  if (body.length >= LONG_PROTOCOL_CHARS) {
    protocolWarnings.push("protocol_too_long_for_mobile");
  }
  if (sections.length > TOO_MANY_SECTIONS) {
    protocolWarnings.push("too_many_sections");
  }
  if (sections.some((section) => section.containsImagemap)) {
    protocolWarnings.push("flowchart_imagemap_stripped");
  }
  if (sections.some((section) => section.warnings.includes("samu_15_france"))) {
    protocolWarnings.push("samu_15_france");
  }
  if (!sections.length) {
    protocolWarnings.push("no_sections_extracted");
  }

  const tabGroups = emptyGroups();
  const shiftGroups = emptyShift();
  for (const section of sections) {
    tabGroups[mobileTabForKind(section.kind)].push(section.id);
    const shift = shiftGroupForKind(section.kind, section.containsCalculatorMention);
    shiftGroups[shift].push(section.id);
    if (section.containsCalculatorMention && shift !== "Outils liés") {
      shiftGroups["Outils liés"].push(section.id);
    }
  }
  for (const tab of MOBILE_TAB_ORDER) {
    tabGroups[tab] = [...new Set(tabGroups[tab])];
  }
  for (const group of SHIFT_GROUP_ORDER) {
    shiftGroups[group] = [...new Set(shiftGroups[group])];
  }

  return {
    protocolSourceId,
    protocolSlug,
    protocolTitle: source.title,
    bodyChars: body.length,
    sections,
    warnings: [...new Set(protocolWarnings)],
    tabGroups,
    shiftGroups,
  };
}
