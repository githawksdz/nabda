import type { Calculator, HomeFeedItem } from "@/types/content";
import type { HomeUpdate, ScoreShortcut } from "@/types/home";

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
  return {
    id: calculator.id,
    title: calculator.short_title || calculator.title,
    subtitle: calculator.usage_context || calculator.description || "",
    href: `/calculators/${calculator.slug}`,
    icon: CALCULATOR_ICONS[calculator.slug] ?? "calculator",
  };
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
    return "/premium";
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
