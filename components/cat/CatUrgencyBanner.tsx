import { CatIcon } from "./cat-icons";
import { URGENCY_BANNER } from "@/lib/cat/cat-ui-config";

export function CatUrgencyBanner() {
  return (
    <section className="rounded-2xl bg-surface-container p-3.5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
          <CatIcon name="zap" className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-headline-sm">{URGENCY_BANNER.title}</h2>
            <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm">
              {URGENCY_BANNER.chip}
            </span>
          </div>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {URGENCY_BANNER.description}
          </p>
        </div>
      </div>
    </section>
  );
}
