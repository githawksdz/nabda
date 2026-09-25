"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, BookOpen, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrugDockAction = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: "bookmark" | "bookmark-check" | "sources" | "report";
  active?: boolean;
};

type DrugFooterActionsProps = {
  actions: DrugDockAction[];
  meta?: string;
};

function DockIcon({ name }: { name: DrugDockAction["icon"] }) {
  const className = "size-4";
  if (name === "bookmark-check") {
    return <BookmarkCheck className={className} strokeWidth={1.75} />;
  }
  if (name === "bookmark") {
    return <Bookmark className={className} strokeWidth={1.75} />;
  }
  if (name === "sources") {
    return <BookOpen className={className} strokeWidth={1.75} />;
  }
  return <Flag className={className} strokeWidth={1.75} />;
}

export function DrugFooterActions({ actions, meta }: DrugFooterActionsProps) {
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
        aria-label="Actions de la fiche médicament"
        className="mx-auto flex h-[72px] w-full max-w-[42rem] items-stretch justify-around px-1"
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
              <span className="max-w-full truncate text-label-sm">
                {action.label}
              </span>
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
