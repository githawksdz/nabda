import { reviewStatusLabel } from "@/lib/content-detail/status-labels";
import type { CatMap } from "@/types/content";
import type { CatCard, CatUpdate } from "@/types/cat";

export function catCardFromDbMap(row: CatMap): CatCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryLabel: "CAT",
    specialtyLabel: undefined,
    statusLabel: reviewStatusLabel(row.review_status, row.status),
    sourceLabel: row.imported_from === "nabda_db" ? "Source nabda_db" : undefined,
    urgency: row.is_featured ? "urgent" : "routine",
    href: `/cat/${row.slug}`,
    meta: row.summary ?? undefined,
  };
}

export function catUpdateFromDbMap(row: CatMap): CatUpdate {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    meta: row.summary ?? "CAT",
    statusLabel: reviewStatusLabel(row.review_status, row.status),
    href: `/cat/${row.slug}`,
  };
}

export function catalogFromDbCatMaps(rows: CatMap[]): CatCard[] {
  return rows.map(catCardFromDbMap);
}
