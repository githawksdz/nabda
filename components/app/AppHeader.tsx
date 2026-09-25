import Link from "next/link";
import { ArrowLeft, LayoutGrid, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import {
  LAYOUT_FRAME,
  LAYOUT_GUTTER,
  type ShellFrame,
} from "@/lib/layout/frames";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title?: string;
  actions?: ReactNode;
  avatarDot?: boolean;
  modulesOpen?: boolean;
  onOpenModules?: () => void;
  backHref?: string;
  pageHeading?: boolean;
  frame?: ShellFrame;
};

export function AppHeader({
  title = "Accueil",
  actions,
  avatarDot = false,
  modulesOpen = false,
  onOpenModules,
  backHref,
  pageHeading = true,
  frame = "workspace",
}: AppHeaderProps) {
  const titleClassName = "min-w-0 truncate text-headline-sm";

  return (
    <header className="fixed top-0 right-0 left-0 z-[var(--z-header)] bg-surface/85 pt-safe shadow-[var(--shadow-subtle)] backdrop-blur-xl lg:left-[var(--layout-sidebar)]">
      <div
        className={cn(
          "flex h-[var(--layout-header-height)] w-full items-center justify-between gap-2",
          LAYOUT_GUTTER,
          LAYOUT_FRAME[frame],
        )}
      >
        <div className="flex min-w-0 items-center gap-1">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Retour"
              className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full pr-2 text-label-md text-on-surface"
            >
              <ArrowLeft className="size-5" strokeWidth={1.75} aria-hidden />
              Retour
            </Link>
          ) : null}
          {pageHeading ? (
            <h1 className={titleClassName}>{title}</h1>
          ) : (
            <p className={titleClassName}>{title}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/search"
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-label-md text-on-surface lg:inline-flex"
          >
            <Search className="size-4" strokeWidth={1.75} aria-hidden />
            Recherche
          </Link>
          {onOpenModules ? (
            <button
              type="button"
              onClick={onOpenModules}
              aria-haspopup="dialog"
              aria-expanded={modulesOpen}
              aria-controls="doctor-modules"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-label-md text-on-surface lg:hidden"
            >
              <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
              Modules
            </button>
          ) : null}
          {actions}
          <Link
            href="/profile"
            aria-label="Profil"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-primary lg:hidden"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary">
              <User className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            {avatarDot ? (
              <span className="absolute right-1 bottom-1 size-2.5 rounded-full bg-secondary-container ring-2 ring-surface" />
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
