import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronRight,
  Flag,
  GitBranch,
  RotateCcw,
  Share2,
  WifiOff,
} from "lucide-react";
import { LAYOUT_DOCK_RESERVE } from "@/lib/layout/frames";
import { cn } from "@/lib/utils";

export type DockActionIcon =
  | "bookmark"
  | "bookmark-check"
  | "sources"
  | "next"
  | "cat"
  | "share"
  | "offline"
  | "reset"
  | "report"
  | "check";

export type DockAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: DockActionIcon;
  active?: boolean;
  disabled?: boolean;
  busy?: boolean;
  emphasisKey?: number;
};

type BottomReadingDockProps = {
  actions: DockAction[];
  meta?: string;
};

/** Single owner of reading-dock content clearance. Do not also add nav padding. */
export const READING_DOCK_CONTENT_CLASS = LAYOUT_DOCK_RESERVE;

function DockIcon({ name }: { name: DockActionIcon }) {
  const className = "size-4";
  switch (name) {
    case "bookmark":
      return <Bookmark className={className} strokeWidth={1.75} />;
    case "bookmark-check":
      return <BookmarkCheck className={className} strokeWidth={1.75} />;
    case "sources":
      return <BookOpen className={className} strokeWidth={1.75} />;
    case "next":
      return <ChevronRight className={className} strokeWidth={1.75} />;
    case "cat":
      return <GitBranch className={className} strokeWidth={1.75} />;
    case "share":
      return <Share2 className={className} strokeWidth={1.75} />;
    case "reset":
      return <RotateCcw className={className} strokeWidth={1.75} />;
    case "report":
      return <Flag className={className} strokeWidth={1.75} />;
    case "check":
      return <Check className={className} strokeWidth={1.75} />;
    default:
      return <WifiOff className={className} strokeWidth={1.75} />;
  }
}

export function BottomReadingDock({ actions, meta }: BottomReadingDockProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[var(--z-dock)] bg-surface/90 pb-safe shadow-[var(--shadow-subtle)] backdrop-blur-xl lg:left-[var(--layout-sidebar)]">
      {meta ? (
        <p className="px-4 pt-2 text-center text-label-sm text-on-surface-variant">
          {meta}
        </p>
      ) : null}
      <nav
        aria-label="Actions de lecture"
        className="mx-auto flex h-[var(--layout-dock-height)] w-full items-stretch justify-around px-1"
      >
        {actions.map((action) => {
          const className = cn(
            "motion-color flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary",
            action.active && "font-semibold text-text-primary",
          );
          const inner = (
            <>
              <span
                key={action.emphasisKey ?? 0}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  action.active && "bg-surface-container text-text-primary",
                  action.emphasisKey ? "motion-emphasis" : undefined,
                )}
              >
                <DockIcon name={action.icon} />
              </span>
              <span className="max-w-full truncate text-label-sm">{action.label}</span>
            </>
          );
          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className={className}>
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              aria-busy={action.busy || undefined}
              aria-pressed={action.id === "save" ? Boolean(action.active) : undefined}
              aria-label={action.label}
              className={className}
            >
              {inner}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
