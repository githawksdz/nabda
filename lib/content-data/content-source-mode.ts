/**
 * Runtime content source mode.
 *
 * production (default): Supabase only on public routes — no local JSON or mock fallback.
 * demo: mock fixtures allowed when explicitly enabled.
 * internal_preview: local JSON / nabda_db allowed on /internal/* tooling only.
 */

export type ContentSourceMode = "production" | "demo" | "internal_preview";

export function getContentSourceMode(): ContentSourceMode {
  const raw = process.env.NABDA_CONTENT_MODE?.trim().toLowerCase();
  if (raw === "demo") {
    return "demo";
  }
  if (raw === "internal_preview" || raw === "internal") {
    return "internal_preview";
  }
  return "production";
}

export function isProductionContentMode(): boolean {
  return getContentSourceMode() === "production";
}

export function isDemoContentMode(): boolean {
  return getContentSourceMode() === "demo";
}

export function isInternalPreviewContentMode(): boolean {
  return getContentSourceMode() === "internal_preview";
}

/** Local normalized JSON / nabda_db file fallback (never on production public routes). */
export function shouldUseLocalContentFallback(linkMode: "public" | "internal"): boolean {
  if (isProductionContentMode()) {
    return linkMode === "internal" && isInternalPreviewContentMode();
  }
  if (isInternalPreviewContentMode()) {
    return linkMode === "internal";
  }
  return isDemoContentMode();
}

/** Mock catalog/detail fixtures on public routes (demo mode only). */
export function shouldUseMockContentFallback(): boolean {
  return isDemoContentMode();
}

/** Client components: mirror server demo mode when NEXT_PUBLIC_NABDA_CONTENT_MODE=demo. */
export function isDemoContentModeClient(): boolean {
  return process.env.NEXT_PUBLIC_NABDA_CONTENT_MODE === "demo";
}
