/**
 * Server-only media path resolver for source-preserved Supabase payloads.
 * Serves on-disk nabda_db assets referenced by imported HTML — not a JSON/mock fallback.
 *
 * Existence checks belong in route handlers only (avoids bundling/tracing the media tree).
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MEDIA_FILENAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i;

export function isSafeMediaFilename(filename: string): boolean {
  return MEDIA_FILENAME_RE.test(filename);
}

function resolveSafeMediaFile(mediaDir: string, filename: string): string | null {
  if (!isSafeMediaFilename(filename)) {
    return null;
  }
  const absolute = path.join(mediaDir, filename);
  const relative = path.relative(mediaDir, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }
  if (!fs.existsSync(absolute)) {
    return null;
  }
  return absolute;
}

export function resolveCatSourceMediaPath(filename: string): string | null {
  return resolveSafeMediaFile(path.join(ROOT, "nabda_db", "cat", "media"), filename);
}

export function resolveDrugSourceMediaPath(filename: string): string | null {
  return resolveSafeMediaFile(
    path.join(ROOT, "nabda_db", "drugs", "media"),
    filename,
  );
}
