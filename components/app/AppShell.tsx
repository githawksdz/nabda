"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { ModuleSheet } from "./ModuleSheet";
import {
  InstantIndexChrome,
  INSTANT_INDEX_HREFS,
  isInstantIndexHref,
} from "./instant-chromes";
import {
  ShellChromeProvider,
  useShellChromeState,
} from "./shell-chrome";
import {
  LAYOUT_FRAME,
  LAYOUT_GUTTER,
  LAYOUT_HEADER_OFFSET,
  LAYOUT_NAV_RESERVE,
} from "@/lib/layout/frames";
import { getDoctorRouteState } from "@/lib/navigation/doctor-route-state";
import type { ShellPerson } from "@/lib/session/person";
import { useOfflineDocumentNavigation } from "@/lib/pwa/shell-navigation";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  person?: ShellPerson | null;
};

function useInstantIndexNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    for (const href of INSTANT_INDEX_HREFS) {
      void router.prefetch(href);
    }
  }, [router]);

  useEffect(() => {
    if (pendingHref && pathname === pendingHref) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const target = event.target;
      const candidate =
        target instanceof Element ? target.closest("a[href]") : null;
      if (!(candidate instanceof HTMLAnchorElement)) return;
      if (candidate.target === "_blank" || candidate.hasAttribute("download")) {
        return;
      }
      let url: URL;
      try {
        url = new URL(candidate.getAttribute("href") || "", window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!isInstantIndexHref(url.pathname)) return;
      if (url.pathname === pathname) return;
      setPendingHref(url.pathname);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [pathname]);

  return pendingHref;
}

function PersistentDoctorShell({ children, person = null }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pendingHref = useInstantIndexNavigation();
  const displayPath = pendingHref ?? pathname;
  const route = getDoctorRouteState(displayPath);
  const chrome = useShellChromeState();
  const [modulesOpen, setModulesOpen] = useState(false);
  useOfflineDocumentNavigation();

  const showChrome = Boolean(pendingHref && pendingHref !== pathname);

  return (
    <div
      data-doctor-shell
      className="min-h-dvh overflow-x-clip bg-background text-on-surface lg:flex"
    >
      <DesktopSidebar />
      <div className="relative min-h-dvh min-w-0 flex-1">
        <AppHeader
          title={route.label}
          pageHeading={route.pageHeading}
          avatarDot={chrome.avatarDot ?? route.avatarDot}
          frame={route.frame}
          person={person}
        />
        <main
          data-route-content
          className={cn(
            "min-w-0",
            LAYOUT_HEADER_OFFSET,
            LAYOUT_GUTTER,
            LAYOUT_FRAME[route.frame],
            route.hasReadingDock ? undefined : LAYOUT_NAV_RESERVE,
          )}
        >
          {showChrome && pendingHref ? (
            <InstantIndexChrome href={pendingHref} />
          ) : (
            children
          )}
        </main>
        <BottomNav
          modulesOpen={modulesOpen}
          onOpenModules={() => setModulesOpen(true)}
          onNavigate={() => setModulesOpen(false)}
          activePath={displayPath}
        />
      </div>
      <ModuleSheet open={modulesOpen} onClose={() => setModulesOpen(false)} />
    </div>
  );
}

export function AppShell({ children, person = null }: AppShellProps) {
  return (
    <ShellChromeProvider>
      <PersistentDoctorShell person={person}>{children}</PersistentDoctorShell>
    </ShellChromeProvider>
  );
}
