import { getCurrentUserPlan, getSubscriptionPlans } from "@/features/subscriptions/api";
import { loadEligibleProCouponCampaign } from "@/lib/promotions/load-pro-coupon-campaign";
import { selectPainPointVariant } from "@/lib/promotions/pain-point-variants";
import {
  resolveModuleListPromotion,
  type ModuleListPromotionSlot,
} from "@/lib/promotions/resolve-module-promotion";

export type ModuleListPromotionContext =
  | "protocols"
  | "drugs"
  | "calculators";

export async function loadModuleListPromotion(
  module: ModuleListPromotionContext,
): Promise<ModuleListPromotionSlot> {
  try {
    const [current, plans] = await Promise.all([
      getCurrentUserPlan(),
      getSubscriptionPlans(),
    ]);
    const planSlug = current?.slug ?? null;
    const campaign = loadEligibleProCouponCampaign(planSlug, plans);
    const variant = selectPainPointVariant({
      offlineManager: module === "protocols",
      calculatorIndex: module === "calculators",
      attemptedProAction: module === "drugs",
    });
    return resolveModuleListPromotion({ planSlug, campaign, variant });
  } catch (error) {
    console.warn("Module list promotion unavailable.", error);
    return null;
  }
}
