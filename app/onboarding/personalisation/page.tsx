import { redirect } from "next/navigation";
import { PersonalizationFlow } from "@/components/onboarding/personalization/PersonalizationFlow";
import {
  getActiveClinicalInterests,
  getSelectedInterestIds,
  logOnboardingEvent,
} from "@/features/onboarding/api";
import { getCurrentProfile } from "@/features/profile/api";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ClinicalInterest } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PersonalisationPage() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/");
  }

  let interests: ClinicalInterest[] = [];
  try {
    interests = await getActiveClinicalInterests();
  } catch {
    interests = [];
  }

  const selectedInterestIds = await getSelectedInterestIds(profile.id);
  await logOnboardingEvent("personalization_started");

  return (
    <PersonalizationFlow
      initial={{
        interests,
        selectedInterestIds,
        profession: profile.profession,
        usageMode: profile.usage_mode,
        fullName: profile.full_name,
      }}
    />
  );
}
