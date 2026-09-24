import { ArrowRight } from "lucide-react";
import { SectionHeader } from "@/components/home/cards/SectionHeader";
import { StatusChip } from "@/components/home/cards/StatusChip";
import Link from "next/link";
import type { HomeUpdate } from "@/types/home";

type PersonalizedHeroCardProps = {
  update: HomeUpdate;
};

export function PersonalizedHeroCard({ update }: PersonalizedHeroCardProps) {
  return (
    <section>
      <SectionHeader title="Pour vous" meta="Mise à jour J-1" />
      <Link
        href={update.href}
        className="block rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
      >
        <StatusChip>{update.label}</StatusChip>
        {update.meta ? (
          <p className="mt-3 text-label-sm text-on-surface-variant">{update.meta}</p>
        ) : null}
        <h3 className="mt-1 text-headline-sm">{update.title}</h3>
        {update.description ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {update.description}
          </p>
        ) : null}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-label-sm text-on-surface-variant">{update.footer}</p>
          <ArrowRight className="size-4" />
        </div>
      </Link>
    </section>
  );
}
