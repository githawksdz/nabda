"use client";

import Link from "next/link";
import { profileCompletion } from "@/lib/home/home-ui-config";

type ProfileCompletionCardProps = {
  onDefer: () => void;
};

export function ProfileCompletionCard({ onDefer }: ProfileCompletionCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-headline-sm">{profileCompletion.title}</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {profileCompletion.subtitle}
          </p>
        </div>
        <span className="text-data-metric">{profileCompletion.percent}%</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${profileCompletion.percent}%` }}
        />
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        {profileCompletion.meta}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/onboarding/personalisation"
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-label-md text-on-primary"
        >
          Compléter
        </Link>
        <button
          type="button"
          onClick={onDefer}
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-surface-container-low text-label-md"
        >
          Plus tard
        </button>
      </div>
    </section>
  );
}
