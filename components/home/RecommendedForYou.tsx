import { Sparkles } from "lucide-react";
import { ContentRow } from "@/components/home/cards/ContentRow";
import { SectionHeader } from "@/components/home/cards/SectionHeader";
import type { RecommendationRow } from "@/types/home";

type RecommendedForYouProps = {
  rows: RecommendationRow[];
};

export function RecommendedForYou({ rows }: RecommendedForYouProps) {
  return (
    <section>
      <SectionHeader
        title="Recommandé pour votre garde"
        icon={<Sparkles className="size-4" strokeWidth={1.75} />}
      />
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <ContentRow key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}
