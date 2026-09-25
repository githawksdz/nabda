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
import { Surface } from "@/components/ui/Surface";
import {
  freemiumSearchChips,
  incompleteSearchChips,
} from "@/lib/home/home-ui-config";
import type { HomeMode, HomeUpdate, HomeUser, ScoreShortcut } from "@/types/home";
import type { HistoryItem } from "@/types/personal";

type HomeDashboardProps = {
  mode: HomeMode;
  user: HomeUser;
  signedIn?: boolean;
  feedUnavailable?: boolean;
  completionPercent?: number;
  scores?: ScoreShortcut[];
  updates?: HomeUpdate[];
  recents?: HistoryItem[];
};

export function HomeDashboard({
  mode,
  user,
  signedIn = false,
  feedUnavailable = false,
  completionPercent,
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
  const resumeItem = recents[0] ?? null;
  const frequentRecents = recents.slice(resumeItem ? 1 : 0);

  return (
    <AppShell title="Accueil">
      <div className="flex flex-col gap-6 pt-1 lg:gap-8">
        <HomeIdentityBar user={user} mode={mode} signedIn={signedIn} />
        <HomeSearchBar chips={chips} />

        {feedUnavailable ? (
          <Surface variant="muted" className="py-3" role="status">
            <p className="text-body-sm text-text-secondary">
              Les contenus récents n&apos;ont pas pu être chargés. Réessayez dans
              un instant.
            </p>
          </Surface>
        ) : null}

        <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
          <HomeResumeSection item={resumeItem} />
          <HomeFrequentSection recents={frequentRecents} featuredScores={scores} />
        </div>

        <ClinicalUpdates updates={updates} />

        <div className="layout-reading flex flex-col gap-4">
          {signedIn && mode === "incomplete" && !hideReward ? (
            <ProfileCompletionCard
              onDefer={() => setHideReward(true)}
              percent={completionPercent}
            />
          ) : null}
          {mode === "freemium-complete" ? <ProUpsellCard /> : null}
          {mode === "pro-practitioner" ? <OfflinePackCard /> : null}
        </div>
      </div>
    </AppShell>
  );
}
