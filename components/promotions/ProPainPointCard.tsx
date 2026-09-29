"use client";

import { ProCtaButton } from "@/components/promotions/ProCtaButton";
import { ProPlanBenefitList } from "@/components/promotions/ProPlanBenefitList";
import {
  ProPlanCardShell,
  ProPlanSparkleIcon,
} from "@/components/promotions/ProPlanCardShell";
import { PromoProHeadline } from "@/components/promotions/PromoProHeadline";
import type { ProPainPointVariant } from "@/lib/promotions/types";
import { cn } from "@/lib/utils";

type ProPainPointCardProps = {
  variant: ProPainPointVariant;
  className?: string;
  /** When false, card is not rendered (e.g. Pro users). */
  show?: boolean;
};

export function ProPainPointCard({
  variant,
  className,
  show = true,
}: ProPainPointCardProps) {
  if (!show || !variant.onboardingHref) {
    return null;
  }

  const benefits = variant.benefits.slice(0, 3);
  const titleId = `pain-point-${variant.id}-title`;

  return (
    <ProPlanCardShell className={className} labelledBy={titleId}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProPlanSparkleIcon />
          <div className="min-w-0">
            <h3 className="text-xl font-medium tracking-tight text-white">
              Nabda{" "}
              <span className="promo-pro-emphasis">Pro</span>
            </h3>
            <p className="text-xs text-neutral-500">{variant.eyebrow}</p>
          </div>
        </div>
        <span
          className="size-5 shrink-0 rounded-full border-2 border-white/30"
          aria-hidden
        />
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <PromoProHeadline id={titleId}>{variant.headline}</PromoProHeadline>
        <p className="max-w-[28rem] text-sm text-pretty text-neutral-400">
          {variant.description}
        </p>
      </div>

      <ProPlanBenefitList items={benefits} />

      <div className={cn("mt-6")}>
        <ProCtaButton href={variant.onboardingHref} className="promo-cta--block">
          Découvrir Nabda Pro
        </ProCtaButton>
      </div>
    </ProPlanCardShell>
  );
}
