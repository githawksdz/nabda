// Demo-mode fixture only. Do not import from production runtime providers.

import type { ProCouponCampaign } from "@/lib/promotions/types";
import type { ProfileCompletionCardData } from "@/lib/promotions/types";
import { PRO_PAIN_POINT_VARIANTS } from "@/lib/promotions/pain-point-variants";

const DAY_MS = 24 * 60 * 60 * 1000;

export function couponFixtureLongTtl(referenceMs: number): ProCouponCampaign {
  return {
    campaignId: "demo-long",
    eligible: true,
    currentPriceDzd: 250,
    originalPriceDzd: 375,
    discountPercent: 33,
    billingPeriod: "month",
    endsAt: new Date(referenceMs + 3 * DAY_MS).toISOString(),
    termsLabel: "Voir les conditions",
    termsHref: "/pro",
    onboardingHref: "/pro",
    benefitLine: "Protocoles et scores hors connexion",
  };
}

export function couponFixtureShortTtl(referenceMs: number): ProCouponCampaign {
  return {
    campaignId: "demo-short",
    eligible: true,
    currentPriceDzd: 250,
    originalPriceDzd: 375,
    discountPercent: 33,
    billingPeriod: "month",
    endsAt: new Date(referenceMs + 11 * 60 * 60 * 1000 + 42 * 60 * 1000).toISOString(),
    termsLabel: "Voir les conditions",
    termsHref: "/pro",
    onboardingHref: "/pro",
  };
}

export function couponFixtureExpired(referenceMs: number): ProCouponCampaign {
  return {
    campaignId: "demo-expired",
    eligible: true,
    currentPriceDzd: 250,
    originalPriceDzd: 375,
    discountPercent: 33,
    billingPeriod: "month",
    endsAt: new Date(referenceMs - 60_000).toISOString(),
    termsLabel: "Voir les conditions",
    termsHref: "/pro",
    onboardingHref: "/pro",
  };
}

export const profileCompletionMid: ProfileCompletionCardData = {
  completionPercent: 60,
  completedSteps: [
    { id: "identity", label: "Nom affiché", status: "completed" },
    { id: "profession", label: "Profession", status: "completed" },
    { id: "specialties", label: "Spécialités d’intérêt", status: "completed" },
  ],
  currentStep: { id: "usage", label: "Mode d’utilisation", status: "current" },
  remainingSteps: [
    { id: "onboarding", label: "Finalisation du profil", status: "remaining" },
  ],
  estimatedMinutes: 2,
  verificationStatus: "not_applicable",
  unlockBenefit: "personalization",
  continueHref: "/profile?complete=1",
};

export const profileCompletionAlmostDone: ProfileCompletionCardData = {
  ...profileCompletionMid,
  completionPercent: 80,
  completedSteps: [
    ...profileCompletionMid.completedSteps,
    { id: "usage", label: "Mode d’utilisation", status: "completed" },
  ],
  currentStep: {
    id: "onboarding",
    label: "Finalisation du profil",
    status: "current",
  },
  remainingSteps: [],
  estimatedMinutes: 1,
};

export const profileVerificationMid: ProfileCompletionCardData = {
  ...profileCompletionMid,
  verificationStatus: "in_progress",
  unlockBenefit: "personalization",
};

export const painPointDefault = PRO_PAIN_POINT_VARIANTS.default;
export const painPointOffline = PRO_PAIN_POINT_VARIANTS.offline;
