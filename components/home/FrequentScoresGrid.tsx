import { ScoreCard } from "@/components/home/cards/ScoreCard";
import { StatusChip } from "@/components/home/cards/StatusChip";
import Link from "next/link";
import type { ScoreShortcut } from "@/types/home";

type FrequentScoresGridProps = {
  scores: ScoreShortcut[];
};

export function FrequentScoresGrid({ scores }: FrequentScoresGridProps) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm">Scores fréquents en garde</h2>
          <StatusChip>Épinglés</StatusChip>
        </div>
        <Link href="/calculators" className="text-label-md text-on-surface-variant">
          Modifier
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {scores.map((score) => (
          <ScoreCard key={score.id} score={score} variant="frequent" />
        ))}
      </div>
    </section>
  );
}
