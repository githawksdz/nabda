"use client";

import { CatIcon } from "./cat-icons";
import {
  PREPARATION_PANEL,
  UPCOMING_TREES,
} from "@/lib/cat/cat-ui-config";

type CatPreparationPanelProps = {
  suggested: boolean;
  notified: boolean;
  onSuggest: () => void;
  onNotify: () => void;
};

export function CatPreparationPanel({
  suggested,
  notified,
  onSuggest,
  onNotify,
}: CatPreparationPanelProps) {
  return (
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
          {PREPARATION_PANEL.milestone}
        </p>

        <div className="relative mx-auto mt-5 size-16 rounded-full bg-surface-container shadow-inner">
          <CatIcon
            name="git-branch"
            className="absolute inset-0 m-auto size-8 text-on-surface-variant"
          />
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary">
            <CatIcon name="file-pen" className="size-3.5" />
          </span>
        </div>

        <h2 className="mt-4 text-headline-sm">{PREPARATION_PANEL.title}</h2>
        <p className="mx-auto mt-2 max-w-[300px] text-body-sm text-on-surface-variant">
          {PREPARATION_PANEL.subtitle}
        </p>

        <div className="mt-4 rounded-xl bg-surface-container-low p-2 text-left">
          <p className="px-1 pb-2 text-label-sm text-on-surface-variant">
            Prochains arbres validés
          </p>
          <div className="flex flex-wrap gap-1.5">
            {UPCOMING_TREES.map((tree) => (
              <span
                key={tree.id}
                className="inline-flex items-center gap-1 rounded-lg bg-surface-container-lowest px-2 py-1 text-[12px] leading-[16px] text-on-surface"
              >
                <CatIcon name={tree.iconName} className="size-3" />
                {tree.label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {suggested ? (
            <p className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container text-label-md">
              <CatIcon name="sparkles" className="size-4" />
              Demande enregistrée
            </p>
          ) : (
            <button
              type="button"
              onClick={onSuggest}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-label-md text-on-primary"
            >
              <CatIcon name="lightbulb" className="size-4" />
              Suggérer une CAT prioritaire
            </button>
          )}
          <button
            type="button"
            onClick={onNotify}
            className={
              notified
                ? "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-container px-4 text-label-md text-on-primary"
                : "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-surface-container px-4 text-label-md text-on-surface-variant"
            }
          >
            <CatIcon name={notified ? "bell-ring" : "bell"} className="size-4" />
            {notified
              ? "Notification activée pour Dermatologie"
              : "Être notifié de la publication"}
          </button>
        </div>
      </div>
    </section>
  );
}
