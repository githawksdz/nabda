import Link from "next/link";
import { CatIcon } from "./cat-icons";
import { OFFLINE_CALLOUT } from "@/lib/cat/cat-ui-config";

export function CatOfflineCallout() {
  return (
    <section className="rounded-xl bg-surface-container-low p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest">
          <CatIcon name="cloud" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-headline-sm">{OFFLINE_CALLOUT.title}</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {OFFLINE_CALLOUT.body}
          </p>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            {OFFLINE_CALLOUT.meta}
          </p>
          <Link
            href={OFFLINE_CALLOUT.href}
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary"
          >
            {OFFLINE_CALLOUT.actionLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
