"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ModuleSheet } from "./ModuleSheet";
import { ConnectionIndicator } from "@/components/pwa/ConnectionIndicator";
import {
  LAYOUT_FRAME,
  LAYOUT_GUTTER,
  LAYOUT_HEADER_OFFSET,
  LAYOUT_NAV_RESERVE,
  type ShellFrame,
} from "@/lib/layout/frames";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  navVariant?: "pill" | "text";
  contentClassName?: string;
  avatarDot?: boolean;
  backHref?: string;
  showBottomNav?: boolean;
  pageHeading?: boolean;
  frame?: ShellFrame;
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
  pageHeading = true,
  frame = "workspace",
}: AppShellProps) {
  const [modulesOpen, setModulesOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-clip bg-background text-on-surface lg:flex">
      <DesktopSidebar />
      <div className="relative min-h-dvh min-w-0 flex-1">
        <AppHeader
          title={title}
          pageHeading={pageHeading}
          avatarDot={avatarDot}
          backHref={backHref}
          onOpenModules={() => setModulesOpen(true)}
          modulesOpen={modulesOpen}
          frame={frame}
          actions={
            <>
              <ConnectionIndicator />
              {headerActions}
            </>
          }
        />
        <main
          className={cn(
            "min-w-0",
            LAYOUT_HEADER_OFFSET,
            LAYOUT_GUTTER,
            LAYOUT_FRAME[frame],
            // Nav reserve only when BottomNav is shown. Detail docks own their own padding.
            showBottomNav ? LAYOUT_NAV_RESERVE : "pb-6 lg:pb-8",
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
