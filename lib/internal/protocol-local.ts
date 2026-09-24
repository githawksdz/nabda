/**
 * Server-only local protocol JSON loader (internal preview / tooling).
 * Reads dry-run JSON from disk. Does not query Supabase or ship the corpus to the client bundle.
 */

import fs from "node:fs";
import path from "node:path";
import { collectPreviewStats } from "@/lib/content-rendering/protocol";
import type {
  ProtocolNormalizeFile,
  ProtocolRenderIndexItem,
  ProtocolRenderSource,
  ProtocolRenderWarning,
  ProtocolWarningFile,
} from "@/types/content-rendering-protocol";
import type { ProtocolNormalizeResult } from "@/types/nabda-protocol-sections";

type PreviewCache = {
  bySlug: Map<string, ProtocolNormalizeResult>;
  index: ProtocolRenderIndexItem[];
  warningsBySource: Map<string, ProtocolRenderWarning[]>;
};

const ROOT = process.cwd();
const CANDIDATES_PATH = path.join(ROOT, "data", "protocol-section-candidates.json");
const WARNINGS_PATH = path.join(ROOT, "data", "protocol-normalizer-warnings.json");

let cache: PreviewCache | null = null;

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
  const file = readJson<ProtocolNormalizeFile>(CANDIDATES_PATH);
  const warningFile = readJson<ProtocolWarningFile>(WARNINGS_PATH);
  const bySlug = new Map<string, ProtocolNormalizeResult>();
  const index: ProtocolRenderIndexItem[] = [];
  const warningsBySource = new Map<string, ProtocolRenderWarning[]>();

  for (const item of warningFile?.items ?? []) {
    const list = warningsBySource.get(item.protocolSourceId) ?? [];
    list.push(item);
    warningsBySource.set(item.protocolSourceId, list);
  }

  for (const protocol of file?.protocols ?? []) {
    bySlug.set(protocol.protocolSlug, protocol);
    const stats = collectPreviewStats(protocol.sections);
    index.push({
      slug: protocol.protocolSlug,
      title: protocol.protocolTitle,
      sourceId: protocol.protocolSourceId,
      sectionCount: stats.sectionCount,
      warningCount: protocol.warnings.length + stats.unresolvedHeadingCount,
      hasDose: stats.doseCount > 0,
      hasEmergency: stats.emergencyCount > 0,
      hasTable: stats.tableCount > 0,
      hasImage: stats.imageCount > 0,
      hasImagemap: stats.imagemapCount > 0,
      tooLong:
        protocol.warnings.includes("protocol_too_long_for_mobile") ||
        protocol.warnings.includes("too_many_sections"),
    });
  }

  index.sort((a, b) => a.title.localeCompare(b.title, "fr"));
  cache = { bySlug, index, warningsBySource };
  return cache;
}

export function getProtocolPreviewIndex(): ProtocolRenderIndexItem[] {
  return loadCache().index;
}

export function getProtocolPreviewBySlug(slug: string): ProtocolRenderSource | null {
  const loaded = loadCache();
  const protocol = loaded.bySlug.get(slug);
  if (!protocol) {
    return null;
  }
  const stats = collectPreviewStats(protocol.sections);
  return {
    slug: protocol.protocolSlug,
    title: protocol.protocolTitle,
    sourceId: protocol.protocolSourceId,
    bodyChars: protocol.bodyChars,
    protocolWarnings: protocol.warnings,
    sections: protocol.sections,
    tabGroups: protocol.tabGroups,
    shiftGroups: protocol.shiftGroups,
    warningItems: loaded.warningsBySource.get(protocol.protocolSourceId) ?? [],
    stats,
  };
}
