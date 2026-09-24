import { CatIcon } from "./cat-icons";
import { CatPinnedCard } from "./cards/CatPinnedCard";
import type { CatCard } from "@/types/cat";

type CatPinnedSectionProps = {
  cards: CatCard[];
};

export function CatPinnedSection({ cards }: CatPinnedSectionProps) {
  if (cards.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CatIcon name="pin" className="size-4 text-on-surface-variant" />
          <h2 className="text-headline-sm">À portée de main</h2>
        </div>
        <span className="text-label-sm text-on-surface-variant">
          Garde en cours
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <CatPinnedCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
