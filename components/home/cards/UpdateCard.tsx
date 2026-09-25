import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
        className="flex min-h-11 min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3 py-2.5 hover:bg-surface-container"
      >
        <span className="min-w-0 flex-1">
          {update.category ? (
            <StatusBadge tone="muted">{update.category}</StatusBadge>
          ) : update.label ? (
            <StatusBadge tone="muted">{update.label}</StatusBadge>
          ) : null}
          <span className="mt-1 block truncate text-body-md font-medium">
            {update.title}
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={update.href}
        className="block rounded-[var(--radius-card)] bg-surface-muted p-4"
      >
        <span className="flex items-center justify-between gap-2">
          {update.label ? (
            <StatusBadge tone="muted">{update.label}</StatusBadge>
          ) : (
            <span />
          )}
          {update.timeLabel ? (
            <span className="text-label-sm text-text-secondary">
              {update.timeLabel}
            </span>
          ) : null}
        </span>
        {update.meta ? (
          <span className="mt-3 block text-label-sm text-text-secondary">
            {update.meta}
          </span>
        ) : null}
        <span className="mt-1 block text-headline-sm">{update.title}</span>
        {update.description ? (
          <span className="mt-2 block text-body-sm text-text-secondary">
            {update.description}
          </span>
        ) : null}
        <span className="mt-4 flex items-center justify-between">
          {update.footer ? (
            <span className="text-label-sm text-text-secondary">
              {update.footer}
            </span>
          ) : (
            <span />
          )}
          <ChevronRight className="size-4 text-text-muted" aria-hidden />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={update.href}
      className="flex min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3 py-3 hover:bg-surface-container"
    >
      <span className="min-w-0 flex-1">
        {update.label ? (
          <StatusBadge tone="muted" className="mb-1.5">
            {update.label}
          </StatusBadge>
        ) : null}
        <span className="block truncate text-body-md font-medium">
          {update.title}
        </span>
        {update.meta ? (
          <span className="mt-0.5 block truncate text-body-sm text-text-secondary">
            {update.meta}
          </span>
        ) : null}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-text-muted"
        strokeWidth={1.75}
        aria-hidden
      />
    </Link>
  );
}
