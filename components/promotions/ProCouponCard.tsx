"use client";

import Link from "next/link";
import { Badge } from "@/components/shadcn/badge";
import { ProCtaButton } from "@/components/promotions/ProCtaButton";
import { ProPlanBenefitList } from "@/components/promotions/ProPlanBenefitList";
import {
  ProPlanCardShell,
  ProPlanSparkleIcon,
} from "@/components/promotions/ProPlanCardShell";
import { canRenderProCouponCard } from "@/lib/promotions/pro-coupon-guards";
import {
  formatCouponPriceLine,
  formatDzdAmount,
} from "@/lib/promotions/format-price";
import { splitCouponPriceLine } from "@/lib/promotions/promo-headline-emphasis";
import type { ProCouponCampaign } from "@/lib/promotions/types";
import { useOfferCountdown } from "@/lib/promotions/use-offer-countdown";
import { cn } from "@/lib/utils";

type ProCouponCardProps = {
  campaign: ProCouponCampaign;
  className?: string;
  timeZone?: string;
  onExpired?: () => void;
};

function ProCouponCardInner({
  campaign,
  className,
  timeZone,
  onExpired,
}: ProCouponCardProps) {
  const countdown = useOfferCountdown({
    endsAt: campaign.endsAt,
    timeZone,
    onExpired,
  });

  if (countdown.kind === "expired") {
    return null;
  }

  const currentLine = formatCouponPriceLine(
    campaign.currentPriceDzd,
    campaign.billingPeriod,
  );
  const originalLine = formatCouponPriceLine(
    campaign.originalPriceDzd,
    campaign.billingPeriod,
  );
  const { amount, period } = splitCouponPriceLine(currentLine);
  const benefit =
    campaign.benefitLine ?? "Protocoles et scores hors connexion";
  const href = campaign.onboardingHref!;
  const titleId = `pro-coupon-${campaign.campaignId}-title`;
  const annualDisclosure =
    campaign.billingPeriod === "year"
      ? campaign.billingDisclosure ?? "Facturé annuellement"
      : null;

  const benefitItems = annualDisclosure
    ? [
        benefit,
        `Équivaut à ${formatDzdAmount(campaign.currentPriceDzd)} DA/mois · ${annualDisclosure}`,
      ]
    : [benefit];

  return (
    <ProPlanCardShell className={className} labelledBy={titleId}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProPlanSparkleIcon />
          <div className="min-w-0">
            <h3
              id={titleId}
              className="text-xl font-medium tracking-tight text-white"
            >
              Nabda{" "}
              <span className="promo-pro-emphasis">Pro</span>
            </h3>
            <p className="text-xs text-neutral-500">Offre limitée</p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="h-5 shrink-0 border border-white/20 bg-white/10 px-2 text-[11px] font-semibold text-white"
        >
          −{campaign.discountPercent} %
        </Badge>
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight tabular-nums text-white">
            {amount}
          </span>
          {period ? (
            <span className="text-sm text-neutral-400">{period}</span>
          ) : null}
        </div>
        <p className="text-xs text-neutral-500">
          <span className="tabular-nums line-through decoration-neutral-500">
            au lieu de {originalLine}
          </span>
        </p>
        <p
          className="text-xs font-medium tabular-nums text-neutral-400"
          suppressHydrationWarning
        >
          {countdown.label}
        </p>
      </div>

      <ProPlanBenefitList items={benefitItems} label="Avantages Nabda Pro" />

      <div className={cn("mt-6 flex flex-col gap-2.5")}>
        <ProCtaButton href={href} className="promo-cta--block">
          Profiter de l’offre
        </ProCtaButton>
        {campaign.termsHref ? (
          <Link
            href={campaign.termsHref}
            className="text-center text-label-sm font-semibold text-neutral-400 underline-offset-2 hover:text-white hover:underline"
          >
            {campaign.termsLabel}
          </Link>
        ) : null}
      </div>
    </ProPlanCardShell>
  );
}

export function ProCouponCard(props: ProCouponCardProps) {
  if (!canRenderProCouponCard(props.campaign)) {
    return null;
  }
  return <ProCouponCardInner {...props} />;
}
