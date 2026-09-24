/**
 * Server-only local calculator JSON loader (internal preview / tooling).
 * Reads dry-run JSON + one nabda_db/calcs file for detail.
 * Does not query Supabase, eval formulas, or ship the catalog to the client bundle.
 */

import fs from "node:fs";
import path from "node:path";
import { analyzeCalculator } from "@/lib/nabda-db/calcs/calculator-analyzer";
import type { NabdaDbCalculator } from "@/lib/nabda-db/source-types";
import {
  mapCalculatorPreviewModel,
  mapIndexItem,
  resolveCalculatorPreviewSlug,
} from "@/lib/content-rendering/calculator";
import type {
  CalculatorAnalysisFile,
  CalculatorRenderIndexItem,
  CalculatorRenderSource,
  CalculatorRenderWarning,
  CalculatorWarningFile,
} from "@/types/content-rendering-calculator";
import type { NabdaCalculatorAnalysis } from "@/types/nabda-calculator-analysis";

type SourceExtras = {
  specialties: string[];
  localeStatus: string | null;
};

type PreviewCache = {
  bySlug: Map<string, NabdaCalculatorAnalysis>;
  index: CalculatorRenderIndexItem[];
  warningsBySource: Map<string, CalculatorRenderWarning[]>;
};

const ROOT = process.cwd();
const CANDIDATES_PATH = path.join(ROOT, "data", "calculator-analysis-candidates.json");
const WARNINGS_PATH = path.join(ROOT, "data", "calculator-warnings.json");

function calcsDir(): string {
  return [ROOT, "nabda_db", "calcs"].join(path.sep);
}

let cache: PreviewCache | null = null;

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function extractSourceExtras(raw: string): SourceExtras {
  const specMatch = raw.match(/"specialties"\s*:\s*\[([\s\S]*?)\]/);
  const specialties = specMatch?.[1]
    ? [...specMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1])
    : [];
  const localeMatch = raw.match(/"locale_status"\s*:\s*"([^"]*)"/);
  return { specialties, localeStatus: localeMatch?.[1] ?? null };
}

function loadSourceExtras(sourceId: string): SourceExtras | null {
  const filename = `${sourceId}.json`;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  const absolute = [calcsDir(), filename].join(path.sep);
  const relative = path.relative(calcsDir(), absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(absolute)) {
    return null;
  }
  return extractSourceExtras(fs.readFileSync(absolute, "utf8"));
}

function loadCache(): PreviewCache {
  if (cache) {
    return cache;
  }

  const file = readJson<CalculatorAnalysisFile>(CANDIDATES_PATH);
  const warningFile = readJson<CalculatorWarningFile>(WARNINGS_PATH);
  const bySlug = new Map<string, NabdaCalculatorAnalysis>();
  const warningsBySource = new Map<string, CalculatorRenderWarning[]>();
  const index: CalculatorRenderIndexItem[] = [];

  for (const item of warningFile?.items ?? []) {
    const sourceId = item.sourceId;
    if (!sourceId) continue;
    const list = warningsBySource.get(sourceId) ?? [];
    list.push(item);
    warningsBySource.set(sourceId, list);
  }

  for (const analysis of file?.calculators ?? []) {
    bySlug.set(analysis.slug, analysis);
    if (analysis.sourceSlug && analysis.sourceSlug !== analysis.slug) {
      bySlug.set(analysis.sourceSlug, analysis);
    }
    const extras = loadSourceExtras(analysis.sourceId) ?? { specialties: [], localeStatus: null };
    index.push(mapIndexItem(analysis, extras));
  }

  index.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  cache = { bySlug, index, warningsBySource };
  return cache;
}

function loadCalculatorSource(sourceId: string): NabdaDbCalculator | null {
  const filename = `${sourceId}.json`;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return null;
  }
  const absolute = [calcsDir(), filename].join(path.sep);
  const relative = path.relative(calcsDir(), absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(absolute)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(absolute, "utf8")) as NabdaDbCalculator;
}

export function getCalculatorPreviewIndex(): CalculatorRenderIndexItem[] {
  return loadCache().index;
}

export function getCalculatorPreviewBySlug(slug: string): CalculatorRenderSource | null {
  const loaded = loadCache();
  const resolved = resolveCalculatorPreviewSlug(slug);
  const analysis = loaded.bySlug.get(resolved);
  if (!analysis) {
    return null;
  }
  const source = loadCalculatorSource(analysis.sourceId);
  if (!source) {
    return null;
  }
  const liveAnalysis = analyzeCalculator(source);
  return mapCalculatorPreviewModel({
    source,
    analysis: liveAnalysis,
    warningItems: loaded.warningsBySource.get(analysis.sourceId) ?? [],
  });
}
