import Link from "next/link";
import { CatIcon } from "../cat-icons";
import type { CatCard } from "@/types/cat";

type CatPinnedCardProps = {
  card: CatCard;
};

export function CatPinnedCard({ card }: CatPinnedCardProps) {
  return (
    <Link
      href={card.href}
      className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm active:scale-[0.99]"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
        <CatIcon name={card.iconName ?? "git-branch"} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium">{card.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {card.meta ??
            [card.categoryLabel, card.specialtyLabel, card.timeLabel]
              .filter(Boolean)
              .join(" · ")}
        </span>
      </span>
      {card.statusLabel ? (
        <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
          {card.statusLabel}
        </span>
      ) : null}
    </Link>
  );
}
