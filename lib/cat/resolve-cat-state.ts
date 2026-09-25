import type { CatMap } from "@/types/content";
import type {
  CatCard,
  CatCategorySlug,
  CatIndexState,
  CatSubFilter,
} from "@/types/cat";

const CATEGORIES: CatCategorySlug[] = [
  "all",
  "urgences",
  "cardiologie",
  "pediatrie",
  "infectiologie",
  "pneumologie",
  "neurologie",
  "digestif",
  "dermatologie",
];

export function parseCatCategory(value?: string | null): CatCategorySlug {
  if (value && CATEGORIES.includes(value as CatCategorySlug)) {
    return value as CatCategorySlug;
  }
  return "all";
}

export function resolveCatIndexState(
  category?: string | null,
  preview?: string | null,
): CatIndexState {
  if (preview === "urgences" || category === "urgences") {
    return "urgences";
  }
  return "general";
}

export function resolveActiveCategory(
  category?: string | null,
  preview?: string | null,
): CatCategorySlug {
  if (preview === "urgences") return "urgences";
  return parseCatCategory(category ?? (preview === "preparation" ? "dermatologie" : null));
}

export function matchesCatQuery(value: string, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return value.toLowerCase().includes(needle);
}

export function filterCatCards(
  cards: CatCard[],
  query: string,
  subFilter: CatSubFilter = "all",
) {
  return cards.filter((card) => {
    const haystack = [
      card.title,
      card.categoryLabel,
      card.specialtyLabel,
      card.meta,
      card.statusLabel,
    ]
      .filter(Boolean)
      .join(" ");
    const matchesQuery = matchesCatQuery(haystack, query);
    const matchesFilter =
      subFilter === "all" || card.subFilter === subFilter;
    return matchesQuery && matchesFilter;
  });
}

export function overlaySeedReview(card: CatCard, seedCats: CatMap[]): CatCard {
  void seedCats;
  return card;
}
