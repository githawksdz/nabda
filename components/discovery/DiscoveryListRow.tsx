import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/shadcn/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/shadcn/item";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import {
  contentTypeLabel,
  specialtyConfig,
  specialtyConfigs,
  type ContentCardType,
} from "@/lib/ui/content-card-config";
import { resolveListSurface } from "@/lib/ui/content-list-state";
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
  contentType?: ContentCardType;
  specialties?: Array<string | null | undefined>;
  accessTier?: "free" | "pro";
  isNew?: boolean;
  visited?: boolean;
  actions?: ReactNode;
};

const SURFACE_CLASS = {
  new: "bg-list-new-bg",
  unread: "bg-list-unread-bg",
  read: "bg-list-read-bg",
} as const;

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
  contentType,
  specialties = [],
  accessTier,
  isNew = false,
  visited = false,
  actions,
}: DiscoveryListRowProps) {
  const surface = resolveListSurface({ isNew, visited });
  const chips = specialtyConfigs(specialties);
  const accent = specialtyConfig(specialties[0] ?? null)?.accent ?? "var(--specialty-neutral)";
  const resolvedTypeLabel = typeLabel ?? (contentType ? contentTypeLabel(contentType) : undefined);
  const isPro =
    accessTier === "pro" ||
    statusLabel?.trim().toLowerCase() === "pro";
  const unavailable =
    Boolean(statusLabel) &&
    !isPro &&
    statusLabel !== "Publié" &&
    statusLabel !== "Gratuit";
  const tone =
    statusTone ?? (statusLabel ? accessLabelToTone(statusLabel) : undefined);
  const body = description || subtitle;

  return (
    <Item
      asChild
      variant="muted"
      data-list-state={surface}
      className={cn(
        "relative min-h-[var(--size-touch)] overflow-hidden pl-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        SURFACE_CLASS[surface],
        className,
      )}
    >
      <Link href={href}>
        <span
          aria-hidden
          className="absolute top-3 bottom-3 left-0 w-[3px] rounded-full"
          style={{ backgroundColor: accent }}
        />
        {icon ? (
          <ItemMedia
            variant="icon"
            className="size-8 rounded-lg bg-surface-container text-text-primary"
          >
            {icon}
          </ItemMedia>
        ) : null}
        <ItemContent>
          <ItemTitle className="[overflow-wrap:anywhere]">{title}</ItemTitle>
          {body ? (
            <ItemDescription className="line-clamp-2">{body}</ItemDescription>
          ) : resolvedTypeLabel ? (
            <ItemDescription>{resolvedTypeLabel}</ItemDescription>
          ) : null}
          {chips.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
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
        </ItemContent>
        <ItemActions className="self-start pt-0.5">
          {actions}
          {isPro ? (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-status-premium">
              <Sparkles className="size-3" aria-hidden />
              <span className="max-sm:sr-only">Pro</span>
            </span>
          ) : unavailable && statusLabel ? (
            <StatusBadge tone={tone ?? "muted"}>{statusLabel}</StatusBadge>
          ) : null}
          <ChevronRight
            className="size-3.5 text-muted-foreground/50"
            strokeWidth={1.75}
            aria-hidden
          />
        </ItemActions>
      </Link>
    </Item>
  );
}

type DiscoveryListProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function DiscoveryList({ children, className, id }: DiscoveryListProps) {
  return (
    <ul id={id} className={cn("flex min-w-0 flex-col gap-1.5", className)}>
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
