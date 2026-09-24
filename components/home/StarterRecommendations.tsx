import { ContentRow } from "@/components/home/cards/ContentRow";
import { SectionHeader } from "@/components/home/cards/SectionHeader";
import type { RecommendationRow } from "@/types/home";

type StarterRecommendationsProps = {
  rows: RecommendationRow[];
};

export function StarterRecommendations({ rows }: StarterRecommendationsProps) {
  return (
    <section>
      <SectionHeader title="Pour commencer" meta="Guide initial" />
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <ContentRow key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}
