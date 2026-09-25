"use client";

import { useEffect, useState, type ReactNode } from "react";

type PwaProviderProps = {
  children: ReactNode;
};

export function PwaProvider({ children }: PwaProviderProps) {
  const [updateWaiting, setUpdateWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    const run = async () => {
      try {
        const versionRes = await fetch("/api/pwa/version", { cache: "no-store" });
        const payload = versionRes.ok ? ((await versionRes.json()) as { version?: string }) : { version: "dev" };
        const version = payload.version || "dev";
        const registration = await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(version)}`, {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        if (registration.waiting) {
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
      } catch (error) {
        console.warn("pwa register", error);
      }
    };
    void run();
    return () => {
      cancelled = true;
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
      {updateWaiting ? (
        <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-1/2 z-[60] w-[min(100%-2rem,400px)] -translate-x-1/2 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-lg">
          <p className="text-label-md">Nouvelle version de l&apos;application</p>
          <button type="button" className="mt-2 text-body-sm underline" onClick={applyUpdate}>
            Mettre à jour
          </button>
        </div>
      ) : null}
    </>
  );
}
