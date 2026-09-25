import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatIcon } from "../cat-icons";
import { cn } from "@/lib/utils";
import type { CatCard } from "@/types/cat";

type CatEmergencyCardProps = {
  card: CatCard;
};

export function CatEmergencyCard({ card }: CatEmergencyCardProps) {
  const urgent = card.urgency === "vital" || card.urgency === "urgent";

  return (
    <Link
      href={card.href}
      data-category={card.subFilter}
      className="motion-surface flex items-start gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm active:bg-surface-container"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          urgent
            ? "bg-error/10 text-error"
            : "bg-surface-container-low text-on-surface",
        )}
      >
        <CatIcon name={card.iconName ?? "git-branch"} className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          {card.statusLabel ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-label-sm",
                urgent
                  ? "bg-error-container text-error"
                  : "bg-surface-container-high text-on-surface-variant",
              )}
            >
              {card.statusLabel}
            </span>
          ) : null}
          {card.timeLabel ? (
            <span className="text-label-sm text-on-surface-variant">
              {card.timeLabel}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block text-body-md font-medium">{card.title}</span>
        <span className="mt-1 flex flex-wrap gap-x-2 text-label-sm text-on-surface-variant">
          <span>{card.categoryLabel}</span>
        </span>
      </span>
      <ChevronRight
        className="mt-1 size-5 shrink-0 text-outline"
        strokeWidth={1.75}
      />
    </Link>
  );
}
