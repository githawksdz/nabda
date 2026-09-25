export type FavoriteMutationResult =
  | {
      saved: boolean;
      skipped?: false;
      reason?: never;
    }
  | {
      saved: false;
      skipped: true;
      reason: "unauthenticated";
    }
  | {
      saved: false;
      skipped: true;
      reason: "write_failed";
    };

export type FavoriteReconcileOutcome =
  | "saved"
  | "removed"
  | "unauthenticated"
  | "write_failed";

export type FavoriteReconcileResult = {
  bookmarked: boolean;
  outcome: FavoriteReconcileOutcome;
};

export function reconcileFavorite(
  previous: boolean,
  result: FavoriteMutationResult,
): FavoriteReconcileResult {
  if (!result.skipped) {
    return {
      bookmarked: result.saved,
      outcome: result.saved ? "saved" : "removed",
    };
  }

  switch (result.reason) {
    case "unauthenticated":
      return { bookmarked: previous, outcome: "unauthenticated" };
    case "write_failed":
      return { bookmarked: previous, outcome: "write_failed" };
  }
}
