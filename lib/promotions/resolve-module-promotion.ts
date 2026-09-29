import { canRenderProCouponCard } from "@/lib/promotions/pro-coupon-guards";
import { isProPlanSlug } from "@/lib/promotions/pro-plan";
import type { ProCouponCampaign, ProPainPointVariant } from "@/lib/promotions/types";

export type ModuleListPromotionSlot =
  | { kind: "coupon"; campaign: ProCouponCampaign }
  | { kind: "pain-point"; variant: ProPainPointVariant }
  | null;

export type ResolveModuleListPromotionInput = {
  planSlug: string | null;
  campaign: ProCouponCampaign | null;
  variant: ProPainPointVariant;
};

/**
 * Module/index lists: one coupon when a genuine campaign exists,
 * otherwise the contextual Pro card for eligible free users.
 */
export function resolveModuleListPromotion(
  input: ResolveModuleListPromotionInput,
): ModuleListPromotionSlot {
  if (isProPlanSlug(input.planSlug)) {
    return null;
  }

  if (input.campaign && canRenderProCouponCard(input.campaign)) {
    return { kind: "coupon", campaign: input.campaign };
  }

  if (input.variant.onboardingHref) {
    return { kind: "pain-point", variant: input.variant };
  }

  return null;
}
