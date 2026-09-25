import type { SearchResult } from "@/types/search";

export const SEARCH_EMPTY_TITLE = "Ce contenu n’existe pas dans Nabda.";
export const SEARCH_EMPTY_HELP =
  "Essayez un autre terme ou explorez les catégories disponibles.";
export const SEARCH_ERROR_TITLE = "Impossible de charger les résultats.";
export const SEARCH_ERROR_HELP =
  "Vérifiez votre connexion puis réessayez.";
export const SEARCH_LOADING_LABEL = "Recherche en cours…";

export type SearchOutcome =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; results: SearchResult[] }
  | { kind: "empty" }
  | { kind: "error" };

/**
 * Public empty and missing/unpublished/restricted queries share one outcome.
 * A failed request is never reported as missing content.
 */
export function resolveSearchOutcome(input: {
  hasQuery: boolean;
  pending: boolean;
  failed: boolean;
  results: SearchResult[];
}): SearchOutcome {
  if (!input.hasQuery) {
    return { kind: "idle" };
  }
  if (input.pending) {
    return { kind: "loading" };
  }
  if (input.failed) {
    return { kind: "error" };
  }
  if (input.results.length === 0) {
    return { kind: "empty" };
  }
  return { kind: "success", results: input.results };
}
