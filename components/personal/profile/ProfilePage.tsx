"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { AccountSection } from "./AccountSection";
import { PlanCard } from "./PlanCard";
import { PreferenceToggleRow } from "./PreferenceToggleRow";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { ProfileIdentityCard } from "./ProfileIdentityCard";
import {
  ProfileSectionList,
  ProfileSectionRow,
} from "./ProfileSectionList";
import { PersonalizationSheet } from "./PersonalizationSheet";
import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";
import { mapPlanPresentation } from "@/lib/personal/personal-mappers";
import {
  draftFromProfile,
  isProfileIncomplete,
  labelsFromSpecialtyIds,
  withComputedCompletion,
} from "@/lib/personal/profile-completion";
import type { PersonalizationDraft, PersonalDataSource, UserProfileSummary } from "@/types/personal";
import { saveCatUpdatesPreference } from "@/lib/personal/personal-actions";

type ProfilePageProps = {
  profile: UserProfileSummary;
  completeRequested?: boolean;
  personalization?: PersonalizationDraft;
  source?: PersonalDataSource;
};

export function ProfilePage({
  profile,
  completeRequested = false,
  personalization,
  source = "mock",
}: ProfilePageProps) {
  const router = useRouter();
  const [hideCompletion, setHideCompletion] = useState(false);
  const [catUpdates, setCatUpdates] = useState(
    profile.catUpdatesEnabled !== false,
  );
  const [catUpdatesSaving, setCatUpdatesSaving] = useState(false);
  const [catUpdatesError, setCatUpdatesError] = useState<string | null>(null);
  const [draft, setDraft] = useState(() =>
    draftFromProfile(profile, personalization),
  );
  const [savedProfile, setSavedProfile] = useState<UserProfileSummary | null>(
    null,
  );
  const visibleProfile = savedProfile ?? profile;
  const plan = useMemo(
    () =>
      mapPlanPresentation(visibleProfile.planSlug, visibleProfile.planStatus),
    [visibleProfile.planSlug, visibleProfile.planStatus],
  );
  const incomplete = isProfileIncomplete(visibleProfile);
  const showCompletion =
    !hideCompletion && incomplete && !completeRequested;

  const practiceItems = [
    {
      id: "profession",
      label: "Profession",
      value: visibleProfile.profession ?? PROFILE_COPY.unsetValue,
      href: PROFILE_COPY.completionHref,
    },
    {
      id: "interests",
      label: "Spécialités d’intérêt",
      value:
        visibleProfile.specialtyInterests.length > 0
          ? visibleProfile.specialtyInterests.join(" · ")
          : PROFILE_COPY.unsetValue,
      href: PROFILE_COPY.completionHref,
    },
    {
      id: "usage",
      label: "Mode d’utilisation",
      value: visibleProfile.usageMode ?? PROFILE_COPY.unsetValue,
      href: PROFILE_COPY.completionHref,
    },
    {
      id: "experience",
      label: PROFILE_COPY.experienceLabel,
      value: visibleProfile.experienceLevel ?? PROFILE_COPY.unsetValue,
    },
    {
      id: "region",
      label: PROFILE_COPY.regionLabel,
      value: visibleProfile.region ?? PROFILE_COPY.unsetValue,
    },
    {
      id: "institution",
      label: PROFILE_COPY.institutionLabel,
      value: visibleProfile.institution ?? PROFILE_COPY.unsetValue,
    },
    {
      id: "practice-context",
      label: PROFILE_COPY.practiceContextLabel,
      value: visibleProfile.practiceContext ?? PROFILE_COPY.unsetValue,
    },
  ];

  function closeSheet() {
    router.replace("/profile", { scroll: false });
    router.refresh();
  }

  function handleSaved(next: PersonalizationDraft) {
    setDraft(next);
    const specialtyLabels = labelsFromSpecialtyIds(next.specialties);
    setSavedProfile(
      withComputedCompletion({
        ...visibleProfile,
        specialtyInterests:
          specialtyLabels.length > 0
            ? specialtyLabels
            : visibleProfile.specialtyInterests,
        profileCompleted: true,
        onboardingCompleted: visibleProfile.onboardingCompleted,
      }),
    );
    setHideCompletion(true);
  }

  async function updateCatUpdates(next: boolean) {
    setCatUpdates(next);
    setCatUpdatesError(null);
    if (source !== "db") {
      return;
    }
    setCatUpdatesSaving(true);
    const result = await saveCatUpdatesPreference(next);
    setCatUpdatesSaving(false);
    if (!result.ok) {
      setCatUpdatesError(result.message ?? PROFILE_COPY.catUpdatesError);
    }
  }

  return (
    <AppShell
      title={PROFILE_COPY.title}
      navVariant="text"
      frameClassName="max-w-[390px]"
      avatarDot={incomplete}
    >
      <div
        className="flex flex-col gap-5 pt-2"
        data-complete={completeRequested ? "1" : undefined}
      >
        <section className="flex flex-col gap-0.5">
          <p className="text-label-sm text-on-surface-variant">
            {PROFILE_COPY.contextEyebrow}
          </p>
          <p className="text-body-md text-on-surface-variant">
            {PROFILE_COPY.contextSubtitle}
          </p>
        </section>

        <ProfileIdentityCard profile={visibleProfile} />

        {showCompletion ? (
          <ProfileCompletionCard onDefer={() => setHideCompletion(true)} />
        ) : null}

        <PlanCard plan={plan} />

        <ProfileSectionList
          title={PROFILE_COPY.practiceTitle}
          items={practiceItems}
        />

        <section>
          <h3 className="mb-2 text-headline-sm">
            {PROFILE_COPY.preferencesTitle}
          </h3>
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <PreferenceToggleRow
              label={PROFILE_COPY.catUpdatesLabel}
              checked={catUpdates}
              onChange={(next) => void updateCatUpdates(next)}
              disabled={catUpdatesSaving}
            />
            <div className="ml-4 h-px bg-surface-variant" />
            <ProfileSectionRow
              item={{
                id: "offline",
                label: PROFILE_COPY.offlineCacheLabel,
                value: "Ouvrir",
                href: "/offline",
              }}
            />
            <div className="ml-4 h-px bg-surface-variant" />
            <ProfileSectionRow
              item={{
                id: "language",
                label: PROFILE_COPY.languageLabel,
                value: visibleProfile.language ?? PROFILE_COPY.languageValue,
              }}
            />
            <div className="ml-4 h-px bg-surface-variant" />
            <ProfileSectionRow
              item={{
                id: "display",
                label: PROFILE_COPY.displayLabel,
                value: visibleProfile.appearance ?? PROFILE_COPY.displayValue,
              }}
            />
          </div>
          {catUpdatesError ? (
            <p className="mt-2 px-1 text-body-sm text-on-surface-variant">
              {catUpdatesError}
            </p>
          ) : null}
        </section>

        <AccountSection />
      </div>

      <PersonalizationSheet
        key={completeRequested ? "open" : "closed"}
        open={completeRequested}
        onOpenChange={(next) => {
          if (!next && completeRequested) {
            closeSheet();
          }
        }}
        initialDraft={draft}
        onSaved={handleSaved}
      />
    </AppShell>
  );
}
