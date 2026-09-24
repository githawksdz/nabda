/**
 * Gate for /internal/* product inspection routes.
 * There is no admin role yet. Development is open; production needs ?preview=internal.
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

export function canAccessInternalPreview(previewParam?: string | null): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return previewParam === "internal";
}

export function internalPreviewQuery(unlocked: boolean): string {
  return unlocked ? "?preview=internal" : "";
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
): string {
  const query = new URLSearchParams({ file: filename });
  if (unlocked) {
    query.set("preview", "internal");
  }
  return `/internal/cat-preview/media?${query.toString()}`;
}

export function internalDrugPreviewHref(slug: string, unlocked: boolean): string {
  return `/internal/drug-preview/${slug}${internalPreviewQuery(unlocked)}`;
}

export function internalDrugPreviewMediaHref(
  filename: string,
  unlocked: boolean,
): string {
  const query = new URLSearchParams({ file: filename });
  if (unlocked) {
    query.set("preview", "internal");
  }
  return `/internal/drug-preview/media?${query.toString()}`;
}

export function internalCalculatorPreviewHref(slug: string, unlocked: boolean): string {
  return calculatorHref(slug, "internal", unlocked);
}
