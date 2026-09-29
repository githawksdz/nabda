import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";
import {
  computeProfileCompletion,
  profileCompletionChecks,
  type ProfileCompletionInput,
} from "@/lib/personal/profile-completion";
import type {
  ProfileCompletionCardData,
  ProfileStep,
  ProfileUnlockBenefit,
  ProfileVerificationStatus,
} from "@/lib/promotions/types";
import type { UserProfileSummary } from "@/types/personal";

const STEP_DEFINITIONS: Array<{
  id: string;
  label: string;
  checkIndex: number;
}> = [
  { id: "identity", label: "Nom affiché", checkIndex: 0 },
  { id: "profession", label: "Profession", checkIndex: 1 },
  { id: "specialties", label: "Spécialités d’intérêt", checkIndex: 2 },
  { id: "usage", label: "Mode d’utilisation", checkIndex: 3 },
  { id: "onboarding", label: "Finalisation du profil", checkIndex: 4 },
];

function stepsFromChecks(checks: boolean[]): ProfileStep[] {
  const firstIncomplete = checks.findIndex((done) => !done);
  return STEP_DEFINITIONS.map((def, index) => {
    const done = checks[def.checkIndex];
    let status: ProfileStep["status"] = "remaining";
    if (done) {
      status = "completed";
    } else if (index === firstIncomplete) {
      status = "current";
    }
    return {
      id: def.id,
      label: def.label,
      status,
    };
  });
}

function estimateMinutes(remainingCount: number): number {
  if (remainingCount <= 0) {
    return 0;
  }
  return Math.min(8, Math.max(1, remainingCount));
}

function resolveUnlockBenefit(): ProfileUnlockBenefit {
  return "personalization";
}

/**
 * Maps server-owned profile fields to card data.
 * Professional verification is not inferred from completion percent alone.
 */
export function buildProfileCompletionCardData(
  profile: UserProfileSummary,
  options?: {
    verificationStatus?: ProfileVerificationStatus;
    continueHref?: string;
  },
): ProfileCompletionCardData | null {
  if (profile.profileCompleted || profile.completionPercent >= 100) {
    return null;
  }

  const input: ProfileCompletionInput = {
    fullName: profile.fullName,
    profession: profile.profession,
    specialtyInterests: profile.specialtyInterests,
    usageMode: profile.usageMode,
    onboardingCompleted: profile.onboardingCompleted,
    profileCompleted: profile.profileCompleted,
  };

  const progress = computeProfileCompletion(input);
  const checks = profileCompletionChecks(input);
  const steps = stepsFromChecks(checks);
  const completedSteps = steps.filter((step) => step.status === "completed");
  const remainingSteps = steps.filter((step) => step.status === "remaining");
  const currentStep = steps.find((step) => step.status === "current") ?? null;
  const remainingCount = remainingSteps.length + (currentStep ? 1 : 0);

  const verificationStatus: ProfileVerificationStatus =
    options?.verificationStatus ?? "not_applicable";

  return {
    completionPercent: progress.percent,
    completedSteps,
    currentStep,
    remainingSteps,
    estimatedMinutes: estimateMinutes(remainingCount),
    verificationStatus,
    unlockBenefit: resolveUnlockBenefit(),
    continueHref: options?.continueHref ?? PROFILE_COPY.completionHref,
  };
}
