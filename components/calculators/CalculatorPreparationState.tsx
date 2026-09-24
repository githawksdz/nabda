"use client";

import Link from "next/link";
import { Bell, BellOff, ChevronRight, FileText } from "lucide-react";
import { StatusChip } from "@/components/content-detail/StatusChip";
import { cn } from "@/lib/utils";
import type {
  CalculatorSummary,
  CalculatorVariablePreview,
  LinkedCalculatorResource,
} from "@/types/calculators";

type CalculatorPreparationStateProps = {
  calculator?: CalculatorSummary;
  missing?: boolean;
  versionLabel?: string;
  statusLabel?: string;
  noticeTitle: string;
  noticeBody: string;
  variablesTitle?: string;
  variables?: CalculatorVariablePreview[];
  resourcesTitle?: string;
  resources?: LinkedCalculatorResource[];
  notified: boolean;
  onNotify: () => void;
};

export function CalculatorPreparationState({
  calculator,
  missing = false,
  versionLabel,
  statusLabel = "En préparation",
  noticeTitle,
  noticeBody,
  variablesTitle,
  variables = [],
  resourcesTitle = "Ressources immédiates",
  resources = [],
  notified,
  onNotify,
}: CalculatorPreparationStateProps) {
  const title = missing
    ? "Calculateur introuvable"
    : (calculator?.listTitle ?? calculator?.name ?? "Calculateur");
  const subtitle = missing
    ? "Cet outil n'est pas encore disponible dans le catalogue Nabda."
    : (calculator?.description ?? "");
  const meta = [calculator?.categoryLabel, versionLabel]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
        {meta ? (
          <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
            {meta}
          </p>
        ) : (
          <p className="text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
            Calculateur
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusChip label={statusLabel} />
        </div>
        <h1 className="mt-2 text-headline-md">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-body-sm text-on-surface-variant">{subtitle}</p>
        ) : null}
      </section>

      <section className="rounded-2xl bg-surface-container-low p-4">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-2.5 py-1 text-label-sm text-on-surface-variant">
          <span className="size-1.5 animate-pulse rounded-full bg-secondary" />
          Saisie désactivée
        </p>
        <h2 className="mt-3 text-headline-sm">{noticeTitle}</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">{noticeBody}</p>
      </section>

      {variables.length > 0 ? (
        <section>
          <h2 className="text-headline-sm">
            {variablesTitle ?? `Variables cliniques du score (${variables.length})`}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {variables.map((variable) => (
              <li
                key={variable.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-lowest px-3.5 py-3 shadow-sm"
              >
                <span className="text-body-sm">{variable.label}</span>
                <span className="shrink-0 text-label-sm text-on-surface-variant">
                  {variable.points}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {resources.length > 0 ? (
        <section>
          <h2 className="text-headline-sm">{resourcesTitle}</h2>
          <div className="mt-3 flex flex-col gap-2">
            {resources.map((resource) => {
              const inner = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low">
                    <FileText
                      className="size-4 text-on-surface"
                      strokeWidth={1.75}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-md font-medium">
                      {resource.title}
                    </span>
                    {resource.subtitle ? (
                      <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                        {resource.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-outline"
                    strokeWidth={1.75}
                  />
                </>
              );

              if (!resource.href || resource.disabled) {
                return (
                  <div
                    key={resource.id}
                    className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3.5"
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={resource.id}
                  href={resource.href}
                  className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3.5 shadow-sm active:scale-[0.99]"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-2">
        {!missing ? (
          <button
            type="button"
            onClick={onNotify}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-4 text-label-md",
              notified
                ? "bg-surface-container-high text-on-surface"
                : "bg-primary text-on-primary",
            )}
          >
            {notified ? (
              <BellOff className="size-4" strokeWidth={1.75} />
            ) : (
              <Bell className="size-4" strokeWidth={1.75} />
            )}
            {notified ? "Alerte programmée" : "Me notifier dès validation"}
          </button>
        ) : null}
        <Link
          href="/calculators"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-container-low px-4 text-label-md text-on-surface"
        >
          Retour aux calculateurs
        </Link>
      </div>
    </div>
  );
}
