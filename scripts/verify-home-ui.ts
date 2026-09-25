/**
 * Static checks for homepage composition (UI-3 layout + Souvent utilisés data).
 */
import fs from "node:fs";
import path from "node:path";
import type { Calculator } from "@/types/content";
import type { ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";
import { isFeaturedScoreCalculator } from "@/lib/home/featured-scores";
import {
  HOME_FREQUENT_DISPLAY_LIMIT,
  buildHomeFrequentRows,
  scoreContentKey,
} from "@/lib/home/frequent-items";
import { featuredCalculatorsToScoreShortcuts } from "@/lib/home/mappers";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const dashboard = read("components/home/HomeDashboard.tsx");
const search = read("components/home/HomeSearchBar.tsx");
const resume = read("components/home/HomeResumeSection.tsx");
const frequent = read("components/home/HomeFrequentSection.tsx");
const profile = read("components/home/ProfileCompletionCard.tsx");
const page = read("app/home/page.tsx");
const mappers = read("lib/home/mappers.ts");
const frequentItems = read("lib/home/frequent-items.ts");

const order = [
  "HomeIdentityBar",
  "HomeSearchBar",
  "HomeResumeSection",
  "HomeFrequentSection",
  "ClinicalUpdates",
  "ProfileCompletionCard",
  "ProUpsellCard",
  "OfflinePackCard",
];

let last = -1;
for (const name of order) {
  const index = dashboard.indexOf(`<${name}`);
  check(`order_${name}`, index > last, name);
  last = index;
}

check(
  "no_demo_fixture_on_home",
  !dashboard.includes("getHomeDemoFixturesSync") &&
    !dashboard.includes("usefulScores"),
  "HomeDashboard.tsx",
);

check(
  "search_placeholder",
  search.includes("DCI, marque, CAT, protocole, score…") ||
    read("components/search/SearchPage.tsx").includes("SEARCH_FIELD_PLACEHOLDER"),
  "HomeSearchBar or SearchPage",
);

check(
  "search_route_preserved",
  search.includes("router.push") &&
    search.includes("/search") &&
    search.includes("encodeURIComponent"),
  "HomeSearchBar.tsx",
);

check(
  "resume_empty_copy",
  resume.includes("Aucun contenu récent") &&
    resume.includes("Les fiches que vous consultez apparaîtront ici."),
  "HomeResumeSection.tsx",
);

check(
  "frequent_empty_copy",
  frequent.includes("Aucun outil fréquent") &&
    frequent.includes('href="/cat"') &&
    frequent.includes('href="/protocols"') &&
    frequent.includes('href="/drugs"') &&
    frequent.includes('href="/calculators"'),
  "HomeFrequentSection.tsx",
);

check(
  "no_gift_copy_on_home_card",
  !profile.includes("cadeau de bienvenue"),
  "ProfileCompletionCard.tsx",
);

check(
  "profile_card_below_clinical",
  dashboard.indexOf("ClinicalUpdates") <
    dashboard.indexOf("ProfileCompletionCard"),
  "HomeDashboard.tsx",
);

check(
  "no_new_home_fetch",
  !dashboard.includes("fetch(") &&
    !search.includes("fetch(") &&
    !page.includes("fetch("),
  "home fetch",
);

check(
  "existing_home_data_fns",
  page.includes("getHistoryItems") &&
    page.includes("getFeaturedCalculators") &&
    page.includes("getHomeFeedItems"),
  "app/home/page.tsx",
);

check(
  "frequent_uses_build_helper",
  frequent.includes("buildHomeFrequentRows") &&
    frequentItems.includes("featured scores only"),
  "Souvent utilisés composition helper",
);

check(
  "home_maps_featured_to_scores_only",
  page.includes("featuredCalculatorsToScoreShortcuts") &&
    mappers.includes("isFeaturedScoreCalculator"),
  "app/home/page.tsx + mappers",
);

check(
  "no_second_featured_fetch",
  (page.match(/getFeaturedCalculators\(\)/g) ?? []).length === 1,
  "single getFeaturedCalculators() call",
);

function history(partial: Partial<HistoryItem> & Pick<HistoryItem, "id" | "entityType" | "entitySlug" | "title" | "href">): HistoryItem {
  return {
    subtitle: "",
    viewedAt: new Date().toISOString(),
    ...partial,
  };
}

function score(partial: Partial<ScoreShortcut> & Pick<ScoreShortcut, "id" | "slug" | "title" | "href">): ScoreShortcut {
  return {
    contentType: "calculator",
    catalogType: "score",
    subtitle: "Score clinique",
    icon: "calculator",
    ...partial,
  };
}

const recentCat = history({
  id: "h1",
  entityType: "cat",
  entitySlug: "douleur-thoracique",
  title: "Douleur thoracique",
  href: "/cat/douleur-thoracique",
});

const recentCalc = history({
  id: "h2",
  entityType: "calculator",
  entitySlug: "glasgow",
  title: "Glasgow",
  href: "/calculators/glasgow",
});

const featuredGlasgow = score({
  id: "s-glasgow",
  slug: "glasgow",
  title: "Glasgow (GCS)",
  href: "/calculators/glasgow",
});

const featuredWells = score({
  id: "s-wells",
  slug: "wells-ep",
  title: "Wells EP",
  href: "/calculators/wells-ep",
});

const mixedRows = buildHomeFrequentRows(
  [recentCat, recentCalc],
  [featuredGlasgow, featuredWells],
);

check(
  "frequent_recents_first",
  mixedRows[0]?.title === recentCat.title &&
    mixedRows[1]?.title === recentCalc.title,
  "history ordering preserved",
);

check(
  "frequent_dedupes_featured_score",
  mixedRows.filter((row) => row.href === featuredGlasgow.href).length === 1,
  "glasgow not duplicated",
);

check(
  "frequent_fills_with_remaining_scores",
  mixedRows.length === 3 && mixedRows[2]?.href === featuredWells.href,
  "wells fills remaining slot",
);

const fullHistory = Array.from({ length: HOME_FREQUENT_DISPLAY_LIMIT }, (_, index) =>
  history({
    id: `h-${index}`,
    entityType: "protocol",
    entitySlug: `proto-${index}`,
    title: `Protocole ${index}`,
    href: `/protocols/proto-${index}`,
  }),
);

const capped = buildHomeFrequentRows(fullHistory, [featuredWells]);
check(
  "frequent_respects_limit",
  capped.length === HOME_FREQUENT_DISPLAY_LIMIT &&
    !capped.some((row) => row.href === featuredWells.href),
  `limit ${HOME_FREQUENT_DISPLAY_LIMIT}`,
);

const scoresOnly = buildHomeFrequentRows([], [featuredWells, featuredGlasgow]);
check(
  "frequent_empty_history_shows_scores",
  scoresOnly.length === 2 && scoresOnly[0]?.href === featuredWells.href,
  "featured scores when no history",
);

check(
  "frequent_empty_state_rows",
  buildHomeFrequentRows([], []).length === 0,
  "no fake rows",
);

check(
  "frequent_stable_score_key",
  scoreContentKey(featuredGlasgow) === "calculator:glasgow",
  "scoreContentKey",
);

function mockCalculator(
  slug: string,
  formulaType: string | null,
): Calculator {
  return {
    id: `calc-${slug}`,
    slug,
    title: slug,
    short_title: slug,
    description: null,
    category_slug: null,
    status: "published",
    review_status: "approved",
    visibility: "public",
    formula_json: formulaType ? { formulaType } : {},
    is_featured: true,
    usage_context: null,
    search_text: slug,
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
  } as Calculator;
}

check(
  "featured_score_filter_includes_clinical_scores",
  isFeaturedScoreCalculator(mockCalculator("glasgow", null)),
  "infer score slug",
);

check(
  "featured_score_filter_excludes_formula_engine",
  !isFeaturedScoreCalculator(
    mockCalculator("cockcroft-gault", "single_equation"),
  ),
  "formula calculators excluded from fallback pool",
);

const mappedShortcuts = featuredCalculatorsToScoreShortcuts([
  mockCalculator("glasgow", null),
  mockCalculator("cockcroft-gault", "single_equation"),
]);
check(
  "mapper_keeps_scores_only",
  mappedShortcuts.length === 1 &&
    mappedShortcuts[0]?.slug === "glasgow-coma-scale-score-gcs",
  "featuredCalculatorsToScoreShortcuts",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `home ui ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
