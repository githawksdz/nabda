import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { StatusChip } from "./StatusChip";
import type { HomeUpdate } from "@/types/home";

type UpdateCardProps = {
  update: HomeUpdate;
  variant?: "row" | "featured" | "compact";
};

export function UpdateCard({ update, variant = "row" }: UpdateCardProps) {
  if (variant === "compact") {
    return (
      <Link
        href={update.href}
        className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4"
      >
        <span className="min-w-0 flex-1">
          {update.category ? (
            <span className="block text-label-sm text-on-surface-variant">
              {update.category}
            </span>
          ) : null}
          <span className="mt-0.5 block text-body-md font-medium">
            {update.title}
          </span>
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-on-surface-variant" />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={update.href}
        className="block rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
      >
        <span className="flex items-center justify-between gap-2">
          {update.label ? <StatusChip>{update.label}</StatusChip> : <span />}
          {update.timeLabel ? (
            <span className="text-label-sm text-on-surface-variant">
              {update.timeLabel}
            </span>
          ) : null}
        </span>
        {update.meta ? (
          <span className="mt-3 block text-label-sm text-on-surface-variant">
            {update.meta}
          </span>
        ) : null}
        <span className="mt-1 block text-headline-sm">{update.title}</span>
        {update.description ? (
          <span className="mt-2 block text-body-sm text-on-surface-variant">
            {update.description}
          </span>
        ) : null}
        <span className="mt-4 flex items-center justify-between">
          {update.footer ? (
            <span className="text-label-sm text-on-surface-variant">
              {update.footer}
            </span>
          ) : (
            <span />
          )}
          <ArrowRight className="size-4 text-on-surface" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={update.href}
      className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
    >
      <span className="min-w-0 flex-1">
        {update.label ? (
          <StatusChip className="mb-1.5">{update.label}</StatusChip>
        ) : null}
        <span className="block text-body-md font-medium">{update.title}</span>
        {update.meta ? (
          <span className="mt-0.5 block text-body-sm text-on-surface-variant">
            {update.meta}
          </span>
        ) : null}
      </span>
      <ChevronRight className="size-4 shrink-0 text-on-surface-variant" />
    </Link>
  );
}
