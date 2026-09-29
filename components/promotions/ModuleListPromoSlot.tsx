import { ProCouponCard } from "@/components/promotions/ProCouponCard";
import { ProPainPointCard } from "@/components/promotions/ProPainPointCard";
import type { ModuleListPromotionSlot } from "@/lib/promotions/resolve-module-promotion";

type ModuleListPromoSlotProps = {
  promotion: ModuleListPromotionSlot;
};

export function ModuleListPromoSlot({ promotion }: ModuleListPromoSlotProps) {
  if (!promotion) {
    return null;
  }

  if (promotion.kind === "coupon") {
    return <ProCouponCard campaign={promotion.campaign} />;
  }

  return <ProPainPointCard variant={promotion.variant} />;
}
