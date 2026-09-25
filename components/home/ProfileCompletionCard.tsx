"use client";

import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";

type ProfileCompletionCardProps = {
  onDefer: () => void;
  percent?: number;
};

export function ProfileCompletionCard({
  onDefer,
  percent,
}: ProfileCompletionCardProps) {
  const shown =
    typeof percent === "number" ? Math.min(100, Math.max(0, percent)) : null;

  return (
    <Surface variant="muted" as="aside" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-headline-sm">{PROFILE_COPY.completionTitle}</h2>
          <p className="mt-1 text-body-sm text-text-secondary">
            {PROFILE_COPY.completionBody}
          </p>
        </div>
        {shown != null ? (
          <p className="shrink-0 text-label-md text-text-secondary">
            {shown}&nbsp;%
          </p>
        ) : null}
      </div>
      {shown != null ? (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-container-high"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
          aria-label="Progression du profil"
        >
          <div
            className="h-full rounded-full bg-action-primary"
            style={{ width: `${shown}%` }}
          />
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button href="/onboarding/personalisation" className="flex-1">
          {PROFILE_COPY.completionCta}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onDefer}>
          {PROFILE_COPY.completionDefer}
        </Button>
      </div>
    </Surface>
  );
}
