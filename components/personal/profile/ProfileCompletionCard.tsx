import Link from "next/link";
import { PROFILE_COPY } from "@/lib/personal/personal-ui-config";

type ProfileCompletionCardProps = {
  onDefer: () => void;
};

export function ProfileCompletionCard({ onDefer }: ProfileCompletionCardProps) {
  return (
    <section className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <h2 className="text-headline-sm">{PROFILE_COPY.completionTitle}</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {PROFILE_COPY.completionBody}
      </p>
      <p className="mt-2 text-label-sm text-on-surface-variant">
        {PROFILE_COPY.completionPack}
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href={PROFILE_COPY.completionHref}
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-label-md text-on-primary"
        >
          {PROFILE_COPY.completionCta}
        </Link>
        <button
          type="button"
          onClick={onDefer}
          className="flex h-10 flex-1 items-center justify-center rounded-lg bg-surface-container-low text-label-md"
        >
          {PROFILE_COPY.completionDefer}
        </button>
      </div>
    </section>
  );
}
