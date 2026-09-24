import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  navVariant?: "pill" | "text";
  contentClassName?: string;
  frameClassName?: string;
  avatarDot?: boolean;
};

export function AppShell({
  children,
  title = "Accueil",
  headerActions,
  navVariant = "pill",
  contentClassName,
  frameClassName = "max-w-[430px]",
  avatarDot = false,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <div
        className={cn(
          "relative mx-auto min-h-dvh w-full bg-background",
          frameClassName,
        )}
      >
        <AppHeader
          title={title}
          actions={headerActions}
          frameClassName={frameClassName}
          avatarDot={avatarDot}
        />
        <main
          className={cn(
            "px-4 pt-[calc(56px+env(safe-area-inset-top,0px))] pb-[calc(112px+env(safe-area-inset-bottom,0px))]",
            contentClassName,
          )}
        >
          {children}
        </main>
        <BottomNav variant={navVariant} frameClassName={frameClassName} />
      </div>
    </div>
  );
}
