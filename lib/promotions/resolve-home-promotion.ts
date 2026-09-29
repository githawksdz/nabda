import { isProPlanSlug } from "@/lib/promotions/pro-plan";
import type { ProPainPointVariant } from "@/lib/promotions/types";
import type { ProfileCompletionCardData } from "@/lib/promotions/types";

export type HomePromotionalSlot =
  | { kind: "profile"; data: ProfileCompletionCardData }
  | { kind: "pain-point"; variant: ProPainPointVariant }
  | null;

export type ResolveHomePromotionInput = {
  planSlug: string | null;
  profileCard: ProfileCompletionCardData | null;
  painPointVariant: ProPainPointVariant | null;
  /** When true, profile/verification card takes priority over generic Pro pain-point. */
  professionalVerificationIncomplete?: boolean;
};

/**
 * Homepage first promotional slot: at most one card.
 * Priority: incomplete professional verification → incomplete profile → contextual Pro.
 */
export function resolveHomePromotionalSlot(
  input: ResolveHomePromotionInput,
): HomePromotionalSlot {
  if (isProPlanSlug(input.planSlug)) {
    return null;
  }

  if (input.professionalVerificationIncomplete && input.profileCard) {
    return { kind: "profile", data: input.profileCard };
  }

  if (input.profileCard) {
    return { kind: "profile", data: input.profileCard };
  }

  const variant = input.painPointVariant;
  if (variant?.onboardingHref) {
    return { kind: "pain-point", variant };
  }

  return null;
}
