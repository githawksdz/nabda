import { categoryLabel } from "@/lib/content-detail/content-detail-mappers";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { ClinicalFeedItem, ClinicalFeedKind } from "@/lib/home/clinical-feed";

export type ClinicalFeedSource = {
  id: string;
  kind: string;
  title: string;
  slug: string;
  categorySlug?: string | null;
  publishedAt?: string | null;
  featured?: boolean;
  priority?: number;
};

export function toClinicalFeedItems(sources: ClinicalFeedSource[]): ClinicalFeedItem[] {
  const items: ClinicalFeedItem[] = [];
  for (const source of sources) {
    if (!isClinicalKind(source.kind) || !source.slug || !source.title.trim()) {
      continue;
    }
    const categorySlug = source.categorySlug?.trim();
    items.push({
      id: source.id,
      kind: source.kind,
      kindLabel: ENTITY_TYPE_LABELS[source.kind],
      title: source.title.trim(),
      categoryLabel: categorySlug ? categoryLabel(categorySlug) : undefined,
      href: `/protocols/${source.slug}`,
      publishedAt: source.publishedAt ?? null,
      featured: Boolean(source.featured),
      priority: source.priority ?? 0,
    });
  }
  return items;
}

function isClinicalKind(kind: string): kind is ClinicalFeedKind {
  return kind === "protocol";
}
