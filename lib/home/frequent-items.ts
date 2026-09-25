import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { RecommendationRow, ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";

/** Matches existing Souvent utilisés list cap. */
export const HOME_FREQUENT_DISPLAY_LIMIT = 6;

const TYPE_ICON: Record<HistoryItem["entityType"], string> = {
  cat: "git-branch",
  protocol: "file",
  calculator: "calculator",
  drug: "pill",
};

export function historyContentKey(item: HistoryItem): string {
  return `${item.entityType}:${item.entitySlug}`;
}

export function scoreContentKey(score: ScoreShortcut): string {
  return `calculator:${score.slug}`;
}

function uniqueRecents(items: HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>();
  const unique: HistoryItem[] = [];
  for (const item of items) {
    const key = historyContentKey(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

function historyToRow(item: HistoryItem): RecommendationRow {
  return {
    id: item.id,
    title: item.title,
    specialty: item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType],
    typeLabel: ENTITY_TYPE_LABELS[item.entityType],
    href: item.href,
    icon: TYPE_ICON[item.entityType],
  };
}

function scoreToRow(score: ScoreShortcut): RecommendationRow {
  return {
    id: score.id,
    title: score.title,
    specialty: score.subtitle,
    typeLabel: "Score",
    href: score.href,
    icon: score.icon || "calculator",
  };
}

/**
 * Souvent utilisés = recent history first, then featured scores only.
 * Never uses generic featured calculators as fallback.
 */
export function buildHomeFrequentRows(
  recents: HistoryItem[],
  featuredScores: ScoreShortcut[],
): RecommendationRow[] {
  const fromHistory = uniqueRecents(recents)
    .slice(0, HOME_FREQUENT_DISPLAY_LIMIT)
    .map(historyToRow);

  const recentKeys = new Set(
    uniqueRecents(recents)
      .slice(0, HOME_FREQUENT_DISPLAY_LIMIT)
      .map(historyContentKey),
  );

  const fallbackScores = featuredScores
    .filter((score) => !recentKeys.has(scoreContentKey(score)))
    .slice(0, Math.max(0, HOME_FREQUENT_DISPLAY_LIMIT - fromHistory.length))
    .map(scoreToRow);

  return [...fromHistory, ...fallbackScores].slice(0, HOME_FREQUENT_DISPLAY_LIMIT);
}
