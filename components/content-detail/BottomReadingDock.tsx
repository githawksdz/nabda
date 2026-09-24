import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  GitBranch,
  Share2,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DockAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: "bookmark" | "bookmark-check" | "sources" | "next" | "cat" | "share" | "offline";
  active?: boolean;
};

type BottomReadingDockProps = {
  actions: DockAction[];
  meta?: string;
};

function DockIcon({ name }: { name: DockAction["icon"] }) {
  const className = "size-4";
  if (name === "bookmark") {
    return <Bookmark className={className} strokeWidth={1.75} />;
  }
  if (name === "bookmark-check") {
    return <BookmarkCheck className={className} strokeWidth={1.75} />;
  }
  if (name === "sources") {
    return <BookOpen className={className} strokeWidth={1.75} />;
  }
  if (name === "next") {
    return <ChevronRight className={className} strokeWidth={1.75} />;
  }
  if (name === "cat") {
    return <GitBranch className={className} strokeWidth={1.75} />;
  }
  if (name === "share") {
    return <Share2 className={className} strokeWidth={1.75} />;
  }
  return <WifiOff className={className} strokeWidth={1.75} />;
}

export function BottomReadingDock({ actions, meta }: BottomReadingDockProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[390px] -translate-x-1/2 bg-surface/90 pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      {meta ? (
        <p className="px-4 pt-2 text-center text-label-sm text-on-surface-variant">
          {meta}
        </p>
      ) : null}
      <nav
        aria-label="Actions de lecture"
        className="flex h-[72px] items-stretch justify-around px-1"
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
