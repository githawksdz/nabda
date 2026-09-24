/**
 * Extract linear CAT steps from reco HTML.
 * Does not create graph edges. Does not rewrite wording.
 */

import {
  classifyCatStepKind,
} from "@/lib/nabda-db/cat/cat-step-classifier";
import {
  classifyCatStepDisplay,
  classifyCatStepPriority,
  etapesGroupForKind,
  shiftGroupForKind,
  ETAPES_GROUP_ORDER,
  SHIFT_GROUP_ORDER,
} from "@/lib/nabda-db/cat/cat-step-mobile-mapper";
import {
  detectCalculator,
  detectDose,
  detectDrugMention,
  detectEmergency,
  detectSamu15,
} from "@/lib/nabda-db/html/content-flags";
import {
  cleanProtocolHtml,
  extractLinkedSourceIds,
  findDivRanges,
  htmlToPlainText,
} from "@/lib/nabda-db/html/html-cleaner";
import { normalizeProtocolHtml } from "@/lib/nabda-db/html/protocol-normalizer";
import { hasFlowchartImage } from "@/lib/nabda-db/protocol-mapper";
import { sourceIdToSlug } from "@/lib/nabda-db/slugs";
import type {
  CatStepExtractInput,
  CatStepExtractResult,
  NabdaCatEtapesGroup,
  NabdaCatShiftGroup,
  NabdaCatStep,
} from "@/types/nabda-cat-steps";

const MIN_STEP_CHARS = 24;
const TOO_MANY_STEPS = 24;

function slugPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function openingTag(html: string, start: number): string {
  const close = html.indexOf(">", start);
  return close < 0 ? "" : html.slice(start, close + 1);
}

function innerOfFirstClass(html: string, className: string): string {
  const ranges = findDivRanges(html, [className]);
  const range = ranges[0];
  if (!range) {
    return "";
  }
  const openEnd = html.indexOf(">", range.start) + 1;
  const closeStart = html.lastIndexOf("</div", range.end - 1);
  if (openEnd <= 0 || closeStart <= openEnd) {
    return html.slice(range.start, range.end);
  }
  return html.slice(openEnd, closeStart);
}

function flowchartImageSrcs(html: string): string[] {
  const srcs: string[] = [];
  const add = (value: string | undefined) => {
    if (value && !srcs.includes(value)) {
      srcs.push(value);
    }
  };
  for (const range of findDivRanges(html, ["arbre"])) {
    const slice = html.slice(range.start, range.end);
    for (const tag of slice.match(/<img\b[^>]*>/gi) ?? []) {
      const src = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
      add(src?.[2] ?? src?.[3]);
    }
  }
  for (const tag of html.match(/<img\b[^>]*usemap\s*=[^>]*>/gi) ?? []) {
    const src = tag.match(/\bsrc\s*=\s*("([^"]*)"|'([^']*)')/i);
    add(src?.[2] ?? src?.[3]);
  }
  return srcs;
}

function extractSpanItemcom(html: string): { order?: number; label: string } {
  const match = html.match(/<span[^>]*class="[^"]*\bitemcom\b[^"]*"[^>]*>([\s\S]*?)<\/span>/i);
  const label = htmlToPlainText(match?.[1] ?? "");
  const order = Number.parseInt(label, 10);
  return { order: Number.isFinite(order) ? order : undefined, label };
}

function isSkippableStep(title: string, text: string): boolean {
  const blob = `${title} ${text}`.toLowerCase();
  if (text.length < MIN_STEP_CHARS) return true;
  if (/références|references|bibliographie/.test(blob) && text.length < 120) return true;
  return false;
}

function emptyTabs(): CatStepExtractResult["tabGroups"] {
  return {
    Gravité: [],
    Diagnostic: [],
    "Premières actions": [],
    Traitements: [],
    Surveillance: [],
    Orientation: [],
    "Outils liés": [],
    Sources: [],
  };
}

function emptyShift(): CatStepExtractResult["shiftGroups"] {
  return {
    "Urgent maintenant": [],
    "À vérifier": [],
    "À faire": [],
    "À surveiller": [],
    "Liens utiles": [],
  };
}

