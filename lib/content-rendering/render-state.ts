/**
 * Public-safe render-state helpers.
 * Access gating for /internal/* stays in lib/internal/preview-access.
 */

import {
  canRenderSourcePreservedContent,
  canRenderUxNormalizedPreview,
} from "@/lib/content-source/readiness";
import { publicCalculatorHref } from "@/lib/content-rendering/calculator";
import type {
  ContentActivationState,
  ContentLinkMode,
  ContentPayloadSource,
} from "@/types/content-rendering";

export function isSourceRenderAllowed(linkMode: ContentLinkMode): boolean {
  if (linkMode === "internal") {
    return canRenderUxNormalizedPreview();
  }
  return canRenderSourcePreservedContent();
}

export function activationStateForLinkMode(
  linkMode: ContentLinkMode,
): ContentActivationState {
  return linkMode === "internal" ? "ux_normalized_preview" : "source_preserved_active";
}

export function payloadSourceLabel(
  source: ContentPayloadSource = "supabase",
): ContentPayloadSource {
  return source;
}

export function keepInternalQueryFromOptions(
  linkMode: ContentLinkMode,
  keepInternalQuery?: boolean,
): boolean {
  return linkMode === "internal" && Boolean(keepInternalQuery);
}

export function catSourceMediaHref(
  filename: string,
  publicRoute: boolean,
  unlocked: boolean,
): string {
  const query = new URLSearchParams({ file: filename });
  if (!publicRoute && unlocked) {
    query.set("preview", "internal");
  }
  const base = publicRoute ? "/content-media/cat" : "/internal/cat-preview/media";
  return `${base}?${query.toString()}`;
}

export function drugSourceMediaHref(
  filename: string,
  publicRoute: boolean,
  unlocked: boolean,
): string {
  const query = new URLSearchParams({ file: filename });
  if (!publicRoute && unlocked) {
    query.set("preview", "internal");
  }
  const base = publicRoute ? "/content-media/drug" : "/internal/drug-preview/media";
  return `${base}?${query.toString()}`;
}

export function calculatorHref(
  slug: string,
  linkMode: ContentLinkMode,
  keepInternalQuery = false,
): string {
  if (linkMode === "public") {
    return publicCalculatorHref(slug);
  }
  return `/internal/calculator-preview/${slug}${keepInternalQuery ? "?preview=internal" : ""}`;
}
