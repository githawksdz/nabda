import { doctorCatalogStatusLabel } from "@/lib/content-detail/doctor-facing-status";
import type { Protocol } from "@/types/content";

export type ProtocolSummary = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  statusLabel?: string;
  href: string;
};

export function summaryFromDbProtocol(row: Protocol): ProtocolSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? undefined,
    statusLabel: doctorCatalogStatusLabel({
      publicationStatus: row.status,
      visibility: row.visibility,
    }),
    href: `/protocols/${row.slug}`,
  };
}

export function catalogFromDbProtocols(rows: Protocol[]): ProtocolSummary[] {
  return rows.map(summaryFromDbProtocol);
}
