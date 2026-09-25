"use client";

import { useCallback, useEffect, useRef, useState, type TransitionEvent } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { OfflineProgressStatus } from "@/components/ui/OfflineProgressStatus";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Surface } from "@/components/ui/Surface";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
import { prefersReducedMotion } from "@/lib/ui/scroll-behavior";
import { loadCalculatorEngine } from "@/lib/calculators/engine-registry";
import type {
  LocalContentRecord,
  OfflineCatalogManifest,
  OfflineContentType,
  OfflineStatus,
} from "@/lib/offline/types";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function reasonFromError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "storage_full" || message === "offline") return message;
  const parts = message.split(":");
  return parts.length >= 3 ? parts.slice(2).join(":") : message;
}

function errorCopy(reason: string): string {
  if (reason === "unauthenticated") return "Connectez-vous pour télécharger.";
  if (reason === "premium_requires_pro") return "Pro requis";
  if (reason === "not_offline_available" || reason === "unpublished" || reason === "draft") {
    return "Contenu disponible uniquement en ligne.";
  }
  if (reason === "storage_full") {
    return "Espace de stockage insuffisant. Libérez de l'espace puis réessayez.";
  }
  if (reason === "offline") return "Connexion requise pour télécharger.";
  if (reason === "checksum_mismatch") {
    return "Ce contenu local est illisible. Supprimez-le puis téléchargez-le à nouveau.";
  }
  return "Le téléchargement a échoué. Réessayez.";
}

const TYPE_LABEL: Record<OfflineContentType, string> = {
  protocol: "Protocole",
  cat: "CAT",
  drug: "Médicament",
  calculator: "Score",
};

