import { HomeDashboard } from "@/components/home/HomeDashboard";
import {
  getFeaturedCalculators,
  getHomeFeedItems,
} from "@/features/home/api";
import { calculatorToScoreShortcut, feedItemToHomeUpdate } from "@/lib/home/mappers";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import { getCurrentProfile } from "@/features/profile/api";
import { resolveHomeMode, resolveHomeUser } from "@/lib/home/resolve-home-state";
import { getHistoryItems } from "@/lib/personal/personal-api";
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

  if (isSupabaseConfigured()) {
    try {
      profile = await getCurrentProfile();
      const plan = await getCurrentUserPlan();
      planSlug = plan?.slug ?? null;

      const [calculators, feed, history] = await Promise.all([
        getFeaturedCalculators(),
        getHomeFeedItems(profile),
        getHistoryItems(),
      ]);

      scores = calculators.map(calculatorToScoreShortcut);
      updates = feed.map(feedItemToHomeUpdate);
      recents = history.items;
    } catch (error) {
      console.warn("Home feed unavailable; showing empty home state.", error);
    }
  }

  const mode = resolveHomeMode(profile, preview, planSlug);
  const user = resolveHomeUser(profile, mode);

  return (
    <HomeDashboard
      mode={mode}
      user={user}
      scores={scores ?? []}
      updates={updates ?? []}
      recents={recents}
    />
  );
}
