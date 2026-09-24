/**
 * Server-only local CAT JSON + PNG loader (internal preview / tooling).
 * Reads dry-run JSON from disk. Does not query Supabase or ship the corpus to the client bundle.
 */

import fs from "node:fs";
import path from "node:path";
import { getProtocolPreviewBySlug } from "@/lib/internal/protocol-local";
import {
  collectCatLinkedTools,
  collectCatPreviewStats,
  flowchartFilename,
  mapFlowchartImages,
} from "@/lib/content-rendering/cat";
import type {
  CatRenderIndexItem,
  CatRenderSource,
  CatRenderWarning,
  CatStepCandidatesFile,
  CatWarningFile,
} from "@/types/content-rendering-cat";
import type { CatStepExtractResult } from "@/types/nabda-cat-steps";

type PreviewCache = {
  bySlug: Map<string, CatStepExtractResult>;
  index: CatRenderIndexItem[];
  warningsBySource: Map<string, CatRenderWarning[]>;
  mediaFiles: Set<string>;
};

const ROOT = process.cwd();
const CANDIDATES_PATH = path.join(ROOT, "data", "cat-step-candidates.json");
const WARNINGS_PATH = path.join(ROOT, "data", "cat-step-warnings.json");
// Opaque join so the bundler does not glob every flowchart PNG at build time.
function catMediaDir(): string {
  return [ROOT, "nabda_db", "cat", "media"].join(path.sep);
}

let cache: PreviewCache | null = null;

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function mediaAvailable(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return false;
  }
  return fs.existsSync([catMediaDir(), filename].join(path.sep));
}

function loadCache(): PreviewCache {
  if (cache) {
    return cache;
  }
  const file = readJson<CatStepCandidatesFile>(CANDIDATES_PATH);
  const warningFile = readJson<CatWarningFile>(WARNINGS_PATH);
  const bySlug = new Map<string, CatStepExtractResult>();
  const index: CatRenderIndexItem[] = [];
  const warningsBySource = new Map<string, CatRenderWarning[]>();
  const mediaFiles = new Set<string>();

  for (const item of warningFile?.items ?? []) {
    const list = warningsBySource.get(item.protocolSourceId) ?? [];
    list.push(item);
    warningsBySource.set(item.protocolSourceId, list);
  }

  for (const protocol of file?.protocols ?? []) {
    bySlug.set(protocol.protocolSlug, protocol);
    const pngNames = protocol.flowchartImages.map(flowchartFilename);
    const pngFileAvailable = pngNames.some((name) => mediaAvailable(name));
    for (const name of pngNames) {
      if (mediaAvailable(name)) {
        mediaFiles.add(name);
      }
    }
    const warningItems = warningsBySource.get(protocol.protocolSourceId) ?? [];
    index.push({
      title: protocol.protocolTitle,
      slug: protocol.protocolSlug,
      sourceId: protocol.protocolSourceId,
      stepCount: protocol.steps.length,
      warningCount: protocol.warnings.length + warningItems.length,
      hasStaticPng: protocol.hasStaticFlowchartImage || pngNames.length > 0,
      pngFileAvailable,
      hasImagemapStripped: protocol.imagemapStripped,
      hasEmergency: protocol.steps.some((step) => step.containsEmergencySignal),
      hasDose: protocol.steps.some((step) => step.containsDose),
      hasCalculator: protocol.steps.some(
        (step) => step.containsCalculatorMention || step.kind === "calculator",
      ),
    });
  }

  index.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  cache = { bySlug, index, warningsBySource, mediaFiles };
  return cache;
}

export function getCatPreviewIndex(): CatRenderIndexItem[] {
  return loadCache().index;
}

export function isAllowedCatPreviewMedia(filename: string): boolean {
  return loadCache().mediaFiles.has(filename);
}

export function resolveCatPreviewMediaPath(filename: string): string | null {
  if (!isAllowedCatPreviewMedia(filename)) {
    return null;
  }
  const absolute = [catMediaDir(), filename].join(path.sep);
  const relative = path.relative(catMediaDir(), absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  return absolute;
}

export function getCatPreviewBySlug(
  slug: string,
  keepInternalQuery = false,
  linkMode: "public" | "internal" = "internal",
): CatRenderSource | null {
  const loaded = loadCache();
  const protocol = loaded.bySlug.get(slug);
  if (!protocol) {
    return null;
  }

  const images = mapFlowchartImages(
    protocol.flowchartImages,
    loaded.mediaFiles,
    keepInternalQuery,
    linkMode,
  );
  const protocolPreview = getProtocolPreviewBySlug(slug);
  const usedSectionIds = new Set(
    protocol.steps
      .map((step) => step.sourceSectionId)
      .filter((id): id is string => Boolean(id)),
  );
  const skippedSectionTitles =
    protocolPreview?.sections
      .filter((section) => !usedSectionIds.has(section.id))
      .map((section) => section.title) ?? [];

  const extraWarnings = [...protocol.warnings];
  if (images.some((image) => !image.available)) {
    extraWarnings.push("static_png_missing");
  }
  if (protocol.hasStaticFlowchartImage && images.length === 0) {
    extraWarnings.push("static_png_missing");
  }

  return {
    slug: protocol.protocolSlug,
    title: protocol.protocolTitle,
    sourceId: protocol.protocolSourceId,
    extractionMode: protocol.extractionMode,
    hasStaticFlowchartImage: protocol.hasStaticFlowchartImage,
    hasExtractedLinearSteps: protocol.hasExtractedLinearSteps,
    hasInteractiveGraph: false,
    imagemapStripped: protocol.imagemapStripped,
    protocolWarnings: [...new Set(extraWarnings)],
    steps: protocol.steps,
    images,
    warningItems: loaded.warningsBySource.get(protocol.protocolSourceId) ?? [],
    linkedTools: collectCatLinkedTools(protocol.steps, keepInternalQuery, linkMode),
    stats: collectCatPreviewStats(
      protocol.steps,
      images,
      protocol.imagemapStripped,
      skippedSectionTitles,
    ),
  };
}