function buildStep(input: {
  protocolSourceId: string;
  protocolSlug: string;
  sourceSectionId?: string;
  order: number;
  sourceOrder?: number;
  title: string;
  html: string;
  sourceSelector?: string;
  sourceHeading?: string;
  extraWarnings?: string[];
  substanceIds: string[];
  calcIds: string[];
}): NabdaCatStep | null {
  const cleaned = cleanProtocolHtml(input.html);
  const text = htmlToPlainText(cleaned.html);
  if (isSkippableStep(input.title, text)) {
    return null;
  }
  const linkedSourceIds = extractLinkedSourceIds(cleaned.html);
  const classified = classifyCatStepKind({ title: input.title, text });
  const containsDose = detectDose(cleaned.html, text);
  const containsEmergencySignal = detectEmergency(text);
  const containsCalculatorMention = detectCalculator(cleaned.html, text, input.calcIds);
  const containsDrugMention = detectDrugMention(cleaned.html, linkedSourceIds, input.substanceIds);
  const warnings = [...cleaned.warnings, ...(input.extraWarnings ?? [])];
  if (classified.unresolved) warnings.push("unresolved_step_pattern");
  if (detectSamu15(text)) warnings.push("samu_15_france");
  if (containsDose) warnings.push("dose_bearing_step");
  const kind = classified.kind;
  const priority = classifyCatStepPriority({
    kind,
    containsEmergencySignal,
    containsDose,
  });
  return {
    id: `${input.protocolSourceId}:step:${input.order}:${slugPart(input.title) || "step"}`,
    protocolSourceId: input.protocolSourceId,
    protocolSlug: input.protocolSlug,
    sourceSectionId: input.sourceSectionId,
    order: input.order,
    sourceOrder: input.sourceOrder,
    title: input.title,
    text,
    html: cleaned.html,
    kind,
    priority,
    display: classifyCatStepDisplay(kind),
    sourceSelector: input.sourceSelector,
    sourceHeading: input.sourceHeading ?? input.title,
    containsDose,
    containsDrugMention,
    containsCalculatorMention,
    containsEmergencySignal,
    containsTable: /<table\b/i.test(cleaned.html),
    containsImage: /<img\b/i.test(cleaned.html) || cleaned.keptImageSrcs.length > 0,
    linkedSourceIds: linkedSourceIds.length ? linkedSourceIds : undefined,
    rawHtmlPreserved: true,
    warnings: [...new Set(warnings)],
  };
}

function extractItemcomSteps(
  body: string,
  source: CatStepExtractInput,
  protocolSlug: string,
  sectionIdByKind: Map<string, string>,
): NabdaCatStep[] {
  const ranges = findDivRanges(body, ["itemcom"]);
  const steps: NabdaCatStep[] = [];
  let order = 0;
  for (const range of ranges) {
    const tag = openingTag(body, range.start);
    if (/\bhiddenDiv\b/.test(tag)) {
      continue;
    }
    const raw = body.slice(range.start, range.end);
    const catTitle = htmlToPlainText(innerOfFirstClass(raw, "cat"));
    const defcat = innerOfFirstClass(raw, "defcat");
    const numbered = extractSpanItemcom(raw);
    const title = catTitle || (numbered.order ? `Étape ${numbered.order}` : "");
    if (!title && !defcat) {
      continue;
    }
    order += 1;
    const idMatch = tag.match(/\bid\s*=\s*("([^"]*)"|'([^']*)')/i);
    const elementId = idMatch?.[2] ?? idMatch?.[3];
    const step = buildStep({
      protocolSourceId: source.id,
      protocolSlug,
      sourceSectionId: sectionIdByKind.get("management") ?? sectionIdByKind.get("treatment"),
      order,
      sourceOrder: numbered.order,
      title,
      html: defcat || raw,
      sourceSelector: elementId ? `.itemcom#${elementId}` : ".itemcom",
      sourceHeading: title,
      extraWarnings: [],
      substanceIds: source.substance_ids ?? [],
      calcIds: source.calc_ids ?? [],
    });
    if (step) {
      steps.push(step);
    }
  }
  return steps;
}

