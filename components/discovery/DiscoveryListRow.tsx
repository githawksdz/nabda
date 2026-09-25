import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { accessLabelToTone } from "@/lib/ui/access-status-display";
import { cn } from "@/lib/utils";

type DiscoveryListRowProps = {
  href: string;
  title: string;
  subtitle?: string;
  typeLabel?: string;
  description?: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  icon?: ReactNode;
  className?: string;
};

export function DiscoveryListRow({
  href,
  title,
  subtitle,
  typeLabel,
  description,
  statusLabel,
  statusTone,
  icon,
  className,
}: DiscoveryListRowProps) {
  const tone = statusTone ?? (statusLabel ? accessLabelToTone(statusLabel) : undefined);

  return (
    <Link
      href={href}
      className={cn(
        "motion-surface flex min-h-11 min-w-0 items-center gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3 py-2.5",
        "hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-elevated text-text-primary">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
          {title}
        </span>
        {(typeLabel || subtitle || description) && (
          <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-body-sm text-text-secondary">
            {typeLabel ? (
              <StatusBadge tone="muted">{typeLabel}</StatusBadge>
            ) : null}
            {subtitle ? (
              <span className="min-w-0 [overflow-wrap:anywhere]">{subtitle}</span>
            ) : null}
            {description ? (
              <span className="min-w-0 basis-full [overflow-wrap:anywhere] line-clamp-2">
                {description}
              </span>
            ) : null}
          </span>
        )}
        {statusLabel ? (
          <span className="mt-1.5 inline-flex">
            <StatusBadge tone={tone ?? "muted"}>{statusLabel}</StatusBadge>
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

type DiscoveryListProps = {
  children: ReactNode;
  className?: string;
};

export function DiscoveryList({ children, className }: DiscoveryListProps) {
  return (
    <ul className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {children}
    </ul>
  );
}

type DiscoveryListItemProps = {
  children: ReactNode;
};

export function DiscoveryListItem({ children }: DiscoveryListItemProps) {
  return <li className="min-w-0">{children}</li>;
}
