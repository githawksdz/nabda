import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HomeIcon } from "@/components/home/home-icons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { RecommendationRow } from "@/types/home";

type ContentRowProps = {
  row: RecommendationRow;
};

export function ContentRow({ row }: ContentRowProps) {
  return (
    <Link
      href={row.href}
      className="flex min-h-11 min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3 py-2.5 hover:bg-surface-container"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-elevated text-text-primary">
        <HomeIcon name={row.icon} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-md font-medium">
          {row.title}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-body-sm text-text-secondary">
          <StatusBadge tone="muted">{row.typeLabel}</StatusBadge>
          {row.specialty && row.specialty !== row.typeLabel ? (
            <span className="min-w-0 truncate">{row.specialty}</span>
          ) : null}
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
