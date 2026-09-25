import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  Flag,
  GitBranch,
  RotateCcw,
  Share2,
  WifiOff,
} from "lucide-react";
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
  | "report";

export type DockAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: DockActionIcon;
  active?: boolean;
};

type BottomReadingDockProps = {
  actions: DockAction[];
  meta?: string;
};

/** Reserve space so fixed dock does not cover the last block (meta line + 72px bar). */
export const READING_DOCK_CONTENT_CLASS =
  "pb-[calc(104px+env(safe-area-inset-bottom,0px))] lg:pb-[calc(112px+env(safe-area-inset-bottom,0px))]";

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
    default:
      return <WifiOff className={className} strokeWidth={1.75} />;
  }
}

export function BottomReadingDock({ actions, meta }: BottomReadingDockProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-surface/90 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl lg:left-60">
      {meta ? (
        <p className="px-4 pt-2 text-center text-label-sm text-on-surface-variant">
          {meta}
        </p>
      ) : null}
      <nav
        aria-label="Actions de lecture"
        className="mx-auto flex h-[72px] w-full max-w-[42rem] items-stretch justify-around px-1 lg:max-w-none"
      >
        {actions.map((action) => {
          const className = cn(
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-on-surface-variant",
            action.active && "text-primary",
          );
          const inner = (
            <>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full",
                  action.active && "bg-secondary-container text-primary",
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
