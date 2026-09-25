/**
 * Download authorization. Mirrors server-side publishing-hub rules.
 * Does not use review_status or clinical_payload_status.
 */

import { canReadContent, type ViewerAccess } from "@/lib/authz/content-gate";
import type { DownloadFailureReason, OfflineContentType } from "@/lib/offline/types";

export type DownloadCandidate = {
  contentType?: OfflineContentType;
  slug?: string | null;
  status?: string | null;
  visibility?: string | null;
  offlineAvailable?: boolean | null;
};

export type DownloadDecision =
  | { ok: true }
  | { ok: false; reason: DownloadFailureReason };

export function decideDownload(
  candidate: DownloadCandidate | null | undefined,
  viewer: ViewerAccess,
): DownloadDecision {
  if (!viewer.authenticated) {
    return { ok: false, reason: "unauthenticated" };
  }
  if (!candidate) {
    return { ok: false, reason: "unknown" };
  }
  if (candidate.status === "draft") {
    return { ok: false, reason: "draft" };
  }
  if (candidate.status !== "published") {
    return { ok: false, reason: "unpublished" };
  }
  if (candidate.offlineAvailable !== true) {
    return { ok: false, reason: "not_offline_available" };
  }
  if (!canReadContent(candidate, viewer)) {
    if (candidate.visibility === "premium") {
      return { ok: false, reason: "premium_requires_pro" };
    }
    return { ok: false, reason: "hidden" };
  }
  return { ok: true };
}

export function decidePackDownload(
  pack: { status?: string | null; visibility?: string | null } | null,
  items: DownloadCandidate[],
  viewer: ViewerAccess,
): DownloadDecision {
  if (!viewer.authenticated) {
    return { ok: false, reason: "unauthenticated" };
  }
  if (!pack || pack.status !== "published") {
    return { ok: false, reason: "pack_unpublished" };
  }
  if (pack.visibility === "premium" && !(viewer.authenticated && viewer.hasActivePro)) {
    return { ok: false, reason: "premium_requires_pro" };
  }
  if (pack.visibility !== "public_free" && pack.visibility !== "premium") {
    return { ok: false, reason: "hidden" };
  }
  if (items.length === 0) {
    return { ok: false, reason: "pack_item_missing" };
  }
  if (pack.visibility === "public_free" && items.some((item) => item.visibility === "premium")) {
    return { ok: false, reason: "premium_in_free_pack" };
  }
  for (const item of items) {
    const decision = decideDownload(item, viewer);
    if (!decision.ok) {
      return decision;
    }
  }
  return { ok: true };
}
