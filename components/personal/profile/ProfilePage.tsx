"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShellChrome } from "@/components/app/shell-chrome";
import { AccountSection } from "./AccountSection";
import { PlanCard } from "./PlanCard";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { ProfileIdentityCard } from "./ProfileIdentityCard";
import { ProfileSectionList } from "./ProfileSectionList";
import { PersonalizationSheet } from "./PersonalizationSheet";
import { ListRow } from "@/components/ui/ListRow";
import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";
import { mapPlanPresentation } from "@/lib/personal/personal-mappers";
import {
  draftFromProfile,
  isProfileIncomplete,
  labelsFromSpecialtyIds,
  withComputedCompletion,
} from "@/lib/personal/profile-completion";
import type { PersonalizationDraft, UserProfileSummary } from "@/types/personal";

type ProfilePageProps = {
  profile: UserProfileSummary;
  completeRequested?: boolean;
  personalization?: PersonalizationDraft;
};

export function ProfilePage({
  profile,
  completeRequested = false,
  personalization,
}: ProfilePageProps) {
  const router = useRouter();
  const [hideCompletion, setHideCompletion] = useState(false);
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

  useShellChrome({ avatarDot: incomplete });

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

  return (
    <>
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

        <PlanCard plan={plan} />

        {showCompletion ? (
          <ProfileCompletionCard
            profile={visibleProfile}
            onDefer={() => setHideCompletion(true)}
          />
        ) : null}

        <ProfileSectionList
          title={PROFILE_COPY.practiceTitle}
          items={practiceItems}
        />

        <section className="flex flex-col gap-2">
          <h2 className="text-headline-sm">Hors-ligne</h2>
          <ListRow
            title={PROFILE_COPY.offlineCacheLabel}
            description="Ouvrir"
            href="/offline"
            className="rounded-[var(--radius)] bg-muted"
          />
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
    </>
  );
}
