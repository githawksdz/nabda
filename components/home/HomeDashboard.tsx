"use client";

import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ClinicalUpdates } from "@/components/home/ClinicalUpdates";
import { HomeFrequentSection } from "@/components/home/HomeFrequentSection";
import { HomeIdentityBar } from "@/components/home/HomeIdentityBar";
import { HomeResumeSection } from "@/components/home/HomeResumeSection";
import { HomeSearchBar } from "@/components/home/HomeSearchBar";
import { OfflinePackCard } from "@/components/home/OfflinePackCard";
import { ProUpsellCard } from "@/components/home/ProUpsellCard";
import { ProfileCompletionCard } from "@/components/home/ProfileCompletionCard";
import {
  freemiumSearchChips,
  incompleteSearchChips,
} from "@/lib/home/home-ui-config";
import { getHomeDemoFixturesSync } from "@/lib/demo-fixtures/load";
import type { HomeMode, HomeUpdate, HomeUser, ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";

type HomeDashboardProps = {
  mode: HomeMode;
  user: HomeUser;
  scores?: ScoreShortcut[];
  updates?: HomeUpdate[];
  recents?: HistoryItem[];
};

export function HomeDashboard({
  mode,
  user,
  scores = [],
  updates = [],
  recents = [],
}: HomeDashboardProps) {
  const [hideReward, setHideReward] = useState(false);
  const chips =
    mode === "incomplete"
      ? incompleteSearchChips
      : mode === "freemium-complete"
        ? freemiumSearchChips
        : [];
  const demo = getHomeDemoFixturesSync();
  const resumeItem = recents[0] ?? null;
  const frequentRecents = recents.slice(resumeItem ? 1 : 0);
  const clinicalUpdates = updates;
  const usefulScores = scores.length > 0 ? scores : demo?.usefulScores ?? [];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <HomeIdentityBar user={user} mode={mode} />
        <HomeSearchBar mode={mode} chips={chips} />
        <HomeResumeSection item={resumeItem} />
        <HomeFrequentSection recents={frequentRecents} scores={usefulScores} />
        <ClinicalUpdates updates={clinicalUpdates} />

        {mode === "incomplete" && !hideReward ? (
          <ProfileCompletionCard onDefer={() => setHideReward(true)} />
        ) : null}
        {mode === "freemium-complete" ? <ProUpsellCard /> : null}
        {mode === "pro-practitioner" ? <OfflinePackCard /> : null}
      </div>
    </AppShell>
  );
}
