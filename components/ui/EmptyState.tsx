import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Surface } from "@/components/ui/Surface";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
  headingLevel?: "h2" | "h3" | "p";
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
  headingLevel = "h2",
  className,
}: EmptyStateProps) {
  const TitleTag = headingLevel;

  return (
    <Surface
      variant="muted"
      className={cn(
        compact ? "px-4 py-4 text-start" : "px-4 py-8 text-center",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-surface-container text-text-secondary",
            !compact && "mx-auto",
          )}
        >
          {icon}
        </span>
      ) : null}
      <TitleTag
        className={cn(
          "text-headline-sm",
          icon ? "mt-3" : compact ? undefined : "mt-3",
        )}
      >
        {title}
      </TitleTag>
      <p className="mt-2 text-body-sm text-text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <Button
          className={compact ? "mt-3" : "mt-5"}
          variant={compact ? "secondary" : "primary"}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : actionLabel && actionHref ? (
        <Button
          className={compact ? "mt-3" : "mt-5"}
          variant={compact ? "secondary" : "primary"}
          href={actionHref}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Surface>
  );
}
