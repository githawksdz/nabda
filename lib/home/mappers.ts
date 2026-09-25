import { resolveCalculatorSlug } from "@/lib/calculators/calculator-slugs";
import type { Calculator, HomeFeedItem } from "@/types/content";
import type { HomeUpdate, ScoreShortcut } from "@/types/home";
import { homeFeaturedCalculatorType, isFeaturedScoreCalculator } from "@/lib/home/featured-scores";

const CALCULATOR_ICONS: Record<string, string> = {
  glasgow: "brain",
  "cockcroft-gault": "droplets",
  "wells-ep": "wind",
  "curb-65": "wind",
  "sofa-qsofa": "activity",
  "chads-vasc": "heart-pulse",
  nihss: "brain",
};

export function calculatorToScoreShortcut(calculator: Calculator): ScoreShortcut {
  const slug = resolveCalculatorSlug(calculator.slug);
  return {
    id: calculator.id,
    slug,
    contentType: "calculator",
    catalogType: homeFeaturedCalculatorType(calculator),
    title: calculator.short_title || calculator.title,
    subtitle: calculator.usage_context || calculator.description || "",
    href: `/calculators/${slug}`,
    icon: CALCULATOR_ICONS[calculator.slug] ?? CALCULATOR_ICONS[slug] ?? "calculator",
  };
}

/** Published featured calculators limited to clinical score catalog types. */
export function featuredCalculatorsToScoreShortcuts(
  calculators: Calculator[],
): ScoreShortcut[] {
  return calculators.filter(isFeaturedScoreCalculator).map(calculatorToScoreShortcut);
}

export function feedItemToHomeUpdate(item: HomeFeedItem): HomeUpdate {
  return {
    id: item.id,
    label: item.label ?? undefined,
    title: item.title,
    description: item.description ?? undefined,
    category: item.category_slug ?? undefined,
    href: hrefForTarget(item.target_type, item.target_slug),
    meta: item.category_slug ?? undefined,
  };
}

function hrefForTarget(type: string | null, slug: string | null) {
  if (!type || type === "none") {
    return "/home";
  }
  if (type === "premium") {
    return "/offline";
  }
  if (type === "offline") {
    return "/offline";
  }
  if (type === "profile") {
    return "/profile";
  }
  if (!slug) {
    return "/search";
  }
  if (type === "protocol") {
    return `/protocols/${slug}`;
  }
  if (type === "cat") {
    return `/cat/${slug}`;
  }
  if (type === "calculator") {
    return `/calculators/${slug}`;
  }
  if (type === "drug") {
    return `/drugs/${slug}`;
  }
  return "/search";
}
