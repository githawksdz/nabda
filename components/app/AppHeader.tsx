import Link from "next/link";
import { ArrowLeft, LayoutGrid, Search, User } from "lucide-react";
import type { ReactNode } from "react";

type AppHeaderProps = {
  title?: string;
  actions?: ReactNode;
  avatarDot?: boolean;
  modulesOpen?: boolean;
  onOpenModules?: () => void;
  backHref?: string;
};

export function AppHeader({
  title = "Accueil",
  actions,
  avatarDot = false,
  modulesOpen = false,
  onOpenModules,
  backHref,
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:left-60">
      <div className="mx-auto flex h-14 w-full max-w-[42rem] items-center justify-between gap-2 px-4 lg:max-w-none">
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
          <h1 className="min-w-0 truncate text-headline-sm">{title}</h1>
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
