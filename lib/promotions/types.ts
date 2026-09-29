export type ProCouponCampaign = {
  campaignId: string;
  eligible: boolean;
  currentPriceDzd: number;
  originalPriceDzd: number;
  discountPercent: number;
  billingPeriod: "month" | "year";
  billingDisclosure?: string;
  endsAt: string;
  termsLabel: string;
  termsHref?: string | null;
  onboardingHref: string | null;
  benefitLine?: string;
};

export type ProfileStepStatus = "completed" | "current" | "remaining" | "action_required";

export type ProfileStep = {
  id: string;
  label: string;
  status: ProfileStepStatus;
  message?: string;
};

export type ProfileVerificationStatus =
  | "not_started"
  | "in_progress"
  | "pending_review"
  | "verified"
  | "action_required"
  | "not_applicable";

export type ProfileUnlockBenefit = "drug_dosage" | "personalization" | "offline_pack" | null;

export type ProfileCompletionCardData = {
  completionPercent: number;
  completedSteps: ProfileStep[];
  currentStep: ProfileStep | null;
  remainingSteps: ProfileStep[];
  estimatedMinutes: number;
  verificationStatus: ProfileVerificationStatus;
  unlockBenefit: ProfileUnlockBenefit;
  continueHref: string;
};

export type ProPainPointId =
  | "offline"
  | "clinical_access"
  | "calculators"
  | "shift_preparation"
  | "default";

export type ProPainPointAccent = "teal" | "indigo" | "blue" | "coral";

export type ProPainPointVariant = {
  id: ProPainPointId;
  eyebrow: string;
  headline: string;
  description: string;
  benefits: string[];
  accent: ProPainPointAccent;
  onboardingHref: string | null;
};
