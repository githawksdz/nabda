import { getPromotionalCardsDemoFixtures } from "@/lib/demo-fixtures/load";
import { canRenderProCouponCard } from "@/lib/promotions/pro-coupon-guards";
import { isProPlanSlug } from "@/lib/promotions/pro-plan";
import type { ProCouponCampaign } from "@/lib/promotions/types";
import type { SubscriptionPlan } from "@/types/content";

type CouponEnv = {
  NABDA_PRO_COUPON_CAMPAIGN_ID?: string;
  NABDA_PRO_COUPON_CURRENT_DZD?: string;
  NABDA_PRO_COUPON_ORIGINAL_DZD?: string;
  NABDA_PRO_COUPON_ENDS_AT?: string;
  NABDA_PRO_COUPON_PERIOD?: string;
};

export type ResolveProCouponCampaignInput = {
  planSlug: string | null;
  plans: SubscriptionPlan[];
  nowMs: number;
  env: CouponEnv;
  demoCampaign: ProCouponCampaign | null;
};

function parsePositiveInt(value: string | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed);
}

function billingPeriod(value: string | undefined): "month" | "year" {
  return value === "year" || value === "yearly" ? "year" : "month";
}

function campaignFromEnv(env: CouponEnv): ProCouponCampaign | null {
  const endsAt = env.NABDA_PRO_COUPON_ENDS_AT?.trim();
  const currentPriceDzd = parsePositiveInt(env.NABDA_PRO_COUPON_CURRENT_DZD);
  const originalPriceDzd = parsePositiveInt(env.NABDA_PRO_COUPON_ORIGINAL_DZD);
  if (!endsAt || currentPriceDzd == null || originalPriceDzd == null) {
    return null;
  }
  if (originalPriceDzd <= currentPriceDzd) {
    return null;
  }
  if (Number.isNaN(Date.parse(endsAt))) {
    return null;
  }

  return {
    campaignId: env.NABDA_PRO_COUPON_CAMPAIGN_ID?.trim() || "pro-coupon-env",
    eligible: true,
    currentPriceDzd,
    originalPriceDzd,
    discountPercent: Math.round((1 - currentPriceDzd / originalPriceDzd) * 100),
    billingPeriod: billingPeriod(env.NABDA_PRO_COUPON_PERIOD),
    endsAt,
    termsLabel: "Voir les conditions",
    termsHref: "/pro",
    onboardingHref: "/pro",
    benefitLine: "Protocoles et scores hors connexion",
  };
}

function campaignFromPublishedPlan(
  plans: SubscriptionPlan[],
  env: CouponEnv,
): ProCouponCampaign | null {
  const endsAt = env.NABDA_PRO_COUPON_ENDS_AT?.trim();
  if (!endsAt || Number.isNaN(Date.parse(endsAt))) {
    return null;
  }

  const plan = plans.find(
    (item) =>
      item.is_active &&
      item.slug.startsWith("pro") &&
      item.slug !== "freemium" &&
      item.price_dzd != null &&
      item.price_dzd > 0,
  );
  if (!plan || plan.price_dzd == null) {
    return null;
  }

  const originalPriceDzd = parsePositiveInt(env.NABDA_PRO_COUPON_ORIGINAL_DZD);
  if (originalPriceDzd == null || originalPriceDzd <= plan.price_dzd) {
    return null;
  }

  return {
    campaignId: env.NABDA_PRO_COUPON_CAMPAIGN_ID?.trim() || `pro-coupon-${plan.slug}`,
    eligible: true,
    currentPriceDzd: plan.price_dzd,
    originalPriceDzd,
    discountPercent: Math.round((1 - plan.price_dzd / originalPriceDzd) * 100),
    billingPeriod: plan.billing_period === "yearly" ? "year" : "month",
    endsAt,
    termsLabel: "Voir les conditions",
    termsHref: "/pro",
    onboardingHref: "/pro",
    benefitLine: "Protocoles et scores hors connexion",
  };
}

export function resolveProCouponCampaign(
  input: ResolveProCouponCampaignInput,
): ProCouponCampaign | null {
  if (isProPlanSlug(input.planSlug)) {
    return null;
  }

  const candidates = [
    campaignFromEnv(input.env),
    campaignFromPublishedPlan(input.plans, input.env),
    input.demoCampaign,
  ];

  for (const campaign of candidates) {
    if (campaign && canRenderProCouponCard(campaign, input.nowMs)) {
      return campaign;
    }
  }

  return null;
}

export function loadEligibleProCouponCampaign(
  planSlug: string | null,
  plans: SubscriptionPlan[],
): ProCouponCampaign | null {
  const demo = getPromotionalCardsDemoFixtures();
  return resolveProCouponCampaign({
    planSlug,
    plans,
    nowMs: Date.now(),
    env: process.env,
    demoCampaign: demo ? demo.couponFixtureShortTtl(Date.now()) : null,
  });
}
