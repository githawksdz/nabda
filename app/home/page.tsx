import { HomeDashboard } from "@/components/home/HomeDashboard";
import {
  getFeaturedCalculators,
  getHomeFeedItems,
} from "@/features/home/api";
import { featuredCalculatorsToScoreShortcuts, feedItemToHomeUpdate } from "@/lib/home/mappers";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import { getCurrentProfile } from "@/features/profile/api";
import { resolveHomeMode, resolveHomeUser } from "@/lib/home/resolve-home-state";
import { getHistoryItems } from "@/lib/personal/personal-api";
import {
  computeCompletionPercent,
  parseProfilePreferences,
} from "@/lib/personal/profile-completion";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { HistoryItem } from "@/types/personal";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ preview?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { preview } = await searchParams;
  let profile = null;
  let planSlug: string | null = null;
  let scores = undefined;
  let updates = undefined;
  let recents: HistoryItem[] = [];
  let signedIn = false;
  let feedUnavailable = false;
  let completionPercent: number | undefined;

  if (isSupabaseConfigured()) {
    try {
      profile = await getCurrentProfile();
      signedIn = Boolean(profile);
      const plan = await getCurrentUserPlan();
      planSlug = plan?.slug ?? null;

      const [calculators, feed, history] = await Promise.all([
        getFeaturedCalculators(),
        getHomeFeedItems(profile),
        getHistoryItems(),
      ]);

      scores = featuredCalculatorsToScoreShortcuts(calculators);
      updates = feed.map(feedItemToHomeUpdate);
      recents = history.items;

      if (profile) {
        const prefs = parseProfilePreferences(profile.preferences);
        completionPercent = computeCompletionPercent({
          fullName: profile.full_name,
          profession: profile.profession,
          specialtyInterests: prefs.personalization?.specialties ?? [],
          usageMode: profile.usage_mode,
          onboardingCompleted: profile.onboarding_completed,
          profileCompleted: profile.profile_status === "complete",
        });
      }
    } catch (error) {
      console.warn("Home feed unavailable; showing empty home state.", error);
      feedUnavailable = true;
    }
  }

  const mode = resolveHomeMode(profile, preview, planSlug);
  const user = resolveHomeUser(profile, mode);

  return (
    <HomeDashboard
      mode={mode}
      user={user}
      signedIn={signedIn}
      feedUnavailable={feedUnavailable}
      completionPercent={completionPercent}
      scores={scores ?? []}
      updates={updates ?? []}
      recents={recents}
    />
  );
}
