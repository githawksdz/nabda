/**
 * Content-source readiness helpers.
 *
 * UI shells can already render database-backed rows. Until a validated
 * corpus is imported, every medical payload is treated as demo/placeholder.
 * Do not treat seed_placeholder or imported content as medically validated.
 */

/** True while Validé corpus is not the sole public clinical claim. Demo UI fixtures remain opt-in via NABDA_CONTENT_MODE=demo. */
export const IS_DEMO_CONTENT = true;

export const PLACEHOLDER_CONTENT_WARNING =
  "Contenu de démonstration. À confirmer après validation.";

const PLACEHOLDER_PUBLICATION_STATUSES = [
  "seed_placeholder",
  "draft",
  "imported",
  "cleaned",
  "hidden",
  "archived",
] as const;

export function isPlaceholderPublicationStatus(
  status?: string | null,
): boolean {
  if (!status) {
    return false;
  }
  return (PLACEHOLDER_PUBLICATION_STATUSES as readonly string[]).includes(
    status,
  );
}

export function isPlaceholderReviewStatus(status?: string | null): boolean {
  return status === "editorial_placeholder";
}

export function isPlaceholderRecord(
  publicationStatus?: string | null,
  reviewStatus?: string | null,
): boolean {
  return (
    isPlaceholderPublicationStatus(publicationStatus) ||
    isPlaceholderReviewStatus(reviewStatus)
  );
}

/**
 * "Validé" is allowed only for an explicit validated review on a
 * non-placeholder publication. Seed/editorial rows never qualify.
 */
export function canShowValidatedLabel(
  reviewStatus?: string | null,
  publicationStatus?: string | null,
): boolean {
  if (isPlaceholderRecord(publicationStatus, reviewStatus)) {
    return false;
  }
  return reviewStatus === "validated";
}

/**
 * DB clinical payloads may render when the parent row is published.
 * Validé is a display label only (canShowValidatedLabel).
 * Source-preserved nabda_db HTML uses canRenderSourcePreservedContent() plus lib/authz.
 */
export function canRenderClinicalDetails(
  reviewStatus?: string | null,
  publicationStatus?: string | null,
): boolean {
  void reviewStatus;
  return publicationStatus === "published";
}

/**
 * Internal UX-normalized preview (staff).
 * Route access is gated by requireRole("reviewer") via canAccessInternalPreview().
 */
export function canRenderUxNormalizedPreview(): boolean {
  return true;
}

/**
 * Public rendering of source-preserved Supabase payloads.
 * Env kill-switch only — not authorization. Publication and entitlement
 * are enforced by lib/authz and RLS (published + free/premium).
 * Production defaults to enabled; set NABDA_SOURCE_RENDER=0 to disable.
 * @deprecated NABDA_SOURCE_RENDER=1 is no longer required in production.
 */
export function canRenderSourcePreservedContent(): boolean {
  if (process.env.NABDA_SOURCE_RENDER === "0") {
    return false;
  }
  if (process.env.NABDA_CONTENT_MODE === "demo") {
    return false;
  }
  return true;
}

export function overlaySafeText(
  dbText: string | null | undefined,
  fallback: string | null | undefined,
  reviewStatus?: string | null,
  publicationStatus?: string | null,
): string | undefined {
  if (canRenderClinicalDetails(reviewStatus, publicationStatus)) {
    return dbText || fallback || undefined;
  }
  return fallback || undefined;
}
