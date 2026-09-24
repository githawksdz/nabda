import Link from "next/link";
import { User } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  title?: string;
  actions?: ReactNode;
  frameClassName?: string;
  avatarDot?: boolean;
};

export function AppHeader({
  title = "Accueil",
  actions,
  frameClassName = "max-w-[430px]",
  avatarDot = false,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-1/2 z-50 w-full -translate-x-1/2 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl",
        frameClassName,
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <h1 className="text-headline-sm">{title}</h1>
        <div className="flex items-center gap-1.5">
          {actions}
          <Link
            href="/profile"
            aria-label="Profil"
            className="relative flex size-8 items-center justify-center rounded-full bg-primary text-on-primary"
          >
            <User className="size-4" strokeWidth={1.75} />
            {avatarDot ? (
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-secondary-container ring-2 ring-surface" />
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}

