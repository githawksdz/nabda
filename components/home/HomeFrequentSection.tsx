import Link from "next/link";
import { ContentRow } from "@/components/home/cards/ContentRow";
import { ENTITY_TYPE_LABELS } from "@/lib/personal/personal-mappers";
import type { HistoryItem } from "@/types/personal";
import type { RecommendationRow, ScoreShortcut } from "@/types/home";

type HomeFrequentSectionProps = {
  recents: HistoryItem[];
  scores: ScoreShortcut[];
};

const TYPE_ICON: Record<HistoryItem["entityType"], string> = {
  cat: "git-branch",
  protocol: "file",
  calculator: "calculator",
  drug: "pill",
};

function uniqueRecents(items: HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>();
  const unique: HistoryItem[] = [];
  for (const item of items) {
    const key = `${item.entityType}:${item.entitySlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

export function HomeFrequentSection({ recents, scores }: HomeFrequentSectionProps) {
  const fromHistory = uniqueRecents(recents).slice(0, 6).map(
    (item): RecommendationRow => ({
      id: item.id,
      title: item.title,
      specialty: item.kindLabel ?? ENTITY_TYPE_LABELS[item.entityType],
      typeLabel: ENTITY_TYPE_LABELS[item.entityType],
      href: item.href,
      icon: TYPE_ICON[item.entityType],
    }),
  );
  const usedHrefs = new Set(fromHistory.map((row) => row.href));
  const fromScores = scores
    .filter((score) => !usedHrefs.has(score.href))
    .slice(0, Math.max(0, 6 - fromHistory.length))
    .map(
      (score): RecommendationRow => ({
        id: score.id,
        title: score.title,
        specialty: score.subtitle,
        typeLabel: "Score",
        href: score.href,
        icon: score.icon || "calculator",
      }),
    );
  const rows = [...fromHistory, ...fromScores].slice(0, 6);

  return (
    <section>
      <h2 className="mb-3 text-headline-sm">Souvent utilisés</h2>
      {rows.length > 0 ? (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <ContentRow key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-surface-container-low px-4 py-4">
          <p className="text-body-md font-medium">Aucun outil fréquent</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Ouvrez une CAT, un protocole, un médicament ou un score pour les
            retrouver ici.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/cat" className="inline-flex min-h-11 items-center text-label-md">
              CAT
            </Link>
            <Link href="/protocols" className="inline-flex min-h-11 items-center text-label-md">
              Protocoles
            </Link>
            <Link href="/drugs" className="inline-flex min-h-11 items-center text-label-md">
              Médicaments
            </Link>
            <Link href="/calculators" className="inline-flex min-h-11 items-center text-label-md">
              Scores
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
