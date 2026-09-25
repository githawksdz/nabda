"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StagingFeedbackLink } from "@/components/app/StagingFeedbackLink";
import { ProfileSectionList } from "./ProfileSectionList";
import { signOut } from "@/features/auth/api";
import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function AccountSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function confirmSignOut() {
    setPending(true);
    setSignOutError(null);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await signOut();
        if (error) {
          setSignOutError(PROFILE_COPY.signOutError);
          setPending(false);
          setConfirming(false);
          return;
        }
      }
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.warn("profile signOut", error);
      setSignOutError(PROFILE_COPY.signOutError);
      setPending(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ProfileSectionList
        title={PROFILE_COPY.accountTitle}
        items={[
          {
            id: "security",
            label: PROFILE_COPY.securityLabel,
            href: PROFILE_COPY.securityHref,
          },
          {
            id: "privacy",
            label: PROFILE_COPY.privacyLabel,
            onClick: () =>
              setNote((current) =>
                current === PROFILE_COPY.privacyNote
                  ? null
                  : PROFILE_COPY.privacyNote,
              ),
          },
          {
            id: "support",
            label: PROFILE_COPY.supportLabel,
            onClick: () =>
              setNote((current) =>
                current === PROFILE_COPY.supportNote
                  ? null
                  : PROFILE_COPY.supportNote,
              ),
          },
        ]}
      />

      {note ? (
        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">
          {note}
        </p>
      ) : null}

      <div className="px-1">
        <StagingFeedbackLink />
      </div>

      {signOutError ? (
        <p className="rounded-xl bg-surface-container-low px-4 py-3 text-body-sm text-on-surface-variant">
          {signOutError}
        </p>
      ) : null}

      <section className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
        {confirming ? (
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-on-surface">
              {PROFILE_COPY.signOutConfirm}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void confirmSignOut()}
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary disabled:opacity-50"
              >
                {PROFILE_COPY.signOutLabel}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-lg bg-surface-container-high px-3 text-label-md"
              >
                {PROFILE_COPY.signOutCancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-label-md text-on-surface-variant"
          >
            {PROFILE_COPY.signOutLabel}
          </button>
        )}
      </section>
    </div>
  );
}
