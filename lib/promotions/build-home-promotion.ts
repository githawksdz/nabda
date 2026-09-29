import { isProPlanSlug } from "@/lib/promotions/pro-plan";
import { selectPainPointVariant } from "@/lib/promotions/pain-point-variants";
import { buildProfileCompletionCardData } from "@/lib/promotions/profile-completion-data";
import {
  resolveHomePromotionalSlot,
  type HomePromotionalSlot,
} from "@/lib/promotions/resolve-home-promotion";
import type { UserProfileSummary } from "@/types/personal";

export function buildHomePromotionalSlot(
  profile: UserProfileSummary | null,
  planSlug: string | null,
): HomePromotionalSlot {
  const profileCard = profile ? buildProfileCompletionCardData(profile) : null;
  const painPointVariant = isProPlanSlug(planSlug)
    ? null
    : selectPainPointVariant({
        offlineManager: profile?.usageMode === "shift",
      });

  return resolveHomePromotionalSlot({
    planSlug,
    profileCard,
    painPointVariant,
  });
}
