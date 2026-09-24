import { ScoreCard } from "@/components/home/cards/ScoreCard";
import { SectionHeader } from "@/components/home/cards/SectionHeader";
import type { ScoreShortcut } from "@/types/home";

type UsefulScoresGridProps = {
  scores: ScoreShortcut[];
};

export function UsefulScoresGrid({ scores }: UsefulScoresGridProps) {
  return (
    <section>
      <SectionHeader
        title="Scores utiles"
        meta="Voir tout (28)"
        href="/calculators"
      />
      <div className="grid grid-cols-2 gap-2.5">
        {scores.map((score) => (
          <ScoreCard key={score.id} score={score} />
        ))}
      </div>
    </section>
  );
}
