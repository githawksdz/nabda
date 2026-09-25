"use client";

import { useMemo, useState, useTransition } from "react";
import {
  replacePackItemsAction,
  setOfflineAvailableAction,
  setPackStatusAction,
  upsertPackAction,
} from "@/lib/offline/staff-actions";
import { packRuleMessage, validatePackItem, validatePackPublish } from "@/lib/offline/staff-rules";
import type { OfflineContentType, OfflineEntitlement } from "@/lib/offline/types";
import type { StaffContentRow, StaffOfflineCatalog, StaffPackRow } from "@/lib/offline/staff-types";

type OfflinePacksStaffPageProps = {
  initial: StaffOfflineCatalog;
};

const TYPES: Array<{ id: OfflineContentType | "all"; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "protocol", label: "Protocoles" },
  { id: "cat", label: "CAT" },
  { id: "drug", label: "Médicaments" },
  { id: "calculator", label: "Calculateurs" },
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function statusLabel(status: string) {
  return status === "published" ? "Publié" : status === "draft" ? "Brouillon" : status;
}

function visibilityLabel(visibility: string) {
  return visibility === "premium" ? "Premium" : "Gratuit";
}

export function OfflinePacksStaffPage({ initial }: OfflinePacksStaffPageProps) {
  const [catalog, setCatalog] = useState(initial);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OfflineContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedPackId, setSelectedPackId] = useState<string | "new" | null>(
    initial.packs[0]?.id ?? "new",
  );
  const [draft, setDraft] = useState({
    slug: "",
    title: "",
    description: "",
    visibility: "public_free" as OfflineEntitlement,
    version: 1,
  });

  const selectedPack: StaffPackRow | null =
    selectedPackId && selectedPackId !== "new"
      ? (catalog.packs.find((pack) => pack.id === selectedPackId) ?? null)
      : null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.contents.filter((row) => {
      if (typeFilter !== "all" && row.contentType !== typeFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (!needle) return true;
      return `${row.title} ${row.slug}`.toLowerCase().includes(needle);
    });
  }, [catalog.contents, query, typeFilter, statusFilter]);

  function applyResult(result: { ok: boolean; message: string; catalog?: StaffOfflineCatalog }) {
    if (result.catalog) {
      setCatalog(result.catalog);
      if (selectedPackId === "new") {
        const created = result.catalog.packs.find((pack) => pack.slug === draft.slug);
        if (created) setSelectedPackId(created.id);
      }
    }
    if (result.ok) {
      setError(null);
      setMessage(result.message);
    } else {
      setMessage(null);
      setError(result.message);
    }
  }

  function startNewPack() {
    setSelectedPackId("new");
    setDraft({
      slug: "",
      title: "",
      description: "",
      visibility: "public_free",
      version: 1,
    });
  }

  function openPack(pack: StaffPackRow) {
    setSelectedPackId(pack.id);
    setDraft({
      slug: pack.slug,
      title: pack.title,
      description: pack.description ?? "",
      visibility: pack.visibility,
      version: pack.version,
    });
  }

  function run(task: () => Promise<{ ok: boolean; message: string; catalog?: StaffOfflineCatalog }>) {
    startTransition(() => {
      void (async () => applyResult(await task()))();
    });
  }

  const publishPreview = selectedPack
    ? validatePackPublish(selectedPack, selectedPack.items)
    : { ok: false as const, reason: "empty_pack" as const };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-headline-sm">Packs hors-ligne</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Hub de publication uniquement. Brouillon ou publié, gratuit ou premium. Pas de circuit
          de relecture médicale.
        </p>
      </header>

      {catalog.schemaError ? (
        <p className="rounded-xl bg-error-container/70 px-3.5 py-3 text-body-sm text-error">
          Schéma hors-ligne indisponible. Appliquez les migrations 0022 puis 0023.{" "}
          {catalog.schemaError}
        </p>
      ) : null}
      {message ? <p className="text-body-sm">{message}</p> : null}
      {error ? <p className="text-body-sm text-error">{error}</p> : null}
      {pending ? <p className="text-label-sm text-on-surface-variant">Enregistrement…</p> : null}

      <section className="rounded-2xl bg-surface-container-low p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-headline-sm">Packs</h2>
          <button
            type="button"
            className="h-10 rounded-lg bg-primary px-3 text-label-md text-on-primary"
            onClick={startNewPack}
          >
            Nouveau pack
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {catalog.packs.map((pack) => (
            <li key={pack.id}>
              <button
                type="button"
                onClick={() => openPack(pack)}
                className={`w-full rounded-xl px-3.5 py-3 text-left ${
                  pack.id === selectedPackId ? "bg-primary text-on-primary" : "bg-surface"
                }`}
              >
                <p className="text-body-sm font-medium">{pack.title}</p>
                <p className="text-label-sm opacity-80">
                  {statusLabel(pack.status)} · {visibilityLabel(pack.visibility)} · v{pack.version} ·{" "}
                  {pack.items.length} items
                </p>
              </button>
            </li>
          ))}
          {catalog.packs.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">Aucun pack pour le moment.</p>
          ) : null}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface-container-low p-4">
        <h2 className="text-headline-sm">
          {selectedPackId === "new" ? "Créer un pack" : "Éditer le pack"}
        </h2>
        <div className="mt-3 grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-label-md">Titre</span>
            <input
              value={draft.title}
              onChange={(event) => {
                const title = event.target.value;
                setDraft((current) => ({
                  ...current,
                  title,
                  slug: selectedPackId === "new" ? slugify(title) : current.slug,
                }));
              }}
              className="rounded-xl bg-surface px-3.5 py-2.5 text-body-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label-md">Slug</span>
            <input
              value={draft.slug}
              onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))}
              className="rounded-xl bg-surface px-3.5 py-2.5 text-body-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label-md">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-20 rounded-xl bg-surface px-3.5 py-2.5 text-body-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-label-md">Visibilité</span>
              <select
                value={draft.visibility}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    visibility: event.target.value as OfflineEntitlement,
                  }))
                }
                className="rounded-xl bg-surface px-3.5 py-2.5 text-body-sm"
              >
                <option value="public_free">Gratuit</option>
                <option value="premium">Premium</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-label-md">Version</span>
              <input
                type="number"
                min={1}
                value={draft.version}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    version: Number(event.target.value) || 1,
                  }))
                }
                className="rounded-xl bg-surface px-3.5 py-2.5 text-body-sm"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={pending}
            className="h-11 rounded-lg bg-primary text-label-md text-on-primary"
            onClick={() =>
              run(() =>
                upsertPackAction({
                  id: selectedPack?.id ?? null,
                  slug: draft.slug,
                  title: draft.title,
                  description: draft.description || null,
                  visibility: draft.visibility,
                  version: draft.version,
                }),
              )
            }
          >
            Enregistrer le pack
          </button>
          {selectedPack ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending || !publishPreview.ok}
                className="h-11 flex-1 rounded-lg bg-primary text-label-md text-on-primary disabled:opacity-50"
                onClick={() =>
                  run(() => setPackStatusAction({ packId: selectedPack.id, status: "published" }))
                }
              >
                Publier
              </button>
              <button
                type="button"
                disabled={pending || selectedPack.status !== "published"}
                className="h-11 flex-1 rounded-lg bg-surface text-label-md disabled:opacity-50"
                onClick={() =>
                  run(() => setPackStatusAction({ packId: selectedPack.id, status: "draft" }))
                }
              >
                Dépublier
              </button>
            </div>
          ) : null}
          {selectedPack && !publishPreview.ok ? (
            <p className="text-body-sm text-error">{packRuleMessage(publishPreview.reason)}</p>
          ) : null}
        </div>

        {selectedPack ? (
          <div className="mt-5">
            <h3 className="text-body-md font-medium">Membres ({selectedPack.items.length})</h3>
            <ul className="mt-2 space-y-2">
              {selectedPack.items.map((item, index) => (
                <li
                  key={`${item.contentType}:${item.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2"
                >
                  <div>
                    <p className="text-body-sm">{item.title}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {item.contentType} · {statusLabel(item.status)} ·{" "}
                      {visibilityLabel(item.visibility)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={index === 0 || pending}
                      className="rounded-lg bg-surface-container-low px-2 py-1 text-label-sm disabled:opacity-40"
                      onClick={() => {
                        const next = [...selectedPack.items];
                        const swap = next[index - 1];
                        next[index - 1] = next[index];
                        next[index] = swap;
                        run(() =>
                          replacePackItemsAction({
                            packId: selectedPack.id,
                            items: next.map((row, sortOrder) => ({
                              contentType: row.contentType,
                              slug: row.slug,
                              sortOrder,
                            })),
                          }),
                        );
                      }}
                    >
                      Haut
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded-lg bg-surface-container-low px-2 py-1 text-label-sm"
                      onClick={() => {
                        const next = selectedPack.items.filter((_, itemIndex) => itemIndex !== index);
                        run(() =>
                          replacePackItemsAction({
                            packId: selectedPack.id,
                            items: next.map((row, sortOrder) => ({
                              contentType: row.contentType,
                              slug: row.slug,
                              sortOrder,
                            })),
                          }),
                        );
                      }}
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="text-headline-sm">Contenus</h2>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un titre ou slug"
          className="mt-3 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-body-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setTypeFilter(type.id)}
              className={`rounded-full px-3 py-1.5 text-label-sm ${
                typeFilter === type.id ? "bg-primary text-on-primary" : "bg-surface-container-low"
              }`}
            >
              {type.label}
            </button>
          ))}
          {(["all", "published", "draft"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-label-sm ${
                statusFilter === status ? "bg-primary text-on-primary" : "bg-surface-container-low"
              }`}
            >
              {status === "all" ? "Tous statuts" : statusLabel(status)}
            </button>
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {filtered.map((row) => (
            <ContentRow
              key={`${row.contentType}:${row.slug}`}
              row={row}
              pack={selectedPack}
              pending={pending}
              onToggle={(available) =>
                run(() =>
                  setOfflineAvailableAction({
                    contentType: row.contentType,
                    slug: row.slug,
                    available,
                  }),
                )
              }
              onAdd={() => {
                if (!selectedPack) {
                  setError("Enregistrez un pack avant d’ajouter des contenus.");
                  return;
                }
                const decision = validatePackItem(selectedPack, {
                  contentType: row.contentType,
                  slug: row.slug,
                  status: row.status,
                  visibility: row.visibility,
                  offlineAvailable: row.offlineAvailable,
                });
                if (!decision.ok) {
                  setError(packRuleMessage(decision.reason));
                  return;
                }
                const next = [
                  ...selectedPack.items,
                  {
                    contentType: row.contentType,
                    slug: row.slug,
                    sortOrder: selectedPack.items.length,
                  },
                ];
                run(() =>
                  replacePackItemsAction({
                    packId: selectedPack.id,
                    items: next.map((item, sortOrder) => ({
                      contentType: item.contentType,
                      slug: item.slug,
                      sortOrder,
                    })),
                  }),
                );
              }}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}

function ContentRow({
  row,
  pack,
  pending,
  onToggle,
  onAdd,
}: {
  row: StaffContentRow;
  pack: StaffPackRow | null;
  pending: boolean;
  onToggle: (available: boolean) => void;
  onAdd: () => void;
}) {
  const inSelected = pack?.items.some(
    (item) => item.contentType === row.contentType && item.slug === row.slug,
  );
  return (
    <li className="rounded-xl bg-surface-container-low px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-sm">{row.title}</p>
          <p className="text-label-sm text-on-surface-variant">
            {row.contentType} · {statusLabel(row.status)} · {visibilityLabel(row.visibility)}
            {row.packSlugs.length ? ` · packs: ${row.packSlugs.join(", ")}` : " · hors pack"}
          </p>
        </div>
        <button
          type="button"
          disabled={pending}
          className="text-label-sm underline"
          onClick={() => onToggle(!row.offlineAvailable)}
        >
          {row.offlineAvailable ? "Hors-ligne: oui" : "Hors-ligne: non"}
        </button>
      </div>
      {pack && !inSelected ? (
        <button
          type="button"
          disabled={pending}
          className="mt-2 text-label-sm underline"
          onClick={onAdd}
        >
          Ajouter au pack
        </button>
      ) : null}
    </li>
  );
}
