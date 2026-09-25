import { CatIcon } from "../cat-icons";
import { DiscoveryListRow } from "@/components/discovery/DiscoveryListRow";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import type { CatCard } from "@/types/cat";

type CatPinnedCardProps = {
  card: CatCard;
};

export function CatPinnedCard({ card }: CatPinnedCardProps) {
  const subtitle =
    card.meta ??
    [card.categoryLabel, card.specialtyLabel, card.timeLabel]
      .filter(Boolean)
      .join(" · ");

  return (
    <DiscoveryListRow
      href={card.href}
      title={card.title}
      typeLabel="CAT"
      subtitle={subtitle}
      statusLabel={card.statusLabel ?? undefined}
      statusTone={
        card.statusLabel ? accessLabelToTone(card.statusLabel) : undefined
      }
      icon={
        <CatIcon name={card.iconName ?? "git-branch"} className="size-4" />
      }
    />
  );
}
