/**
 * Staff pack curation rules. Mirrors 0023 triggers. No medical-review states.
 */

import type { OfflineContentType, OfflineEntitlement } from "@/lib/offline/types";

export type StaffPackRuleFailure =
  | "draft"
  | "unpublished"
  | "not_offline_available"
  | "premium_in_free_pack"
  | "empty_pack"
  | "invalid_item";

export type StaffPackCandidate = {
  visibility: OfflineEntitlement | string;
  status?: string | null;
};

export type StaffPackItemCandidate = {
  contentType: OfflineContentType;
  slug: string;
  status?: string | null;
  visibility?: string | null;
  offlineAvailable?: boolean | null;
};

export type StaffPackRuleDecision =
  | { ok: true }
  | { ok: false; reason: StaffPackRuleFailure };

export function validatePackItem(
  pack: StaffPackCandidate,
  item: StaffPackItemCandidate | null | undefined,
): StaffPackRuleDecision {
  if (!item) {
    return { ok: false, reason: "invalid_item" };
  }
  if (item.status === "draft") {
    return { ok: false, reason: "draft" };
  }
  if (item.status !== "published") {
    return { ok: false, reason: "unpublished" };
  }
  if (item.offlineAvailable !== true) {
    return { ok: false, reason: "not_offline_available" };
  }
  if (pack.visibility === "public_free" && item.visibility === "premium") {
    return { ok: false, reason: "premium_in_free_pack" };
  }
  return { ok: true };
}

export function validatePackPublish(
  pack: StaffPackCandidate,
  items: StaffPackItemCandidate[],
): StaffPackRuleDecision {
  if (items.length === 0) {
    return { ok: false, reason: "empty_pack" };
  }
  for (const item of items) {
    const decision = validatePackItem(pack, item);
    if (!decision.ok) {
      return decision;
    }
  }
  return { ok: true };
}

export function packRuleMessage(reason: StaffPackRuleFailure): string {
  switch (reason) {
    case "draft":
      return "Un brouillon ne peut pas entrer dans un pack.";
    case "unpublished":
      return "Seul le contenu publié peut entrer dans un pack.";
    case "not_offline_available":
      return "Le contenu doit être marqué disponible hors-ligne.";
    case "premium_in_free_pack":
      return "Un pack gratuit ne peut pas contenir de contenu premium.";
    case "empty_pack":
      return "Un pack vide ne peut pas être publié.";
    default:
      return "Élément de pack invalide.";
  }
}
