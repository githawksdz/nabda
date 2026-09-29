"use client";

import Link from "next/link";
import {
  Baby,
  Droplets,
  FlaskConical,
  HeartPulse,
  Pill,
  Sparkles,
  Syringe,
  Thermometer,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import { CategoryWatermark } from "@/components/discovery/CategoryIcon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { drugClassLabels } from "@/lib/drugs/class-labels";
import { drugIndexStatusLabel } from "@/lib/drugs/status-labels";
import { specialtyConfig } from "@/lib/ui/content-card-config";
import { hasVisited, resolveListSurface } from "@/lib/ui/content-list-state";
import { cn } from "@/lib/utils";
import type { DrugCatalogCardItem, DrugSummary } from "@/types/drugs";

type DrugIconProps = {
  name: string;
  className?: string;
};

export function DrugIcon({ name, className }: DrugIconProps) {
  const props = { className, strokeWidth: 1.75 as const };
  switch (name) {
    case "pill":
      return <Pill {...props} />;
    case "thermometer":
      return <Thermometer {...props} />;
    case "syringe":
      return <Syringe {...props} />;
    case "droplets":
      return <Droplets {...props} />;
    case "flask":
      return <FlaskConical {...props} />;
    case "wind":
      return <Wind {...props} />;
    case "heart-pulse":
      return <HeartPulse {...props} />;
    case "baby":
      return <Baby {...props} />;
    default:
      return <Pill {...props} />;
  }
}

const SURFACE_CLASS = {
  new: "bg-list-new-bg",
  unread: "bg-list-unread-bg",
  read: "bg-list-read-bg",
} as const;

type DrugListRowProps = {
  drug: DrugSummary | DrugCatalogCardItem;
  visitedKeys?: string[];
};

function isCatalogCard(
  drug: DrugSummary | DrugCatalogCardItem,
): drug is DrugCatalogCardItem {
  return "commercialName" in drug && typeof drug.commercialName === "string";
}

export function DrugListRow({ drug, visitedKeys = [] }: DrugListRowProps) {
  const statusLabel = drugIndexStatusLabel(drug);
  const surface = resolveListSurface({
    isNew: drug.isNew,
    visited: hasVisited(visitedKeys, "drug", drug.slug),
  });
  const commercialName = isCatalogCard(drug)
    ? drug.commercialName
    : (drug.brandNames?.[0] ?? drug.displayName ?? drug.genericName);
  const dciLabel = isCatalogCard(drug)
    ? drug.dciLabel
    : commercialName.trim().toLowerCase() === drug.genericName.trim().toLowerCase()
      ? null
      : drug.genericName;
  const labels = drugClassLabels(drug);
  const categorySlug = drug.categorySlug;
  const accent =
    specialtyConfig(categorySlug)?.accent ?? "var(--specialty-neutral)";
  const isPro = drug.visibility === "premium" || statusLabel === "Pro";
  const unavailable =
    Boolean(statusLabel) &&
    !isPro &&
    statusLabel !== "Publié" &&
    statusLabel !== "Gratuit";

  return (
    <Link
      href={drug.href}
      data-list-state={surface}
      className={cn(
        "relative isolate flex aspect-square min-h-0 flex-col overflow-hidden rounded-xl p-3 ring-1 ring-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        SURFACE_CLASS[surface],
      )}
    >
      <CategoryWatermark slug={categorySlug} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <h3 className="font-heading text-headline-sm [overflow-wrap:anywhere]">
              {commercialName}
            </h3>
            {dciLabel ? (
              <span className="text-label-sm text-muted-foreground">
                · {dciLabel}
              </span>
            ) : null}
          </div>
          {isPro ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-status-premium">
              <Sparkles className="size-3" aria-hidden />
              <span className="sr-only">Pro</span>
            </span>
          ) : unavailable ? (
            <StatusBadge className="shrink-0" tone="muted">
              {statusLabel}
            </StatusBadge>
          ) : null}
        </div>
        {labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="h-5 max-w-full border px-1.5 text-[10px] font-medium"
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 28%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${accent} 12%, var(--surface-elevated))`,
                  color: `color-mix(in srgb, ${accent} 78%, var(--text-primary))`,
                }}
              >
                <span className="truncate">{label}</span>
              </Badge>
            ))}
          </div>
        ) : null}
        {drug.description ? (
          <p className="mt-auto line-clamp-3 text-body-sm text-muted-foreground">
            {drug.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
