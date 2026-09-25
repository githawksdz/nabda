/**
 * Static checks for favorite mutation outcomes (unauthenticated vs write failure).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const actions = read("lib/content-detail/user-content-actions.ts");
const favorite = read("lib/ui/favorite-result.ts");
const timing = read("lib/ui/feedback-timing.ts");
const pages = [
  "components/protocols/ProtocolDetailPage.tsx",
  "components/cat-detail/CatDetailPage.tsx",
  "components/drugs/DrugDetailPage.tsx",
  "components/calculators/CalculatorDetailPage.tsx",
  "components/search/MedicationResultCard.tsx",
].map(read);

check(
  "discriminated_reason_type",
  favorite.includes('reason: "unauthenticated"') &&
    favorite.includes('reason: "write_failed"') &&
    favorite.includes("FavoriteMutationResult") &&
    favorite.includes('outcome: "unauthenticated"') &&
    favorite.includes('outcome: "write_failed"'),
  "lib/ui/favorite-result.ts",
);

const toggleFavoriteBlock = actions.slice(actions.indexOf("export async function toggleFavorite"));

check(
  "unauthenticated_without_write",
  toggleFavoriteBlock.includes('reason: "unauthenticated"') &&
    toggleFavoriteBlock.indexOf('reason: "unauthenticated"') <
      toggleFavoriteBlock.indexOf('.from("user_favorites")'),
  "toggleFavorite auth gate",
);

check(
  "write_failed_on_db_errors",
  actions.includes('reason: "write_failed"') &&
    actions.includes("readError") &&
    actions.includes("toggleFavorite delete") &&
    actions.includes("toggleFavorite insert") &&
    !actions.includes("return { saved: false, skipped: true };"),
  "user-content-actions.ts",
);

check(
  "no_raw_error_to_client",
  !toggleFavoriteBlock.includes("return { saved: false, skipped: true, reason: \"write_failed\", message") &&
    !/return\s*\{[^}]*error/i.test(toggleFavoriteBlock) &&
    toggleFavoriteBlock.includes("console.warn"),
  "toggleFavorite returns",
);

check(
  "success_unchanged",
  actions.includes("return { saved: true }") && actions.includes("return { saved: false };"),
  "toggle semantics",
);

check(
  "distinct_user_messages",
  timing.includes("gérer vos favoris") &&
    timing.includes("FAVORITE_WRITE_FAILED_MESSAGE") &&
    !timing.includes("Connectez-vous pour ajouter aux favoris."),
  "feedback-timing.ts",
);

const handlesBoth = pages.every(
  (src) =>
    src.includes("unauthenticated") &&
    src.includes("write_failed") &&
    src.includes("FAVORITE_SIGN_IN_MESSAGE") &&
    src.includes("FAVORITE_WRITE_FAILED_MESSAGE") &&
    !src.includes('outcome === "skipped"'),
);

check("all_call_sites_reason_aware", handlesBoth, "detail + search favorites");

check(
  "success_emphasis_only_on_confirmed",
  pages.every(
    (src) =>
      src.includes('case "saved"') &&
      src.includes('case "removed"') &&
      src.includes("setFavoriteEmphasis") || src.includes("setEmphasisKey"),
  ),
  "success branches",
);

check(
  "identity_unchanged",
  actions.includes("item_type") && actions.includes("item_slug") && actions.includes("user_favorites"),
  "user_favorites mutation",
);

check(
  "reconcile_exhaustive_switch",
  favorite.includes("switch (result.reason)") &&
    favorite.includes('case "write_failed"') &&
    favorite.includes('case "unauthenticated"'),
  "reconcileFavorite",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `favorite outcomes ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
