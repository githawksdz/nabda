import { CatEmergencyCard } from "./cards/CatEmergencyCard";
import type { CatCard } from "@/types/cat";

type CatEmergencyListProps = {
  cards: CatCard[];
};

export function CatEmergencyList({ cards }: CatEmergencyListProps) {
  if (cards.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-headline-sm">Arbres de déchocage &amp; Tri rapide</h2>
        <span className="text-label-sm text-on-surface-variant">
          6 prioritaires
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <CatEmergencyCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
