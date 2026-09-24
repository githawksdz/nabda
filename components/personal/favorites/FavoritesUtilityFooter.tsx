import Link from "next/link";
import { History } from "lucide-react";
import { FAVORITES_COPY } from "@/lib/personal/personal-ui-config";

export function FavoritesUtilityFooter() {
  return (
    <section className="rounded-xl bg-surface-container-low p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container">
          <History className="size-5 text-on-surface" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-md font-medium">Historique</p>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            {FAVORITES_COPY.historyLinkHint}
          </p>
          <Link
            href={FAVORITES_COPY.historyLinkHref}
            className="mt-2 inline-flex h-9 items-center text-label-md text-primary"
          >
            {FAVORITES_COPY.historyLinkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
