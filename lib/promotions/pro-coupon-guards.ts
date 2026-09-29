import { isOfferExpired } from "@/lib/promotions/countdown";
import type { ProCouponCampaign } from "@/lib/promotions/types";

export function canRenderProCouponCard(
  campaign: ProCouponCampaign,
  nowMs = Date.now(),
): boolean {
  if (!campaign.eligible) {
    return false;
  }
  if (isOfferExpired(campaign.endsAt, nowMs)) {
    return false;
  }
  if (!campaign.onboardingHref) {
    return false;
  }
  return true;
}
