import { Bell, BellOff, GitBranch, Lightbulb } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { LinkedContentGrid } from "@/components/content-detail/LinkedContentGrid";
import {
  CAT_MAP_PREPARATION_SUBTITLE,
  CAT_MAP_PREPARATION_TITLE,
} from "@/lib/content-detail/content-detail-ui-config";
import { timelineStatusLabel } from "@/lib/content-detail/status-labels";
import { cn } from "@/lib/utils";
import type { CatDetail } from "@/types/content-detail";

type CatMapPreparationStateProps = {
  detail: CatDetail;
  notified: boolean;
  suggested: boolean;
  onNotify: () => void;
  onSuggest: () => void;
};

export function CatMapPreparationState({
  detail,
  notified,
  suggested,
  onNotify,
  onSuggest,
}: CatMapPreparationStateProps) {
  return (
    <div className="flex flex-col gap-5">
      <section className="relative overflow-hidden rounded-2xl bg-surface-container-lowest px-5 py-6 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-2.5 py-1 text-label-sm uppercase text-on-secondary-container">
            <span className="size-1.5 animate-pulse rounded-full bg-secondary" />
            Structure en préparation
          </p>
          <div className="relative mx-auto mt-5 size-16 rounded-full bg-surface-container shadow-inner">
            <GitBranch className="absolute inset-0 m-auto size-8 text-on-surface-variant" />
          </div>
          <h2 className="mt-4 text-headline-sm">{CAT_MAP_PREPARATION_TITLE}</h2>
          <p className="mx-auto mt-2 max-w-[300px] text-body-sm text-on-surface-variant">
            {CAT_MAP_PREPARATION_SUBTITLE}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-headline-sm">Parcours éditorial</h2>
        <ol className="flex flex-col gap-2">
          {detail.timeline.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm"
            >
              <span className="text-body-sm">{item.title}</span>
              <StatusChip
                label={timelineStatusLabel(item.status)}
                variant={item.status === "created" ? "dark" : "soft"}
              />
            </li>
          ))}
        </ol>
      </section>

      <LinkedContentGrid
        items={detail.linked_tools}
        title="Ressources déjà disponibles"
      />

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onNotify}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-label-md",
            notified
              ? "bg-primary-container text-on-primary"
              : "bg-primary text-on-primary",
          )}
        >
          {notified ? (
            <BellOff className="size-4" strokeWidth={1.75} />
          ) : (
            <Bell className="size-4" strokeWidth={1.75} />
          )}
          {notified ? "Ne plus me prévenir" : "Me prévenir"}
        </button>
        {suggested ? (
          <p className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-surface-container text-label-md">
            <Lightbulb className="size-4" strokeWidth={1.75} />
            Demande enregistrée
          </p>
        ) : (
          <button
            type="button"
            onClick={onSuggest}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-4 text-label-md text-on-surface"
          >
            <Lightbulb className="size-4" strokeWidth={1.75} />
            Suggérer une priorité
          </button>
        )}
      </div>
    </div>
  );
}
