export const HOME_CLINICAL_DISPLAY_LIMIT = 6;

export const CLINICAL_FEED_SORTS = [
  { id: "trending", label: "Tendance" },
  { id: "new", label: "Nouveautés" },
  { id: "hot", label: "À la une" },
] as const;

export type ClinicalFeedSortId = (typeof CLINICAL_FEED_SORTS)[number]["id"];

export type ClinicalFeedKind = "protocol";

export type ClinicalFeedItem = {
  id: string;
  kind: ClinicalFeedKind;
  kindLabel: string;
  title: string;
  categoryLabel?: string;
  href: string;
  publishedAt: string | null;
  featured: boolean;
  priority: number;
};

const DAY_MS = 86_400_000;

export function sortClinicalFeed(
  items: ClinicalFeedItem[],
  sort: ClinicalFeedSortId,
  now = Date.now(),
  limit = HOME_CLINICAL_DISPLAY_LIMIT,
): ClinicalFeedItem[] {
  const clinical = items.filter((item) => item.kind === "protocol");
  const ranked = [...clinical].sort((a, b) => compareClinical(a, b, sort, now));
  return ranked.slice(0, limit);
}

function compareClinical(
  a: ClinicalFeedItem,
  b: ClinicalFeedItem,
  sort: ClinicalFeedSortId,
  now: number,
): number {
  if (sort === "new") {
    return (
      publishedTime(b.publishedAt) - publishedTime(a.publishedAt) ||
      b.priority - a.priority ||
      a.title.localeCompare(b.title, "fr")
    );
  }

  const scoreA = rankScore(a, sort, now);
  const scoreB = rankScore(b, sort, now);
  return scoreB - scoreA || a.title.localeCompare(b.title, "fr");
}

function rankScore(
  item: ClinicalFeedItem,
  sort: Exclude<ClinicalFeedSortId, "new">,
  now: number,
): number {
  const fresh = freshness(item.publishedAt, now);
  if (sort === "hot") {
    return (item.featured ? 80 : 0) + item.priority * 5 + fresh;
  }
  return (item.featured ? 24 : 0) + item.priority * 3 + fresh * 2;
}

function freshness(publishedAt: string | null, now: number): number {
  const published = publishedTime(publishedAt);
  if (!published) {
    return 0;
  }
  const ageDays = Math.max(0, (now - published) / DAY_MS);
  return Math.max(0, 45 - ageDays);
}

function publishedTime(value: string | null): number {
  if (!value) {
    return 0;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}
