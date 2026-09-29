"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StagingFeedbackLink } from "@/components/app/StagingFeedbackLink";
import { Button } from "@/components/ui/Button";
import {
  CardContent,
  CardFooter,
  ContentCard,
} from "@/components/ui/ContentCard";
import { Alert, AlertDescription } from "@/components/shadcn/alert";
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
        <Alert>
          <AlertDescription>{note}</AlertDescription>
        </Alert>
      ) : null}

      <div className="px-1">
        <StagingFeedbackLink />
      </div>

      {signOutError ? (
        <Alert variant="destructive">
          <AlertDescription>{signOutError}</AlertDescription>
        </Alert>
      ) : null}

      <ContentCard size="sm">
        {confirming ? (
          <>
            <CardContent>
              <p className="text-body-sm">{PROFILE_COPY.signOutConfirm}</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                onClick={() => void confirmSignOut()}
                disabled={pending}
                loading={pending}
              >
                {PROFILE_COPY.signOutLabel}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                {PROFILE_COPY.signOutCancel}
              </Button>
            </CardFooter>
          </>
        ) : (
          <CardFooter>
            <Button variant="ghost" onClick={() => setConfirming(true)}>
              {PROFILE_COPY.signOutLabel}
            </Button>
          </CardFooter>
        )}
      </ContentCard>
    </div>
  );
}
