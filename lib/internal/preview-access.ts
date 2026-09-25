/**
 * Href helpers for /internal/* product inspection routes.
 * Authorization lives in lib/internal/preview-gate.ts (server-only).
 */

import { calculatorHref } from "@/lib/content-rendering/render-state";

export {
  catSourceMediaHref,
  drugSourceMediaHref,
} from "@/lib/content-rendering/render-state";

export function firstSearchParam(
  value?: string | string[] | null,
): string | undefined {
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

export function internalPreviewQuery(_unlocked: boolean): string {
  void _unlocked;
  return "";
}

export function internalProtocolPreviewHref(slug: string, unlocked: boolean): string {
  return `/internal/protocol-preview/${slug}${internalPreviewQuery(unlocked)}`;
}

export function internalCatPreviewHref(slug: string, unlocked: boolean): string {
  return `/internal/cat-preview/${slug}${internalPreviewQuery(unlocked)}`;
}

export function internalCatPreviewMediaHref(
  filename: string,
  unlocked: boolean,
  slug?: string,
): string {
  const query = new URLSearchParams({ file: filename });
  if (slug) {
    query.set("slug", slug);
  }
  void unlocked;
  return `/internal/cat-preview/media?${query.toString()}`;
}

export function internalDrugPreviewHref(slug: string, unlocked: boolean): string {
  return `/internal/drug-preview/${slug}${internalPreviewQuery(unlocked)}`;
}

export function internalDrugPreviewMediaHref(
  filename: string,
  unlocked: boolean,
  slug?: string,
): string {
  const query = new URLSearchParams({ file: filename });
  if (slug) {
    query.set("slug", slug);
  }
  void unlocked;
  return `/internal/drug-preview/media?${query.toString()}`;
}

export function internalCalculatorPreviewHref(slug: string, unlocked: boolean): string {
  return calculatorHref(slug, "internal", unlocked);
}
