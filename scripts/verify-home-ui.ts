/**
 * Static checks for the homepage composition and campaign resolution.
 */
import fs from "node:fs";
import path from "node:path";
import type { Calculator } from "@/types/content";
import type { ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";
import type { ClinicalFeedItem } from "@/lib/home/clinical-feed";
import { sortClinicalFeed } from "@/lib/home/clinical-feed";
import { isFeaturedScoreCalculator } from "@/lib/home/featured-scores";
import {
  HOME_FREQUENT_DISPLAY_LIMIT,
  buildHomeFrequentRows,
  scoreContentKey,
} from "@/lib/home/frequent-items";
import {
  remainingStepsLabel,
  resolveHomeCampaign,
} from "@/lib/home/home-campaigns";
import { toClinicalFeedItems } from "@/lib/home/map-clinical-feed";
import { featuredCalculatorsToScoreShortcuts } from "@/lib/home/mappers";
import { latestClinicalResume } from "@/lib/home/resume";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const dashboard = read("components/home/HomeDashboard.tsx");
const resume = read("components/home/HomeResumeSection.tsx");
const clinical = read("components/home/HomeClinicalSection.tsx");
const identity = read("components/home/HomeIdentityBar.tsx");
const page = read("app/(doctor)/home/page.tsx");
const mappers = read("lib/home/mappers.ts");
const frequentItems = read("lib/home/frequent-items.ts");
const catalogApi = read("features/home/api.ts");
const chrome = read("lib/home/home-ui-config.ts");

const order = [
  "HomeIdentityBar",
  "HomeResumeSection",
  "HomeClinicalSection",
];

const identityIndex = dashboard.indexOf("<HomeIdentityBar");
const resumeIndex = dashboard.indexOf("<HomeResumeSection");
const promoSlotIndex = dashboard.indexOf("<HomePromotionalSlotView");
const homePromoView = read("components/promotions/HomePromotionalSlotView.tsx");

let last = -1;
for (const name of order) {
  const index = dashboard.indexOf(`<${name}`);
  check(`order_${name}`, index > last, name);
  last = index;
}

check(
  "no_home_search_or_module_chips",
  !dashboard.includes("HomeSearchBar") &&
    !dashboard.includes("FilterChip") &&
    !clinical.includes('href="/drugs"') &&
    !clinical.includes('href="/calculators"') &&
    !resume.includes('href="/drugs"') &&
    !resume.includes('href="/calculators"'),
  "home shell",
);

check(
  "resume_clinical_empty_copy",
  chrome.includes("Aucun protocole récent") &&
    chrome.includes("Les protocoles que vous ouvrez apparaîtront ici.") &&
    resume.includes("HOME_CHROME.resumeEmptyTitle") &&
    resume.includes("categoryLabel"),
  "HomeResumeSection.tsx",
);

check(
  "clinical_sort_control",
  clinical.includes("CLINICAL_FEED_SORTS") &&
    chrome.includes("Afficher par") &&
    clinical.includes("HOME_CHROME.clinicalPrompt") &&
    clinical.includes("<select"),
  "HomeClinicalSection.tsx",
);

check(
  "no_legacy_home_upsell",
  !dashboard.includes("ProUpsellCard") &&
    !dashboard.includes("OfflinePackCard") &&
    !dashboard.includes("proVariant"),
  "HomeDashboard.tsx",
);

check(
  "home_promo_after_greeting",
  identityIndex >= 0 && promoSlotIndex > identityIndex,
  "promotional slot after HomeIdentityBar",
);

check(
  "home_mutually_exclusive_promo_kinds",
  dashboard.includes("promotionalSlot") &&
    dashboard.includes("<HomePromotionalSlotView") &&
    homePromoView.includes('slot.kind === "profile"') &&
    homePromoView.includes('slot.kind === "pain-point"'),
  "HomeDashboard.tsx",
);

check(
  "home_promo_after_resume",
  resumeIndex > 0 && promoSlotIndex > resumeIndex,
  "promo after resume",
);

check(
  "home_resolves_promotion_server_side",
  page.includes("buildHomePromotionalSlot") && page.includes("getProfileSummary"),
  "app/(doctor)/home/page.tsx",
);

check(
  "identity_mentions_mode",
  identity.includes("usageModeLabel") && identity.includes("HOME_CHROME.greeting"),
  "HomeIdentityBar.tsx",
);

check(
  "no_new_home_fetch",
  !dashboard.includes("fetch(") && !page.includes("fetch("),
  "home fetch",
);

check(
  "home_loads_clinical_catalog",
  page.includes("getHomeClinicalCatalog") &&
    page.includes("latestClinicalResume") &&
    !page.includes("getFeaturedCalculators"),
  "app/(doctor)/home/page.tsx",
);

check(
  "clinical_catalog_skips_tools",
  catalogApi.includes("getHomeClinicalCatalog") &&
    !catalogApi.slice(catalogApi.indexOf("function getHomeClinicalCatalog")).includes('from("drugs")') &&
    !catalogApi.slice(catalogApi.indexOf("function getHomeClinicalCatalog")).includes('from("calculators")') &&
    !catalogApi.slice(catalogApi.indexOf("function getHomeClinicalCatalog")).includes('from("cat_maps")'),
  "features/home/api.ts",
);

check(
  "frequent_helper_still_scores_only",
  frequentItems.includes("featured scores only") &&
    mappers.includes("isFeaturedScoreCalculator"),
  "legacy frequent helper",
);

function history(partial: Partial<HistoryItem> & Pick<HistoryItem, "id" | "entityType" | "entitySlug" | "title" | "href">): HistoryItem {
  return {
    subtitle: "",
    viewedAt: new Date().toISOString(),
    ...partial,
  };
}

const resumed = latestClinicalResume([
  history({
    id: "drug",
    entityType: "drug",
    entitySlug: "amoxicilline",
    title: "Amoxicilline",
    href: "/drugs/amoxicilline",
  }),
  history({
    id: "score",
    entityType: "calculator",
    entitySlug: "glasgow",
    title: "Glasgow",
    href: "/calculators/glasgow",
  }),
  history({
    id: "protocol",
    entityType: "protocol",
    entitySlug: "douleur-thoracique",
    title: "Douleur thoracique",
    href: "/protocols/douleur-thoracique",
    categorySlug: "cardiologie",
  }),
]);

check(
  "resume_skips_drugs_and_scores",
  resumed?.id === "protocol" && resumed.categorySlug === "cardiologie",
  "latestClinicalResume",
);

check(
  "resume_empty_without_clinical",
  latestClinicalResume([
    history({
      id: "score",
      entityType: "calculator",
      entitySlug: "glasgow",
      title: "Glasgow",
      href: "/calculators/glasgow",
    }),
  ]) === null,
  "latestClinicalResume empty",
);

const mappedClinical = toClinicalFeedItems([
  {
    id: "drug-1",
    kind: "drug",
    title: "Amoxicilline",
    slug: "amoxicilline",
  },
  {
    id: "score-1",
    kind: "calculator",
    title: "Glasgow",
    slug: "glasgow",
  },
  {
    id: "proto-1",
    kind: "protocol",
    title: "Syndrome coronarien",
    slug: "sca",
    categorySlug: "cardiologie",
    publishedAt: "2026-09-20T00:00:00Z",
    featured: false,
  },
]);

check(
  "clinical_mapper_drops_tools",
  mappedClinical.length === 1 &&
    mappedClinical[0]?.kind === "protocol" &&
    mappedClinical[0]?.categoryLabel === "Cardiologie" &&
    mappedClinical[0]?.href === "/protocols/sca",
  "toClinicalFeedItems",
);

function clinicalItem(
  partial: Partial<ClinicalFeedItem> & Pick<ClinicalFeedItem, "id" | "title">,
): ClinicalFeedItem {
  return {
    kind: "protocol",
    kindLabel: "Protocole",
    href: `/protocols/${partial.id}`,
    publishedAt: null,
    featured: false,
    priority: 0,
    ...partial,
  };
}

const now = Date.parse("2026-09-26T12:00:00Z");
const sortedNew = sortClinicalFeed(
  [
    clinicalItem({
      id: "old",
      title: "Ancien",
      publishedAt: "2026-01-01T00:00:00Z",
      featured: true,
    }),
    clinicalItem({
      id: "fresh",
      title: "Récent",
      publishedAt: "2026-09-25T00:00:00Z",
    }),
  ],
  "new",
  now,
);
const sortedHot = sortClinicalFeed(
  [
    clinicalItem({
      id: "plain",
      title: "Récent",
      publishedAt: "2026-09-25T00:00:00Z",
    }),
    clinicalItem({
      id: "featured",
      title: "À la une",
      publishedAt: "2026-06-01T00:00:00Z",
      featured: true,
    }),
  ],
  "hot",
  now,
);

check("clinical_new_is_recent", sortedNew[0]?.id === "fresh", "sort new");
check("clinical_hot_prefers_featured", sortedHot[0]?.id === "featured", "sort hot");

const studentRentree = resolveHomeCampaign("pro-upsell", {
  now: new Date("2026-09-26T12:00:00Z"),
  plan: "freemium",
  profession: "student",
  usageMode: "learning",
});
const studentWinter = resolveHomeCampaign("pro-upsell", {
  now: new Date("2026-01-10T12:00:00Z"),
  plan: "freemium",
  profession: "student",
  usageMode: "learning",
});
const shiftWinter = resolveHomeCampaign("pro-upsell", {
  now: new Date("2026-01-10T12:00:00Z"),
  plan: "freemium",
  profession: "intern",
  usageMode: "shift",
});
const emergencyDay = resolveHomeCampaign("pro-upsell", {
  now: new Date("2026-05-27T12:00:00Z"),
  plan: "freemium",
  profession: "generalist",
  usageMode: "consultation",
});
const proPlan = resolveHomeCampaign("pro-upsell", {
  now: new Date("2026-09-26T12:00:00Z"),
  plan: "pro",
  profession: "student",
});
const profileOffer = resolveHomeCampaign("profile-offer", {
  now: new Date("2026-09-26T12:00:00Z"),
  plan: "freemium",
  profession: "student",
  tokens: { remainingLabel: remainingStepsLabel(2) },
});

check(
  "campaign_changes_with_period",
  studentRentree?.id === "pro-rentree-student" && studentWinter?.id === "pro-student",
  "student rentrée vs hiver",
);
check(
  "campaign_changes_with_mode",
  shiftWinter?.id === "pro-hiver-shift" && shiftWinter.id !== studentWinter?.id,
  "garde en hiver",
);
check(
  "campaign_event_overrides_category",
  emergencyDay?.id === "pro-journee-urgence",
  "event window",
);
check("campaign_hidden_for_pro", proPlan === null, "pro plan");
check(
  "campaign_fills_tokens",
  profileOffer?.id === "profile-rentree" &&
    profileOffer.offerLabel === "−15 %" &&
    profileOffer.body.includes("2 étapes") &&
    !profileOffer.body.includes("{remainingLabel}") &&
    !profileOffer.title.includes("{offer}"),
  "profile offer tokens",
);

function score(partial: Partial<ScoreShortcut> & Pick<ScoreShortcut, "id" | "slug" | "title" | "href">): ScoreShortcut {
  return {
    contentType: "calculator",
    catalogType: "score",
    subtitle: "Score clinique",
    icon: "calculator",
    ...partial,
  };
}

const recentProtocol = history({
  id: "h1",
  entityType: "protocol",
  entitySlug: "douleur-thoracique",
  title: "Douleur thoracique",
  href: "/protocols/douleur-thoracique",
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
  [recentProtocol, recentCalc],
  [featuredGlasgow, featuredWells],
);

check(
  "frequent_recents_first",
  mixedRows[0]?.title === recentProtocol.title &&
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