function extractOrderedListSteps(
  body: string,
  source: CatStepExtractInput,
  protocolSlug: string,
  sectionIdByKind: Map<string, string>,
): NabdaCatStep[] {
  const lists = [...body.matchAll(/<ol\b[^>]*>([\s\S]*?)<\/ol>/gi)];
  const steps: NabdaCatStep[] = [];
  let order = 0;
  for (const list of lists) {
    const items = [...(list[1] ?? "").matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)];
    if (items.length < 2) {
      continue;
    }
    for (const item of items) {
      const html = item[1] ?? "";
      const text = htmlToPlainText(html);
      if (text.length < MIN_STEP_CHARS) {
        continue;
      }
      order += 1;
      const title = text.split(/[.:(]/)[0]?.slice(0, 80) || `Étape ${order}`;
      const step = buildStep({
        protocolSourceId: source.id,
        protocolSlug,
        sourceSectionId: sectionIdByKind.get("management") ?? sectionIdByKind.get("treatment"),
        order,
        sourceOrder: order,
        title,
        html,
        sourceSelector: "ol > li",
        sourceHeading: title,
        extraWarnings: ["ordered_list_fallback"],
        substanceIds: source.substance_ids ?? [],
        calcIds: source.calc_ids ?? [],
      });
      if (step) {
        steps.push(step);
      }
    }
  }
  return steps;
}

export function extractCatSteps(source: CatStepExtractInput): CatStepExtractResult {
  const protocolSourceId = source.id;
  const protocolSlug = sourceIdToSlug(source.id);
  const body = source.body_html ?? "";
  const warnings: string[] = [];
  const hasStaticFlowchartImage = hasFlowchartImage(body);
  const flowchartImages = flowchartImageSrcs(body);
  const imagemapStripped = /<map\b/i.test(body) || /\busemap\s*=/i.test(body);

  const normalized = normalizeProtocolHtml(source);
  const sectionIdByKind = new Map<string, string>();
  for (const section of normalized.sections) {
    if (!sectionIdByKind.has(section.kind)) {
      sectionIdByKind.set(section.kind, section.id);
    }
  }

  let extractionMode: CatStepExtractResult["extractionMode"] = "none";
  let steps = extractItemcomSteps(body, source, protocolSlug, sectionIdByKind);
  if (steps.length) {
    extractionMode = "itemcom";
  } else {
    steps = extractOrderedListSteps(body, source, protocolSlug, sectionIdByKind);
    if (steps.length) {
      extractionMode = "ordered_list";
      warnings.push("ordered_list_fallback");
    }
  }

  const usedIds = new Set<string>();
  steps = steps.map((step, index) => {
    const order = index + 1;
    let id = `${protocolSourceId}:step:${order}:${slugPart(step.title) || "step"}`;
    if (usedIds.has(id)) {
      id = `${id}-${order}`;
    }
    usedIds.add(id);
    return { ...step, id, order };
  });

  if (hasStaticFlowchartImage && !steps.length) {
    warnings.push("static_flowchart_without_steps");
  }
  if (hasStaticFlowchartImage && !flowchartImages.length) {
    warnings.push("media_only_flowchart");
  }
  if (imagemapStripped) {
    warnings.push("flowchart_imagemap_stripped");
  }
  if (steps.length > TOO_MANY_STEPS) {
    warnings.push("too_many_steps");
  }
  if (!steps.length) {
    warnings.push("no_useful_steps");
  }

  const tabGroups = emptyTabs();
  const shiftGroups = emptyShift();
  for (const step of steps) {
    const tab = etapesGroupForKind(step.kind);
    tabGroups[tab].push(step.id);
    const shift = shiftGroupForKind(step.kind, step.priority);
    shiftGroups[shift].push(step.id);
    if (step.containsCalculatorMention && shift !== "Liens utiles") {
      shiftGroups["Liens utiles"].push(step.id);
    }
  }
  for (const group of ETAPES_GROUP_ORDER) {
    tabGroups[group] = [...new Set(tabGroups[group])];
  }
  for (const group of SHIFT_GROUP_ORDER) {
    shiftGroups[group] = [...new Set(shiftGroups[group])];
  }

  return {
    protocolSourceId,
    protocolSlug,
    protocolTitle: source.title,
    hasStaticFlowchartImage,
    hasExtractedLinearSteps: steps.length > 0,
    hasInteractiveGraph: false,
    flowchartImages,
    imagemapStripped,
    extractionMode,
    steps,
    warnings: [...new Set(warnings)],
    tabGroups,
    shiftGroups,
  };
}

export function emptyEtapesGroups(): Record<NabdaCatEtapesGroup, string[]> {
  return emptyTabs();
}

export function emptyShiftGroups(): Record<NabdaCatShiftGroup, string[]> {
  return emptyShift();
}
