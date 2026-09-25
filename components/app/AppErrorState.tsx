"use client";

import { useEffect } from "react";
import Link from "next/link";

type AppErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  homeHref?: string;
};

export function AppErrorState({
  title = "Un problème est survenu",
  description = "Nabda n’a pas pu charger cette page pour le moment.",
  onRetry,
  homeHref = "/home",
}: AppErrorStateProps) {
  return (
    <div className="layout-gutter layout-workspace mx-auto flex min-h-dvh w-full flex-col justify-center gap-4 bg-background pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[calc(24px+env(safe-area-inset-top,0px))] text-on-surface">
      <h1 className="text-headline-md">{title}</h1>
      <p className="text-body-md text-on-surface-variant">{description}</p>
      <div className="flex flex-col gap-2 pt-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-label-md text-on-primary"
          >
            Réessayer
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-surface-container-low px-4 text-label-md text-on-surface"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}

export function AppErrorBoundaryFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // digest only — never stack / secrets
    console.error(JSON.stringify({ event: "app_error", digest: error.digest }));
  }, [error]);

  return <AppErrorState onRetry={reset} />;
}
