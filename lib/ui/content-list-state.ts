import type { FavoriteItemType } from "@/types/content";
import type { SearchResultType } from "@/types/search";

export type VisitItemType = FavoriteItemType;

export type ListSurface = "new" | "unread" | "read";

export function canonicalVisitType(
  type: VisitItemType | SearchResultType | string,
): VisitItemType | null {
  if (type === "recommendation" || type === "protocol") return "protocol";
  if (type === "calculator") return "calculator";
  if (type === "drug") return "drug";
  return null;
}

export function visitedContentKey(
  type: VisitItemType | SearchResultType | string,
  slug: string,
): string | null {
  const canonical = canonicalVisitType(type);
  if (!canonical || !slug) return null;
  return `${canonical}:${slug}`;
}

export function hasVisited(
  keys: Iterable<string> | null | undefined,
  type: VisitItemType | SearchResultType | string,
  slug: string,
): boolean {
  const key = visitedContentKey(type, slug);
  if (!key || !keys) return false;
  if (keys instanceof Set) return keys.has(key);
  return new Set(keys).has(key);
}

export function resolveListSurface(input: {
  isNew?: boolean;
  visited?: boolean;
}): ListSurface {
  if (input.isNew) return "new";
  if (input.visited) return "read";
  return "unread";
}