export function OfflineManagerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [status, setStatus] = useState<OfflineStatus | null>(null);
  const [manifest, setManifest] = useState<OfflineCatalogManifest | null>(null);
  const [local, setLocal] = useState<LocalContentRecord[]>([]);
  const [corruptIds, setCorruptIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchHits, setSearchHits] = useState<{ title: string; href: string }[]>([]);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const downloadedListRef = useRef<HTMLUListElement>(null);
  const downloadedHeadingRef = useRef<HTMLHeadingElement>(null);

  const refresh = useCallback(async (uid: string) => {
    const [nextStatus, nextLocal, nextManifest] = await Promise.all([
      contentRepository.getOfflineStatus(uid),
      contentRepository.listLocal(uid),
      contentRepository.getPackManifest(uid),
    ]);
    setStatus(nextStatus);
    setLocal(nextLocal);
    setManifest(nextManifest);
    const corrupt = new Set<string>();
    await Promise.all(
      nextLocal.map(async (item) => {
        try {
          const health = await contentRepository.inspectLocal(
            uid,
            item.contentType,
            item.slug,
          );
          if (health === "corrupt") corrupt.add(item.id);
        } catch {
          corrupt.add(item.id);
        }
      }),
    );
    setCorruptIds(corrupt);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setAuthReady(true);
      if (!user) {
        setUserId(null);
        return;
      }
      setUserId(user.id);
      await refresh(user.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function downloadPack(slug: string) {
    if (!userId) {
      setError("Connectez-vous pour télécharger.");
      return;
    }
    setError(null);
    setProgress("Téléchargement du pack…");
    try {
      const pack = await contentRepository.downloadPack(
        userId,
        slug,
        (done, total) => setProgress(`Téléchargement du pack… ${done}/${total}`),
      );
      for (const item of pack.items) {
        if (item.contentType === "calculator") {
          await loadCalculatorEngine(item.slug);
        }
      }
      await refresh(userId);
      setProgress("Disponible hors-ligne");
    } catch (caught) {
      setProgress(null);
      setError(errorCopy(reasonFromError(caught)));
    }
  }

  async function downloadItem(type: OfflineContentType, slug: string) {
    if (!userId) {
      setError("Connectez-vous pour télécharger.");
      return;
    }
    const existing = local.find(
      (item) => item.contentType === type && item.slug === slug,
    );
    setError(null);
    setProgress(existing?.stale ? "Mise à jour…" : "Téléchargement…");
    try {
      await contentRepository.downloadItem(userId, type, slug);
      if (type === "calculator") {
        await loadCalculatorEngine(slug);
      }
      await refresh(userId);
      setProgress("Disponible hors-ligne");
    } catch (caught) {
      setProgress(null);
      setError(errorCopy(reasonFromError(caught)));
    }
  }

  function focusDownloadedItem(index: number) {
    const items = downloadedListRef.current?.querySelectorAll<HTMLElement>("[data-offline-item]");
    const target = items?.[index] ?? items?.[index - 1];
    const focusable = target?.querySelector<HTMLElement>("a, button");
    if (focusable) {
      focusable.focus();
      return;
    }
    downloadedHeadingRef.current?.focus();
  }

  async function removeLocal(type: OfflineContentType, slug: string, id: string) {
    if (!userId || exitingId) return;
    const index = local.findIndex((item) => item.id === id);
    await contentRepository.removeItem(userId, type, slug);
    if (prefersReducedMotion()) {
      await refresh(userId);
      window.requestAnimationFrame(() => focusDownloadedItem(index));
      return;
    }
    setExitingId(id);
  }

  function onDownloadedExit(event: TransitionEvent<HTMLLIElement>, id: string) {
    if (event.propertyName !== "opacity" || event.target !== event.currentTarget) {
      return;
    }
    if (exitingId !== id || !userId) {
      return;
    }
    const index = local.findIndex((item) => item.id === id);
    setExitingId(null);
    void refresh(userId).then(() => {
      window.requestAnimationFrame(() => focusDownloadedItem(index));
    });
  }

  async function runSearch(value: string) {
    setSearch(value);
    if (!userId || !value.trim()) {
      setSearchHits([]);
      return;
    }
    const rows = await contentRepository.searchContent(userId, value);
    setSearchHits(rows.map((row) => ({ title: row.title, href: row.href ?? "/offline" })));
  }

  const lastSync = !status?.lastSyncAt
    ? "Jamais synchronisé"
    : `Dernière vérification ${new Date(status.lastSyncAt).toLocaleString("fr-FR")}`;

  return (
    <AppShell title="Hors-ligne" frame="workspace">
      <div className="flex min-w-0 flex-col gap-5 pt-2">
        <header className="flex flex-col gap-1">
          <p className="text-body-md text-text-secondary">
            Contenus téléchargés sur cet appareil. Rien n’est téléchargé automatiquement.
          </p>
        </header>

        {!authReady ? (
          <LoadingIndicator label="Vérification du compte…" />
        ) : null}

        {authReady && !userId ? (
          <EmptyState
            title="Connectez-vous pour télécharger."
            description="Les favoris et les contenus hors-ligne sont liés à votre compte."
            actionLabel="Se connecter"
            actionHref="/"
          />
        ) : null}

        {userId && status ? (
          <Surface variant="muted" className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge tone={status.online ? "downloaded" : "offline"}>
                {status.online ? "En ligne" : "Hors-ligne"}
              </StatusBadge>
              {status.updateAvailable ? (
                <StatusBadge tone="stale">Mise à jour disponible</StatusBadge>
              ) : null}
            </div>
            <p className="text-body-sm text-text-secondary">{lastSync}</p>
            <p className="text-body-sm text-text-secondary">
              {status.itemCount} contenus آ· {formatBytes(status.storageBytes)}
            </p>
          </Surface>
        ) : null}

        {progress ? (
          <Surface variant="muted">
            <OfflineProgressStatus label={progress} />
          </Surface>
        ) : null}

        {error ? (
          <Surface variant="muted">
            <StatusBadge
              tone={
                error.startsWith("Pro requis")
                  ? "pro"
                  : error.includes("Connectez-vous")
                    ? "info"
                    : error.includes("uniquement en ligne") ||
                        error.includes("Connexion requise")
                      ? "offline"
                      : "error"
              }
            >
              {error}
            </StatusBadge>
          </Surface>
        ) : null}

        {userId ? (
          <>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-label-md text-text-primary">Recherche locale</span>
              <input
                value={search}
                onChange={(event) => void runSearch(event.target.value)}
                className="min-h-11 rounded-[var(--radius-control)] bg-surface-muted px-3.5 text-body-md"
                placeholder="Titre déjà téléchargé"
              />
            </label>
            {searchHits.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {searchHits.map((hit) => (
                  <li key={hit.href}>
                    <Link
                      href={hit.href}
                      className="block min-h-11 rounded-[var(--radius-card)] bg-surface-muted px-3.5 py-3 text-body-md"
                    >
                      {hit.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : search.trim() ? (
              <p className="text-body-sm text-text-secondary">
                Aucun contenu téléchargé ne correspond.
              </p>
            ) : null}

            <section className="flex flex-col gap-2">
              <h2 className="text-headline-sm">Packs</h2>
              {(manifest?.packs ?? []).length === 0 ? (
                <p className="text-body-sm text-text-secondary">
                  Aucun pack publié pour votre accès.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {(manifest?.packs ?? []).map((pack) => (
                    <li key={pack.slug}>
                      <Surface variant="muted" className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge tone="muted">Pack</StatusBadge>
                          <StatusBadge tone={pack.visibility === "premium" ? "pro" : "free"}>
                            {pack.visibility === "premium" ? "Pro" : "Gratuit"}
                          </StatusBadge>
                          <StatusBadge tone="muted">{pack.itemCount} contenus</StatusBadge>
                        </div>
                        <h3 className="text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
                          {pack.title}
                        </h3>
                        <Button
                          onClick={() => void downloadPack(pack.slug)}
                          disabled={!status?.online}
                        >
                          Télécharger le pack
                        </Button>
                        {!status?.online ? (
                          <p className="text-label-sm text-text-secondary">
                            Connexion requise pour télécharger.
                          </p>
                        ) : null}
                      </Surface>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-headline-sm">Contenus individuels</h2>
              <ul className="flex flex-col gap-1.5">
                {(manifest?.individual ?? []).slice(0, 40).map((item) => (
                  <li
                    key={`${item.contentType}:${item.slug}`}
                    className="flex min-w-0 items-center justify-between gap-3 rounded-[var(--radius-card)] bg-surface-muted px-3 py-2.5"
                  >
                    <span className="min-w-0">
                      <span className="block text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
                        {item.title}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        <StatusBadge tone="muted">{TYPE_LABEL[item.contentType]}</StatusBadge>
                        <StatusBadge tone={item.visibility === "premium" ? "pro" : "free"}>
                          {item.visibility === "premium" ? "Pro" : "Gratuit"}
                        </StatusBadge>
                      </span>
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() => void downloadItem(item.contentType, item.slug)}
                      disabled={!status?.online}
                    >
                      Télécharger
                    </Button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-2">
              <h2
                ref={downloadedHeadingRef}
                tabIndex={-1}
                className="text-headline-sm outline-none"
              >
                Téléchargés
              </h2>
              {local.length === 0 ? (
                <EmptyState
                  compact
                  headingLevel="p"
                  title="Aucun contenu téléchargé"
                  description="Téléchargez une fiche ou un pack pour la consulter sans connexion."
                />
              ) : (
                <ul ref={downloadedListRef} className="flex flex-col gap-1.5">
                  {local.map((item) => {
                    const corrupt = corruptIds.has(item.id);
                    const exiting = exitingId === item.id;
                    return (
                      <li
                        key={item.id}
                        data-offline-item=""
                        data-exiting={exiting ? "true" : undefined}
                        onTransitionEnd={(event) => onDownloadedExit(event, item.id)}
                        className="offline-remove rounded-[var(--radius-card)] bg-surface-muted"
                      >
                        <div className="offline-remove-inner px-3 py-2.5">
                        {corrupt ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-body-md font-medium">{item.title}</p>
                            <StatusBadge tone="error">
                              Ce contenu local est illisible. Supprimez-le puis téléchargez-le à nouveau.
                            </StatusBadge>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                onClick={() => void removeLocal(item.contentType, item.slug, item.id)}
                                disabled={exiting}
                              >
                                Supprimer
                              </Button>
                              <Button
                                onClick={() => void downloadItem(item.contentType, item.slug)}
                                disabled={!status?.online}
                              >
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/offline/view/${item.contentType}/${item.slug}`}
                              className="block min-w-0"
                            >
                              <span className="block text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
                                {item.title}
                              </span>
                              <span className="mt-1 flex flex-wrap gap-1.5">
                                <StatusBadge tone={item.stale ? "stale" : "downloaded"}>
                                  {item.stale ? "Mise à jour disponible" : "Disponible hors-ligne"}
                                </StatusBadge>
                                <StatusBadge tone="muted">{TYPE_LABEL[item.contentType]}</StatusBadge>
                              </span>
                            </Link>
                            {item.stale && status?.online ? (
                              <Button
                                variant="secondary"
                                onClick={() => void downloadItem(item.contentType, item.slug)}
                              >
                                Mettre à jour
                              </Button>
                            ) : null}
                          </div>
                        )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
