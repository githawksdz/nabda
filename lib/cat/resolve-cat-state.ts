import type { CatMap } from "@/types/content";
import type {
  CatCard,
  CatCategorySlug,
  CatIndexState,
  CatSubFilter,
} from "@/types/cat";
import { safeSourceNote } from "@/lib/content-detail/status-labels";

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
  if (preview === "preparation" || category === "dermatologie") {
    return "preparation";
  }
  return "general";
}

export function resolveActiveCategory(
  category?: string | null,
  preview?: string | null,
): CatCategorySlug {
  if (preview === "urgences") return "urgences";
  if (preview === "preparation") return "dermatologie";
  return parseCatCategory(category);
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

const REVIEWED = new Set(["validated", "medical_reviewed", "editorial_reviewed"]);

export function overlaySeedReview(card: CatCard, seedCats: CatMap[]): CatCard {
  const row = seedCats.find((item) => item.slug === card.slug);
  if (
    !row ||
    row.status === "seed_placeholder" ||
    row.review_status === "editorial_placeholder"
  ) {
    return card;
  }
  if (!REVIEWED.has(row.review_status)) {
    return card;
  }
  return {
    ...card,
    sourceLabel: safeSourceNote(row.source_note, card.sourceLabel),
  };
}
