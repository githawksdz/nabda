"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
import type { OfflineContentType } from "@/lib/offline/types";

type DetailLibraryStatusProps = {
  contentType: OfflineContentType;
  slug: string;
};

type LibraryState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "downloaded" }
  | { kind: "stale" }
  | { kind: "ready"; packSlug: string | null }
  | { kind: "check" }
  | { kind: "online-only" }
  | { kind: "pro" }
  | { kind: "offline-blocked" }
  | { kind: "error"; message: string }
  | { kind: "working"; label: string };

function reasonFromError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (
    message === "storage_full" ||
    message === "offline" ||
    message === "checksum_mismatch"
  ) {
    return message;
  }
  const parts = message.split(":");
  return parts.length >= 3 ? parts.slice(2).join(":") : message;
}

export function DetailLibraryStatus({
  contentType,
  slug,
}: DetailLibraryStatusProps) {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState>({ kind: "loading" });

  const refresh = useCallback(
    async (uid: string) => {
      const [localRows, manifest] = await Promise.all([
        contentRepository.listLocal(uid),
        contentRepository.getPackManifest(uid),
      ]);
      const local = localRows.find(
        (row) => row.contentType === contentType && row.slug === slug,
      );
      if (local?.stale) {
        setState({ kind: "stale" });
        return;
      }
      if (local) {
        setState({ kind: "downloaded" });
        return;
      }
      const individual = manifest?.individual.find(
        (item) => item.contentType === contentType && item.slug === slug,
      );
      const pack = manifest?.packs.find((entry) =>
        entry.items.some(
          (item) => item.contentType === contentType && item.slug === slug,
        ),
      );
      if (individual || pack) {
        setState({ kind: "ready", packSlug: pack?.slug ?? null });
        return;
      }
      setState({ kind: "check" });
    },
    [contentType, slug],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setUserId(null);
        setState({ kind: "signed-out" });
        return;
      }
      setUserId(user.id);
      await refresh(user.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function downloadItem(asUpdate = false) {
    if (!userId) {
      setState({ kind: "signed-out" });
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setState({ kind: "offline-blocked" });
      return;
    }
    setState({
      kind: "working",
      label: asUpdate ? "Mise à jour…" : "Téléchargement…",
    });
    try {
      await contentRepository.downloadItem(userId, contentType, slug);
      setState({ kind: "downloaded" });
    } catch (error) {
      const reason = reasonFromError(error);
      if (reason === "premium_requires_pro") {
        setState({ kind: "pro" });
        return;
      }
      if (reason === "unauthenticated") {
        setState({ kind: "signed-out" });
        return;
      }
      if (
        reason === "not_offline_available" ||
        reason === "unpublished" ||
        reason === "draft" ||
        reason === "hidden" ||
        reason === "unknown"
      ) {
        setState({ kind: "online-only" });
        return;
      }
      if (reason === "offline") {
        setState({ kind: "offline-blocked" });
        return;
      }
      if (reason === "storage_full") {
        setState({
          kind: "error",
          message:
            "Espace de stockage insuffisant. Libérez de l’espace puis réessayez.",
        });
        return;
      }
      if (reason === "checksum_mismatch") {
        setState({
          kind: "error",
          message:
            "Ce contenu local est illisible. Supprimez-le puis téléchargez-le à nouveau.",
        });
        return;
      }
      setState({ kind: "error", message: "Le téléchargement a échoué. Réessayez." });
    }
  }

  async function downloadPack(packSlug: string) {
    if (!userId) {
      setState({ kind: "signed-out" });
      return;
    }
    setState({ kind: "working", label: "Téléchargement du pack…" });
    try {
      await contentRepository.downloadPack(userId, packSlug, (done, total) => {
        setState({
          kind: "working",
          label: `Téléchargement du pack… ${done}/${total}`,
        });
      });
      await refresh(userId);
    } catch (error) {
      const reason = reasonFromError(error);
      if (reason === "premium_requires_pro") {
        setState({ kind: "pro" });
        return;
      }
      if (reason === "unauthenticated") {
        setState({ kind: "signed-out" });
        return;
      }
      if (reason === "storage_full") {
        setState({
          kind: "error",
          message:
            "Espace de stockage insuffisant. Libérez de l’espace puis réessayez.",
        });
        return;
      }
      setState({ kind: "error", message: "Le téléchargement a échoué. Réessayez." });
    }
  }

  return (
    <section className="rounded-xl bg-surface-container-low px-3 py-3 text-body-sm">
      {state.kind === "loading" ? <p>Vérification hors-ligne…</p> : null}
      {state.kind === "signed-out" ? (
        <p>
          Connectez-vous pour télécharger.{" "}
          <Link href="/" className="inline-flex min-h-11 items-center font-semibold">
            Se connecter
          </Link>
        </p>
      ) : null}
      {state.kind === "downloaded" ? <p>Disponible hors-ligne</p> : null}
      {state.kind === "stale" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>Mise à jour disponible</p>
          <button
            type="button"
            onClick={() => void downloadItem(true)}
            className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold"
          >
            Mettre à jour
          </button>
        </div>
      ) : null}
      {state.kind === "ready" ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void downloadItem()}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 font-semibold text-on-primary"
          >
            Télécharger
          </button>
          {state.packSlug ? (
            <button
              type="button"
              onClick={() => void downloadPack(state.packSlug as string)}
              className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold"
            >
              Télécharger le pack
            </button>
          ) : (
            <Link href="/offline" className="inline-flex min-h-11 items-center px-1">
              Hors-ligne
            </Link>
          )}
        </div>
      ) : null}
      {state.kind === "online-only" ? (
        <p>Contenu disponible uniquement en ligne.</p>
      ) : null}
      {state.kind === "check" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>Télécharger pour confirmer la disponibilité hors-ligne.</p>
          <button
            type="button"
            onClick={() => void downloadItem()}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-3 font-semibold text-on-primary"
          >
            Télécharger
          </button>
        </div>
      ) : null}
      {state.kind === "pro" ? (
        <p>
          Pro requis. Cet élément ne peut pas être téléchargé avec l&apos;accès actuel.
        </p>
      ) : null}
      {state.kind === "offline-blocked" ? (
        <p>Connexion requise pour télécharger.</p>
      ) : null}
      {state.kind === "error" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>{state.message}</p>
          <button
            type="button"
            onClick={() => void downloadItem()}
            className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold"
          >
            Réessayer
          </button>
        </div>
      ) : null}
      {state.kind === "working" ? <p>{state.label}</p> : null}
    </section>
  );
}
