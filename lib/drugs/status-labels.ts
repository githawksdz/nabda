import type {
  DrugPublicationStatus,
  DrugReviewStatus,
  DrugSafetyItem,
  DrugSummary,
} from "@/types/drugs";
import { canShowValidatedLabel } from "@/lib/content-source/readiness";

export const DRUG_INDEX_STATUS_LABELS = {
  needsRevision: "Révision requise",
  sources: "Sources à consolider",
  preparation: "En préparation",
  unreviewed: "Non relu",
  validated: "Validé",
} as const;

export const DRUG_DETAIL_STATUS_LABELS = {
  pharmacologyReview: "Révision pharmacologique requise",
  sources: "Sources à consolider",
  toVerify: "À vérifier",
  posologyUnavailable: "Posologies non disponibles",
  medication: "Médicament",
} as const;

export const DRUG_REVIEW_STATUS_LABELS: Record<DrugReviewStatus, string> = {
  unreviewed: DRUG_INDEX_STATUS_LABELS.unreviewed,
  needs_revision: DRUG_INDEX_STATUS_LABELS.needsRevision,
  pharmacist_review_required: DRUG_INDEX_STATUS_LABELS.needsRevision,
  pharmacist_reviewed: DRUG_INDEX_STATUS_LABELS.sources,
  validated: DRUG_INDEX_STATUS_LABELS.validated,
};

export const DRUG_PUBLICATION_STATUS_LABELS: Record<
  DrugPublicationStatus,
  string
> = {
  draft: DRUG_INDEX_STATUS_LABELS.preparation,
  seed_placeholder: DRUG_INDEX_STATUS_LABELS.preparation,
  needs_pharmacology_review: DRUG_INDEX_STATUS_LABELS.needsRevision,
  published: DRUG_INDEX_STATUS_LABELS.sources,
  hidden: DRUG_INDEX_STATUS_LABELS.preparation,
  archived: DRUG_INDEX_STATUS_LABELS.preparation,
};

const PREPARATION_STATUSES: DrugPublicationStatus[] = [
  "draft",
  "seed_placeholder",
  "hidden",
  "archived",
];

export function canClaimValidated(
  reviewStatus: DrugReviewStatus,
  publicationStatus?: DrugPublicationStatus | string | null,
): boolean {
  return canShowValidatedLabel(reviewStatus, publicationStatus);
}

export function isPreparationDrug(drug: Pick<DrugSummary, "status" | "visibility">) {
  return (
    PREPARATION_STATUSES.includes(drug.status) || drug.visibility === "stub"
  );
}

const PUBLIC_UNAVAILABLE_LABEL = "Contenu indisponible";

export function drugIndexStatusLabel(
  drug: Pick<DrugSummary, "status" | "reviewStatus" | "visibility">,
): string {
  if (isPreparationDrug(drug) || drug.status !== "published") {
    return PUBLIC_UNAVAILABLE_LABEL;
  }
  if (drug.visibility === "premium") {
    return "Pro";
  }
  return "Publié";
}

export function drugDetailStatusLabel(
  drug: Pick<DrugSummary, "status" | "reviewStatus" | "visibility">,
): string {
  return drugIndexStatusLabel(drug);
}

export function drugSourceStatusLabel(
  sourceStatus: DrugSafetyItem["sourceStatus"],
): string {
  if (sourceStatus === "validated" || sourceStatus === "reviewed") {
    return "Source documentée";
  }
  return PUBLIC_UNAVAILABLE_LABEL;
}

export function mapRawDrugStatusLabel(
  publicationStatus?: string | null,
  reviewStatus?: string | null,
): string {
  if (
    publicationStatus === "seed_placeholder" ||
    publicationStatus === "imported" ||
    publicationStatus === "cleaned" ||
    reviewStatus === "editorial_placeholder"
  ) {
    return DRUG_INDEX_STATUS_LABELS.preparation;
  }
  if (reviewStatus === "unreviewed") {
    return DRUG_INDEX_STATUS_LABELS.unreviewed;
  }
  if (reviewStatus === "needs_revision") {
    return DRUG_INDEX_STATUS_LABELS.needsRevision;
  }
  if (reviewStatus === "pharmacist_review_required") {
    return DRUG_DETAIL_STATUS_LABELS.pharmacologyReview;
  }
  if (canClaimValidated(reviewStatus as DrugReviewStatus, publicationStatus)) {
    return DRUG_INDEX_STATUS_LABELS.validated;
  }
  return DRUG_INDEX_STATUS_LABELS.preparation;
}
