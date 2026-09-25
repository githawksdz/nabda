"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OfflineProgressStatus } from "@/components/ui/OfflineProgressStatus";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
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
    <Surface variant="muted" className="px-3 py-3 text-body-sm">
      {state.kind === "loading" ? (
        <p role="status">Vérification hors-ligne…</p>
      ) : null}
      {state.kind === "signed-out" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="offline">Connectez-vous pour télécharger</StatusBadge>
          <Button href="/" variant="secondary">
            Se connecter
          </Button>
        </div>
      ) : null}
      {state.kind === "downloaded" ? (
        <StatusBadge tone="downloaded">
          <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
          Disponible hors-ligne
        </StatusBadge>
      ) : null}
      {state.kind === "stale" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge tone="stale">Mise à jour disponible</StatusBadge>
          <Button variant="secondary" onClick={() => void downloadItem(true)}>
            Mettre à jour
          </Button>
        </div>
      ) : null}
      {state.kind === "ready" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => void downloadItem()}>Télécharger</Button>
          {state.packSlug ? (
            <Button variant="secondary" onClick={() => void downloadPack(state.packSlug as string)}>
              Télécharger le pack
            </Button>
          ) : (
            <Link href="/offline" className="inline-flex min-h-11 items-center px-1 text-text-secondary">
              Hors-ligne
            </Link>
          )}
        </div>
      ) : null}
      {state.kind === "online-only" ? (
        <StatusBadge tone="offline">Disponible uniquement en ligne</StatusBadge>
      ) : null}
      {state.kind === "check" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-text-secondary">
            Télécharger pour confirmer la disponibilité hors-ligne.
          </p>
          <Button onClick={() => void downloadItem()}>Télécharger</Button>
        </div>
      ) : null}
      {state.kind === "pro" ? (
        <StatusBadge tone="pro">Pro requis</StatusBadge>
      ) : null}
      {state.kind === "offline-blocked" ? (
        <StatusBadge tone="offline">Connexion requise pour télécharger</StatusBadge>
      ) : null}
      {state.kind === "error" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-status-danger">{state.message}</p>
          <Button variant="secondary" onClick={() => void downloadItem()}>
            Réessayer
          </Button>
        </div>
      ) : null}
      {state.kind === "working" ? <OfflineProgressStatus label={state.label} /> : null}
    </Surface>
  );
}
