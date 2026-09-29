import { Suspense } from "react";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { getHomeClinicalCatalog } from "@/features/home/api";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import { getCurrentProfile } from "@/features/profile/api";
import { resolveHomeMode, resolveHomeUser } from "@/lib/home/resolve-home-state";
import { latestClinicalResume } from "@/lib/home/resume";
import { getHistoryItems, getProfileSummary } from "@/lib/personal/personal-api";
import { buildHomePromotionalSlot } from "@/lib/promotions/build-home-promotion";
import type { HomePromotionalSlot } from "@/lib/promotions/resolve-home-promotion";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ClinicalFeedItem } from "@/lib/home/clinical-feed";
import type { HistoryItem } from "@/types/personal";
import { HomeIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ preview?: string }>;
};

async function HomePageLoader({ searchParams }: HomePageProps) {
  const { preview } = await searchParams;
  let profile = null;
  let planSlug: string | null = null;
  let clinicalItems: ClinicalFeedItem[] = [];
  let recents: HistoryItem[] = [];
  let feedUnavailable = false;
  let promotionalSlot: HomePromotionalSlot = null;

  if (isSupabaseConfigured()) {
    try {
      profile = await getCurrentProfile();
      const plan = await getCurrentUserPlan();
      planSlug = plan?.slug ?? null;

      const [clinical, history, personal] = await Promise.all([
        getHomeClinicalCatalog(profile),
        getHistoryItems(),
        getProfileSummary(),
      ]);

      clinicalItems = clinical;
      recents = history.items;
      promotionalSlot = buildHomePromotionalSlot(personal.profile, planSlug);
    } catch (error) {
      console.warn("Home feed unavailable; showing empty home state.", error);
      feedUnavailable = true;
    }
  }

  const mode = resolveHomeMode(profile, preview, planSlug);
  const user = resolveHomeUser(profile, mode);

  return (
    <HomeDashboard
      user={user}
      feedUnavailable={feedUnavailable}
      resumeItem={latestClinicalResume(recents)}
      clinicalItems={clinicalItems}
      promotionalSlot={promotionalSlot}
    />
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<HomeIndexChrome />}>
      <HomePageLoader searchParams={searchParams} />
    </Suspense>
  );
}
