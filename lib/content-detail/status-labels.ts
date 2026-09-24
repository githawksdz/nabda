import type { TimelineStatus } from "@/types/content-detail";
import {
  canShowValidatedLabel,
  isPlaceholderPublicationStatus,
  isPlaceholderReviewStatus,
} from "@/lib/content-source/readiness";

export const DEFAULT_STATUS_LABELS = {
  structure: "Structure en préparation",
  review: "Révision médicale requise",
  local: "Adaptation locale à vérifier",
  sources: "Sources à consolider",
} as const;

export const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  imported: "Importé",
  cleaned: "Nettoyé",
  ready_for_editorial_review: "Prêt pour relecture éditoriale",
  needs_medical_review: "Révision médicale requise",
  needs_local_adaptation: "Adaptation locale à vérifier",
  published: "Publié",
  hidden: "Masqué",
  archived: "Archivé",
  seed_placeholder: DEFAULT_STATUS_LABELS.structure,
  review_needed: DEFAULT_STATUS_LABELS.review,
  not_available: "Fiche en préparation",
  draft_extracted: DEFAULT_STATUS_LABELS.structure,
  manual_authoring: DEFAULT_STATUS_LABELS.structure,
  ready_for_review: "Prêt pour relecture éditoriale",
  // Starter CAT `approved` is not medical validation.
  approved: DEFAULT_STATUS_LABELS.structure,
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  unreviewed: "Non relu",
  editorial_placeholder: DEFAULT_STATUS_LABELS.structure,
  editorial_reviewed: "Relu éditorialement",
  medical_reviewed: "Relu médicalement",
  pharmacist_reviewed: "Relu pharmacien",
  validated: "Validé",
  published: "Publié",
  needs_revision: "Révision requise",
};

const PLACEHOLDER_SOURCE_PATTERN =
  /placeholder|not medically validated|not for clinical|no dosages|ui development/i;

export const VISIBILITY_LABELS: Record<string, string> = {
  public_free: "Gratuit",
  premium: "Pro",
  preview_only: "Aperçu",
  hidden: "Masqué",
  stub: "Fiche en préparation",
  admin_only: "Interne",
};

export const LOCAL_ADAPTATION_LABELS: Record<string, string> = {
  pending: "Adaptation locale à vérifier",
  in_progress: "Adaptation locale à vérifier",
  to_verify: "Adaptation locale à vérifier",
  adapted: "Adaptation locale à vérifier",
};

export const TIMELINE_STATUS_LABELS: Record<TimelineStatus, string> = {
  created: "Créé",
  in_progress: "En cours",
  upcoming: "À venir",
  pending: "En attente",
};

export function publicationStatusLabel(status: string): string {
  return PUBLICATION_STATUS_LABELS[status] ?? DEFAULT_STATUS_LABELS.structure;
}

/** Seed / editorial placeholders must never surface as medical validation. */
export function sanitizeReviewStatus(
  reviewStatus: string,
  publicationStatus?: string | null,
): string {
  if (
    isPlaceholderReviewStatus(reviewStatus) ||
    isPlaceholderPublicationStatus(publicationStatus)
  ) {
    if (
      reviewStatus === "validated" ||
      reviewStatus === "published" ||
      reviewStatus === "medical_reviewed"
    ) {
      return "unreviewed";
    }
  }
  return reviewStatus;
}

export function reviewStatusLabel(
  status: string,
  publicationStatus?: string | null,
): string {
  const sanitized = sanitizeReviewStatus(status, publicationStatus);
  if (sanitized === "validated" && !canClaimValidated(sanitized, publicationStatus)) {
    return DEFAULT_STATUS_LABELS.review;
  }
  return REVIEW_STATUS_LABELS[sanitized] ?? DEFAULT_STATUS_LABELS.review;
}

export function visibilityLabel(status: string): string {
  return VISIBILITY_LABELS[status] ?? "Fiche en préparation";
}

export function localAdaptationLabel(status: string): string {
  return LOCAL_ADAPTATION_LABELS[status] ?? DEFAULT_STATUS_LABELS.local;
}

export function timelineStatusLabel(status: TimelineStatus): string {
  return TIMELINE_STATUS_LABELS[status];
}

export function isValidatedReview(status: string): boolean {
  return status === "validated";
}

export function isPublishedStatus(status: string): boolean {
  return status === "published";
}

/** Strong UI claims require explicit review/status metadata — never seed placeholders. */
export function canClaimValidated(
  reviewStatus: string,
  publicationStatus?: string | null,
): boolean {
  return canShowValidatedLabel(
    sanitizeReviewStatus(reviewStatus, publicationStatus),
    publicationStatus,
  );
}

export function canClaimPublished(
  publicationStatus: string,
  reviewStatus: string,
): boolean {
  return (
    isPublishedStatus(publicationStatus) &&
    (reviewStatus === "validated" ||
      reviewStatus === "medical_reviewed" ||
      reviewStatus === "published")
  );
}

export function isPlaceholderSourceNote(note: string | null | undefined): boolean {
  if (!note) {
    return true;
  }
  return PLACEHOLDER_SOURCE_PATTERN.test(note);
}

export function safeSourceNote(
  note: string | null | undefined,
  fallback: string = DEFAULT_STATUS_LABELS.sources,
): string {
  if (!note || isPlaceholderSourceNote(note)) {
    return fallback;
  }
  return note;
}
