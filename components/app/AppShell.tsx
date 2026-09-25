"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ModuleSheet } from "./ModuleSheet";
import { ConnectionIndicator } from "@/components/pwa/ConnectionIndicator";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  navVariant?: "pill" | "text";
  contentClassName?: string;
  frameClassName?: string;
  avatarDot?: boolean;
  backHref?: string;
  showBottomNav?: boolean;
};

export function AppShell({
  children,
  title = "Accueil",
  headerActions,
  navVariant = "pill",
  contentClassName,
  avatarDot = false,
  backHref,
  showBottomNav = true,
}: AppShellProps) {
  const [modulesOpen, setModulesOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-on-surface lg:flex">
      <DesktopSidebar />
      <div className="relative min-h-dvh min-w-0 flex-1">
        <AppHeader
          title={title}
          avatarDot={avatarDot}
          backHref={backHref}
          onOpenModules={() => setModulesOpen(true)}
          modulesOpen={modulesOpen}
          actions={
            <>
              <ConnectionIndicator />
              {headerActions}
            </>
          }
        />
        <main
          className={cn(
            showBottomNav
              ? "mx-auto w-full max-w-[42rem] px-4 pt-[calc(56px+env(safe-area-inset-top,0px))] pb-[calc(112px+env(safe-area-inset-bottom,0px))] lg:pb-8"
              : "mx-auto w-full max-w-[42rem] px-4 pt-[calc(56px+env(safe-area-inset-top,0px))] pb-[calc(96px+env(safe-area-inset-bottom,0px))] lg:pb-10",
            contentClassName,
          )}
        >
          {children}
        </main>
        {showBottomNav ? <BottomNav variant={navVariant} /> : null}
      </div>
      <ModuleSheet open={modulesOpen} onClose={() => setModulesOpen(false)} />
    </div>
  );
}
