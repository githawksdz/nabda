import { reviewStatusLabel } from "@/lib/content-detail/status-labels";
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
    statusLabel: reviewStatusLabel(row.review_status, row.status),
    href: `/protocols/${row.slug}`,
  };
}

export function catalogFromDbProtocols(rows: Protocol[]): ProtocolSummary[] {
  return rows.map(summaryFromDbProtocol);
}
