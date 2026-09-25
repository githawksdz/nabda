"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { createClient } from "@/lib/supabase/client";
import { contentRepository } from "@/lib/offline/repository";
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
    return "Espace de stockage insuffisant. Libérez de l’espace puis réessayez.";
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

  async function removeLocal(type: OfflineContentType, slug: string) {
    if (!userId) return;
    await contentRepository.removeItem(userId, type, slug);
    await refresh(userId);
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
    : `Dernière synchro ${new Date(status.lastSyncAt).toLocaleString("fr-FR")}`;

  return (
    <AppShell title="Hors-ligne">
      <div className="flex flex-col gap-5">
        {!authReady ? (
          <p className="text-body-sm">Vérification du compte…</p>
        ) : null}
        {authReady && !userId ? (
          <section className="rounded-2xl bg-surface-container-low p-4">
            <p className="text-body-md">Connectez-vous pour télécharger.</p>
            <Link href="/" className="mt-2 inline-flex min-h-11 items-center font-semibold">
              Se connecter
            </Link>
          </section>
        ) : null}

        {userId ? (
          <section className="rounded-2xl bg-surface-container-low p-4">
            <p className="text-label-sm text-on-surface-variant">
              {status?.online ? "En ligne" : "Hors-ligne"}
            </p>
            <p className="mt-1 text-body-sm">{lastSync}</p>
            <p className="mt-1 text-body-sm">
              {status?.itemCount ?? 0} contenus · {formatBytes(status?.storageBytes ?? 0)}
            </p>
            {status?.updateAvailable ? (
              <p className="mt-2 text-body-sm">Mise à jour disponible</p>
            ) : null}
          </section>
        ) : null}

        {progress ? <p className="text-body-sm">{progress}</p> : null}
        {error ? <p className="text-body-sm">{error}</p> : null}

        {userId ? (
          <>
            <label className="flex flex-col gap-1.5">
              <span className="text-label-md">Recherche locale</span>
              <input
                value={search}
                onChange={(event) => void runSearch(event.target.value)}
                className="min-h-11 rounded-xl bg-surface-container-low px-3.5 py-2.5 text-body-sm"
                placeholder="Titre déjà téléchargé"
              />
            </label>
            {searchHits.length > 0 ? (
              <ul className="space-y-2">
                {searchHits.map((hit) => (
                  <li key={hit.href}>
                    <Link href={hit.href} className="block rounded-xl bg-surface-container-low px-3.5 py-3 text-body-sm">
                      {hit.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : search.trim() ? (
              <p className="text-body-sm text-on-surface-variant">Aucun contenu téléchargé ne correspond.</p>
            ) : null}

            <section>
              <h2 className="text-headline-sm">Packs</h2>
              <div className="mt-3 space-y-3">
                {(manifest?.packs ?? []).map((pack) => (
                  <article key={pack.slug} className="rounded-2xl bg-surface-container-low p-4">
                    <p className="text-label-sm text-on-surface-variant">
                      {pack.visibility === "premium" ? "Pro" : "Gratuit"} · v{pack.version} · {pack.itemCount} items
                    </p>
                    <h3 className="mt-1 text-body-md font-medium">{pack.title}</h3>
                    <button
                      type="button"
                      className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-primary px-3 text-label-md text-on-primary disabled:opacity-50"
                      onClick={() => void downloadPack(pack.slug)}
                      disabled={!status?.online}
                    >
                      Télécharger le pack
                    </button>
                    {!status?.online ? (
                      <p className="mt-2 text-label-sm text-on-surface-variant">
                        Connexion requise pour télécharger.
                      </p>
                    ) : null}
                  </article>
                ))}
                {(manifest?.packs ?? []).length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant">
                    Aucun pack publié pour votre accès.
                  </p>
                ) : null}
              </div>
            </section>

            <section>
              <h2 className="text-headline-sm">Items individuels</h2>
              <div className="mt-3 space-y-2">
                {(manifest?.individual ?? []).slice(0, 40).map((item) => (
                  <div
                    key={`${item.contentType}:${item.slug}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3.5 py-3"
                  >
                    <div>
                      <p className="text-body-sm">{item.title}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {TYPE_LABEL[item.contentType]} · {item.visibility === "premium" ? "Pro" : "Gratuit"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center px-2 text-label-sm font-semibold disabled:opacity-50"
                      onClick={() => void downloadItem(item.contentType, item.slug)}
                      disabled={!status?.online}
                    >
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-headline-sm">Téléchargés</h2>
              {local.length === 0 ? (
                <p className="mt-3 text-body-sm text-on-surface-variant">
                  Aucun contenu téléchargé. Téléchargez une fiche ou un pack pour la
                  consulter sans connexion.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {local.map((item) => {
                    const corrupt = corruptIds.has(item.id);
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl bg-surface-container-low px-3.5 py-3"
                      >
                        {corrupt ? (
                          <>
                            <p className="text-body-sm">{item.title}</p>
                            <p className="mt-1 text-label-sm">
                              Ce contenu local est illisible. Supprimez-le puis
                              téléchargez-le à nouveau.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="inline-flex min-h-11 items-center font-semibold"
                                onClick={() => void removeLocal(item.contentType, item.slug)}
                              >
                                Supprimer
                              </button>
                              <button
                                type="button"
                                className="inline-flex min-h-11 items-center font-semibold"
                                onClick={() => void downloadItem(item.contentType, item.slug)}
                                disabled={!status?.online}
                              >
                                Télécharger
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/offline/view/${item.contentType}/${item.slug}`}
                              className="block"
                            >
                              <p className="text-body-sm">{item.title}</p>
                              <p className="text-label-sm text-on-surface-variant">
                                {item.stale
                                  ? "Mise à jour disponible"
                                  : "Disponible hors-ligne"}
                                {" · "}
                                {TYPE_LABEL[item.contentType]}
                              </p>
                            </Link>
                            {item.stale && status?.online ? (
                              <button
                                type="button"
                                className="mt-2 inline-flex min-h-11 items-center font-semibold"
                                onClick={() => void downloadItem(item.contentType, item.slug)}
                              >
                                Mettre à jour
                              </button>
                            ) : null}
                          </>
                        )}
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
