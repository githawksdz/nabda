"use client";

import { useEffect, useState, type ReactNode } from "react";
import { collectShellAssetUrls } from "@/lib/pwa/shell-navigation";

type PwaProviderProps = {
  children: ReactNode;
};

const PWA_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "dev";

export function PwaProvider({ children }: PwaProviderProps) {
  const [updateWaiting, setUpdateWaiting] = useState<ServiceWorker | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    function syncOnline() {
      setOffline(!navigator.onLine);
    }
    syncOnline();
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    return () => {
      window.removeEventListener("online", syncOnline);
      window.removeEventListener("offline", syncOnline);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let ignoreUi = false;
    const run = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          `/sw.js?v=${encodeURIComponent(PWA_BUILD_ID)}`,
          {
            scope: "/",
            updateViaCache: "none",
          },
        );
        if (ignoreUi) return;
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateWaiting(registration.waiting);
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateWaiting(registration.waiting);
            }
          });
        });

        await navigator.serviceWorker.ready;
        if (ignoreUi) return;
        const worker = registration.active;
        if (worker) {
          worker.postMessage({
            type: "CACHE_SHELL_ASSETS",
            urls: collectShellAssetUrls(),
          });
        }
        if (navigator.onLine) {
          void fetch("/offline", { credentials: "same-origin", cache: "no-store" });
        }
      } catch (error) {
        console.warn("pwa register", error);
      }
    };
    void run();
    return () => {
      ignoreUi = true;
    };
  }, []);

  function applyUpdate() {
    updateWaiting?.postMessage({ type: "SKIP_WAITING" });
    setUpdateWaiting(null);
    window.setTimeout(() => window.location.reload(), 250);
  }

  return (
    <>
      {children}
      {offline ? (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--layout-nav-height)+env(safe-area-inset-bottom,0px))] z-[var(--z-nav)] px-3 pb-2 lg:bottom-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
        >
          <p className="mx-auto w-[min(100%,42rem)] rounded-xl bg-status-offline-container px-3 py-2 text-center text-body-sm text-text-primary">
            Hors-ligne. Le chrome et les contenus téléchargés restent
            disponibles. Le catalogue clinique nécessite une connexion.
          </p>
        </div>
      ) : null}
      {updateWaiting ? (
        <div className="fixed bottom-[calc(var(--layout-nav-height)+env(safe-area-inset-bottom,0px)+1.5rem)] left-1/2 z-[var(--z-toast)] w-[min(100%-2rem,400px)] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-lg">
          <p className="text-label-md">Nouvelle version de l&apos;application</p>
          <button type="button" className="mt-2 text-body-sm underline" onClick={applyUpdate}>
            Mettre à jour
          </button>
        </div>
      ) : null}
    </>
  );
}
