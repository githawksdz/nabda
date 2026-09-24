import Link from "next/link";
import { Calculator } from "lucide-react";
import { HomeIcon } from "@/components/home/home-icons";
import type { ScoreShortcut } from "@/types/home";

type ScoreCardProps = {
  score: ScoreShortcut;
  variant?: "useful" | "frequent";
};

export function ScoreCard({ score, variant = "useful" }: ScoreCardProps) {
  return (
    <Link
      href={score.href}
      className="flex min-h-[118px] flex-col rounded-xl bg-surface-container-lowest p-3.5 shadow-sm"
    >
      <span className="flex items-start justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low">
          <HomeIcon name={score.icon} className="size-4 text-on-surface" />
        </span>
        {variant === "useful" ? (
          <Calculator className="size-4 text-on-surface-variant" strokeWidth={1.75} />
        ) : null}
      </span>
      <span className="mt-auto pt-3">
        <span className="block text-body-md font-medium">{score.title}</span>
        <span className="mt-0.5 block text-body-sm text-on-surface-variant">
          {score.subtitle}
        </span>
        {score.actionLabel ? (
          <span className="mt-1.5 block text-label-sm text-on-surface">
            {score.actionLabel}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
