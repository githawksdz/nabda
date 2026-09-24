"use client";

import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ClinicalUpdates } from "@/components/home/ClinicalUpdates";
import { ClinicalWatchSection } from "@/components/home/ClinicalWatchSection";
import { FrequentScoresGrid } from "@/components/home/FrequentScoresGrid";
import { HomeIdentityBar } from "@/components/home/HomeIdentityBar";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { InsightHookCard } from "@/components/home/InsightHookCard";
import { OfflinePackCard } from "@/components/home/OfflinePackCard";
import { PersonalizedHeroCard } from "@/components/home/PersonalizedHeroCard";
import { ProAdvancedTools } from "@/components/home/ProAdvancedTools";
import { ProInsightHookCard } from "@/components/home/ProInsightHookCard";
import { ProUpsellCard } from "@/components/home/ProUpsellCard";
import { ProfileCompletionCard } from "@/components/home/ProfileCompletionCard";
import { RecommendedForYou } from "@/components/home/RecommendedForYou";
import { StarterRecommendations } from "@/components/home/StarterRecommendations";
import { UsefulScoresGrid } from "@/components/home/UsefulScoresGrid";
import {
  freemiumSearchChips,
  incompleteSearchChips,
} from "@/lib/home/home-ui-config";
import { getHomeDemoFixturesSync } from "@/lib/demo-fixtures/load";
import type { HomeMode, HomeUpdate, HomeUser, ScoreShortcut } from "@/types/home";

type HomeDashboardProps = {
  mode: HomeMode;
  user: HomeUser;
  scores?: ScoreShortcut[];
  updates?: HomeUpdate[];
};

export function HomeDashboard({
  mode,
  user,
  scores,
  updates,
}: HomeDashboardProps) {
  const [hideReward, setHideReward] = useState(false);
  const chips =
    mode === "incomplete"
      ? incompleteSearchChips
      : mode === "freemium-complete"
        ? freemiumSearchChips
        : [];
  const demo = getHomeDemoFixturesSync();
  const useful = scores !== undefined ? scores : demo?.usefulScores ?? [];
  const clinicalUpdates =
    updates !== undefined ? updates : demo?.incompleteUpdates ?? [];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <HomeIdentityBar user={user} mode={mode} />

        {mode === "incomplete" && !hideReward ? (
          <ProfileCompletionCard onDefer={() => setHideReward(true)} />
        ) : null}

        <HomeSearchBar mode={mode} chips={chips} />

        {mode === "incomplete" ? (
          <>
            {demo ? (
              <StarterRecommendations rows={demo.starterRecommendations} />
            ) : null}
            <ClinicalUpdates updates={clinicalUpdates} />
            <InsightHookCard />
          </>
        ) : null}

        {mode === "freemium-complete" ? (
          <>
            {demo ? (
              <PersonalizedHeroCard update={demo.featuredPourVous} />
            ) : null}
            <UsefulScoresGrid scores={useful} />
            {demo ? (
              <RecommendedForYou rows={demo.gardeRecommendations} />
            ) : null}
            <ProUpsellCard />
          </>
        ) : null}

        {mode === "pro-practitioner" ? (
          <>
            {demo ? (
              <OfflinePackCard metrics={demo.offlinePackMetrics} />
            ) : null}
            {demo ? (
              <ClinicalWatchSection
                featured={demo.clinicalWatchFeatured}
                secondary={demo.clinicalWatchSecondary}
              />
            ) : null}
            <FrequentScoresGrid
              scores={demo?.frequentScores ?? useful}
            />
            {demo ? <ProAdvancedTools tools={demo.proAdvancedTools} /> : null}
            <ProInsightHookCard />
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
