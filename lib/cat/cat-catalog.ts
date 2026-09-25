import { doctorCatalogStatusLabel } from "@/lib/content-detail/doctor-facing-status";
import type { CatMap } from "@/types/content";
import type { CatCard, CatUpdate } from "@/types/cat";

export function catCardFromDbMap(row: CatMap): CatCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryLabel: "CAT",
    specialtyLabel: undefined,
    statusLabel: doctorCatalogStatusLabel({
      publicationStatus: row.status,
      visibility: row.visibility,
    }),
    sourceLabel: undefined,
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
    statusLabel:
      doctorCatalogStatusLabel({
        publicationStatus: row.status,
        visibility: row.visibility,
      }) ?? "Contenu en préparation",
    href: `/cat/${row.slug}`,
  };
}

export function catalogFromDbCatMaps(rows: CatMap[]): CatCard[] {
  return rows.map(catCardFromDbMap);
}
