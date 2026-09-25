import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { ContentRow } from "@/components/home/cards/ContentRow";
import { buildHomeFrequentRows } from "@/lib/home/frequent-items";
import type { ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";

type HomeFrequentSectionProps = {
  recents: HistoryItem[];
  featuredScores: ScoreShortcut[];
};

export function HomeFrequentSection({
  recents,
  featuredScores,
}: HomeFrequentSectionProps) {
  const rows = buildHomeFrequentRows(recents, featuredScores);

  return (
    <section>
      <h2 className="text-headline-sm">Souvent utilisés</h2>
      <div className="mt-3">
        {rows.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {rows.map((row) => (
              <li key={row.id}>
                <ContentRow row={row} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            compact
            headingLevel="p"
            title="Aucun outil fréquent"
            description="Ouvrez une CAT, un protocole, un médicament ou un score pour les retrouver ici."
          />
        )}
        {rows.length === 0 ? (
          <nav
            aria-label="Explorer les modules"
            className="mt-3 flex max-w-full flex-wrap gap-2"
          >
            <FilterChip href="/cat">CAT</FilterChip>
            <FilterChip href="/protocols">Protocoles</FilterChip>
            <FilterChip href="/drugs">Médicaments</FilterChip>
            <FilterChip href="/calculators">Scores</FilterChip>
          </nav>
        ) : null}
      </div>
    </section>
  );
}
