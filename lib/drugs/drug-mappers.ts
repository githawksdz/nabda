import type { Drug as DbDrug } from "@/types/content";
import type {
  DrugDetail,
  DrugDetailMode,
  DrugPublicationStatus,
  DrugReviewStatus,
  DrugSummary,
  DrugVisibility,
} from "@/types/drugs";
import { buildPlaceholderDrugDetail } from "@/lib/drugs/drug-ui-config";
import {
  canClaimValidated,
  isPreparationDrug,
} from "@/lib/drugs/status-labels";
import { isPlaceholderRecord } from "@/lib/content-source/readiness";

export function mapDrugPublicationStatus(status: string): DrugPublicationStatus {
  if (status === "published") return "published";
  if (status === "hidden") return "hidden";
  if (status === "archived") return "archived";
  if (status === "draft") return "draft";
  if (status === "needs_pharmacology_review" || status === "needs_pharmacist_review") {
    return "needs_pharmacology_review";
  }
  if (status === "reviewed") return "needs_pharmacology_review";
  return "seed_placeholder";
}

export function mapDrugReviewStatus(status: string): DrugReviewStatus {
  if (status === "validated") return "validated";
  if (status === "needs_revision") return "needs_revision";
  if (status === "pharmacist_review_required") return "pharmacist_review_required";
  if (status === "pharmacist_reviewed" || status === "medical_reviewed") {
    return "pharmacist_reviewed";
  }
  return "unreviewed";
}

export function mapDrugVisibility(visibility: string): DrugVisibility {
  if (visibility === "premium") return "premium";
  if (visibility === "preview_only") return "preview_only";
  if (visibility === "stub" || visibility === "hidden") return "stub";
  if (visibility === "admin_only") return "admin_only";
  return "public_free";
}

export function isIncompleteDrugRecord(
  row?: Pick<DbDrug, "status" | "review_status" | "visibility"> | null,
  summary?: Pick<DrugSummary, "status" | "reviewStatus" | "visibility">,
): boolean {
  if (summary && isPreparationDrug(summary)) {
    return true;
  }
  if (!row) {
    return false;
  }
  return (
    row.status === "seed_placeholder" ||
    row.status === "draft" ||
    row.status === "imported" ||
    row.status === "cleaned" ||
    row.status === "hidden" ||
    row.review_status === "editorial_placeholder" ||
    row.visibility === "hidden" ||
    row.visibility === "stub" ||
    isPlaceholderRecord(row.status, row.review_status)
  );
}

function neverValidatePlaceholder(
  row: DbDrug,
  reviewStatus: DrugReviewStatus,
): DrugReviewStatus {
  if (
    canClaimValidated(reviewStatus, row.status) &&
    (row.status === "seed_placeholder" ||
      row.status === "imported" ||
      row.status === "cleaned" ||
      row.review_status === "editorial_placeholder" ||
      row.status === "draft")
  ) {
    return "unreviewed";
  }
  return reviewStatus;
}

export function summaryFromDbDrug(row: DbDrug): DrugSummary {
  const reviewStatus = neverValidatePlaceholder(row, mapDrugReviewStatus(row.review_status));
  const status = mapDrugPublicationStatus(row.status);
  const genericName = row.dci || row.display_name;
  return {
    id: row.id,
    slug: row.slug,
    genericName,
    className: row.therapeutic_class || "Classe à compléter",
    shortClassName: row.therapeutic_class || undefined,
    categorySlugs: [],
    status,
    reviewStatus,
    visibility: mapDrugVisibility(row.visibility),
    href: `/drugs/${row.slug}`,
    iconName: "pill",
    searchTerms: [row.slug, row.dci, row.display_name, row.therapeutic_class ?? ""],
    frequentlyConsulted: row.is_featured,
  };
}

export function overlayDbDrugSummary(
  mock: DrugSummary | undefined,
  row: DbDrug | null | undefined,
): DrugSummary | undefined {
  if (!mock && !row) {
    return undefined;
  }
  if (!row) {
    return mock;
  }
  const base = mock ?? summaryFromDbDrug(row);
  const reviewStatus = neverValidatePlaceholder(
    row,
    mapDrugReviewStatus(row.review_status),
  );
  return {
    ...base,
    id: row.id || base.id,
    genericName: row.dci || row.display_name || base.genericName,
    className: row.therapeutic_class || base.className,
    shortClassName: base.shortClassName ?? row.therapeutic_class ?? undefined,
    status: mapDrugPublicationStatus(row.status),
    reviewStatus,
    visibility: mapDrugVisibility(row.visibility),
    frequentlyConsulted: row.is_featured || base.frequentlyConsulted,
  };
}

export function overlayDbDrugDetail(
  mock: DrugDetail | undefined,
  row: DbDrug | null | undefined,
): DrugDetail | undefined {
  if (!mock && !row) {
    return undefined;
  }
  if (!row) {
    return mock;
  }
  const base = mock ?? buildPlaceholderDrugDetail(summaryFromDbDrug(row));
  const overlaid = overlayDbDrugSummary(base, row);
  if (!overlaid) {
    return mock;
  }
  return {
    ...base,
    ...overlaid,
    // Keep mock clinical fields (CI, warnings) until a validated drug schema lands.
    subtitle: base.subtitle,
    classChip: base.classChip ?? overlaid.shortClassName,
  };
}

export function catalogFromDbDrugs(rows: DbDrug[]): DrugSummary[] {
  return rows.map(summaryFromDbDrug);
}

export function overlayDrugCatalog(
  mocks: DrugSummary[],
  rows: DbDrug[],
): DrugSummary[] {
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  const used = new Set<string>();
  const merged: DrugSummary[] = mocks.map((mock) => {
    const row = bySlug.get(mock.slug);
    if (row) {
      used.add(row.slug);
    }
    return overlayDbDrugSummary(mock, row) ?? mock;
  });

  for (const row of rows) {
    if (used.has(row.slug)) {
      continue;
    }
    const summary = overlayDbDrugSummary(undefined, row);
    if (summary) {
      merged.push(summary);
    }
  }

  return merged;
}

export function resolveDrugDetailMode(input: {
  slug: string;
  detail?: DrugDetail;
  dbRow?: DbDrug | null;
  viewState?: string;
}): DrugDetailMode {
  void input.slug;
  if (!input.detail) {
    return "request";
  }
  if (input.viewState === "request") {
    return "request";
  }
  if (input.viewState === "preparation") {
    return "preparation";
  }
  if (isIncompleteDrugRecord(input.dbRow, input.detail)) {
    return "preparation";
  }
  if (isPreparationDrug(input.detail)) {
    return "preparation";
  }
  return "overview";
}
