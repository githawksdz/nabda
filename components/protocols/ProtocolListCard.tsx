"use client";

import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/shadcn/badge";
import {
  CategoryIcon,
  CategoryWatermark,
} from "@/components/discovery/CategoryIcon";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  specialtyConfig,
  specialtyConfigs,
} from "@/lib/ui/content-card-config";
import { resolveListSurface } from "@/lib/ui/content-list-state";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import { cn } from "@/lib/utils";

const SURFACE_CLASS = {
  new: "bg-list-new-bg",
  unread: "bg-list-unread-bg",
  read: "bg-list-read-bg",
} as const;

function TitleWithTypeIcon({ title }: { title: string }) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lastWord = words.pop() ?? title;
  const leading = words.join(" ");

  return (
    <>
      {leading ? `${leading} ` : null}
      <span className="whitespace-nowrap">
        {lastWord}
        <FileText
          className="ml-1 inline size-3.5 align-[-0.125em] text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
    </>
  );
}

type ProtocolListCardProps = {
  href: string;
  title: string;
  description?: string;
  categorySlug?: string | null;
  accessTier?: "free" | "pro";
  isNew?: boolean;
  visited?: boolean;
  statusLabel?: string;
  statusTone?: StatusTone;
};

export function ProtocolListCard({
  href,
  title,
  description,
  categorySlug,
  accessTier,
  isNew = false,
  visited = false,
  statusLabel,
  statusTone,
}: ProtocolListCardProps) {
  const surface = resolveListSurface({ isNew, visited });
  const chips = specialtyConfigs([categorySlug]);
  const accent =
    specialtyConfig(categorySlug)?.accent ?? "var(--specialty-neutral)";
  const isPro =
    accessTier === "pro" || statusLabel?.trim().toLowerCase() === "pro";
  const unavailable =
    Boolean(statusLabel) &&
    !isPro &&
    statusLabel !== "Publié" &&
    statusLabel !== "Gratuit";
  const tone =
    statusTone ?? (statusLabel ? accessLabelToTone(statusLabel) : undefined);

  return (
    <Link
      href={href}
      data-list-state={surface}
      className={cn(
        "relative isolate flex min-h-[var(--size-touch)] overflow-hidden rounded-xl p-3 ring-1 ring-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        SURFACE_CLASS[surface],
      )}
    >
      <CategoryWatermark slug={categorySlug} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-container"
            style={{ color: accent }}
          >
            <CategoryIcon slug={categorySlug} className="size-5" />
          </span>
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            <h3 className="min-w-0 flex-1 font-heading text-headline-sm [overflow-wrap:anywhere]">
              <TitleWithTypeIcon title={title} />
            </h3>
            {isPro ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-status-premium">
                <Sparkles className="size-3" aria-hidden />
                <span className="max-sm:sr-only">Pro</span>
              </span>
            ) : unavailable && statusLabel ? (
              <StatusBadge className="ml-auto shrink-0" tone={tone ?? "muted"}>
                {statusLabel}
              </StatusBadge>
            ) : null}
          </div>
        </div>
        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Badge
                key={chip.label}
                variant="outline"
                className={cn("h-5 border px-2 text-[11px] font-medium", chip.chipClass)}
              >
                {chip.label}
              </Badge>
            ))}
          </div>
        ) : null}
        {description ? (
          <p className="line-clamp-2 text-body-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
