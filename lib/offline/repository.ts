/**
 * ContentRepository — online API vs offline IndexedDB.
 * Calculators: engine chunks are loaded separately; payloads are encrypted at rest.
 * Inputs/results are not persisted.
 */

import { checksumPayload, verifyChecksum } from "@/lib/offline/checksum";
import {
  decryptJson,
  encryptJson,
  generateContentKey,
  type EncryptedBlob,
} from "@/lib/offline/crypto";
import {
  estimateStorageBytes,
  idbClearAll,
  idbDelete,
  idbGet,
  idbGetAll,
  idbPut,
} from "@/lib/offline/idb";
import type {
  LocalContentRecord,
  OfflineCatalogManifest,
  OfflineContentType,
  OfflineItemDto,
  OfflinePackDownload,
  OfflineStatus,
} from "@/lib/offline/types";
import type { SearchResult } from "@/types/search";

function isQuotaError(error: unknown) {
  if (error instanceof DOMException) {
    return error.name === "QuotaExceededError" || error.code === 22;
  }
  return error instanceof Error && /quota|storage/i.test(error.message);
}

const KEY_RECORD_ID = "content-key";
const SYNC_ID = "default";

type KeyRecord = { id: string; userId: string; createdAt: string; key: CryptoKey };
type EncryptedContentRow = {
  id: string;
  userId: string;
  contentType: OfflineContentType;
  slug: string;
  title: string;
  version: string;
  packId: string | null;
  downloadedAt: string;
  contentUpdatedAt: string;
  checksum: string;
  entitlement: "public_free" | "premium";
  stale: boolean;
  blob: EncryptedBlob;
};
type SearchRow = {
  id: string;
  userId: string;
  contentType: OfflineContentType;
  slug: string;
  title: string;
  href: string;
  blob: EncryptedBlob;
};
type SyncRow = {
  id: string;
  userId: string;
  lastSyncAt: string | null;
  lastPackSlug: string | null;
  manifestEtag: string | null;
  status: "idle" | "in_progress" | "failed" | "complete";
  bytes: number;
};
type PackRow = {
  id: string;
  userId: string;
  slug: string;
  title: string;
  version: number;
  checksum: string;
  visibility: "public_free" | "premium";
  downloadedAt: string;
  stale: boolean;
};

let memoryKey: { userId: string; key: CryptoKey } | null = null;
let interrupted = false;

function contentId(type: OfflineContentType, slug: string) {
  return `${type}:${slug}`;
}

function publicHref(type: OfflineContentType, slug: string): string {
  if (type === "cat") return `/cat/${slug}`;
  if (type === "drug") return `/drugs/${slug}`;
  if (type === "calculator") return `/calculators/${slug}`;
  return `/protocols/${slug}`;
}

async function requireKey(userId: string): Promise<CryptoKey> {
  if (memoryKey && memoryKey.userId === userId) {
    return memoryKey.key;
  }
  const existing = await idbGet<KeyRecord>("keys", KEY_RECORD_ID);
  if (existing && existing.userId === userId && existing.key) {
    memoryKey = { userId, key: existing.key };
    return existing.key;
  }
  if (existing && existing.userId !== userId) {
    await idbClearAll();
  }
  const key = await generateContentKey();
  await idbPut("keys", {
    id: KEY_RECORD_ID,
    userId,
    createdAt: new Date().toISOString(),
    key: key as unknown,
  });
  memoryKey = { userId, key };
  return key;
}

function etagHeaders(etag?: string | null): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (etag) headers["If-None-Match"] = etag;
  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export const contentRepository = {
  async getOfflineStatus(userId: string | null): Promise<OfflineStatus> {
    const items = userId
      ? (await idbGetAll<EncryptedContentRow>("content_items")).filter((row) => row.userId === userId)
      : [];
    const packs = userId
      ? (await idbGetAll<PackRow>("packs")).filter((row) => row.userId === userId)
      : [];
    const sync = await idbGet<SyncRow>("sync_state", SYNC_ID);
    return {
      online: typeof navigator === "undefined" ? true : navigator.onLine,
      lastSyncAt: sync?.lastSyncAt ?? null,
      storageBytes: await estimateStorageBytes(),
      itemCount: items.length,
      packCount: packs.length,
      updateAvailable: items.some((row) => row.stale) || packs.some((row) => row.stale),
      appVersion: null,
    };
  },

  async getPackManifest(userId: string, etag?: string | null): Promise<OfflineCatalogManifest | null> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return this.getLocalCatalog(userId);
    }
    const sync = await idbGet<SyncRow>("sync_state", SYNC_ID);
    const response = await fetch("/api/offline/manifest", {
      headers: etagHeaders(etag ?? sync?.manifestEtag),
      cache: "no-store",
    });
    if (response.status === 304) {
      return this.getLocalCatalog(userId);
    }
    if (!response.ok) {
      return this.getLocalCatalog(userId);
    }
    const catalog = await parseJson<OfflineCatalogManifest>(response);
    const nextEtag = response.headers.get("ETag");
    if (nextEtag) {
      await this.setSync(userId, { manifestEtag: nextEtag });
    }
    await this.markStaleFromManifest(userId, catalog);
    return catalog;
  },

  async getLocalCatalog(userId: string): Promise<OfflineCatalogManifest> {
    const packs = (await idbGetAll<PackRow>("packs")).filter((row) => row.userId === userId);
    const items = (await idbGetAll<EncryptedContentRow>("content_items")).filter(
      (row) => row.userId === userId,
    );
    return {
      generatedAt: new Date().toISOString(),
      packs: packs.map((pack) => ({
        slug: pack.slug,
        title: pack.title,
        description: null,
        version: pack.version,
        visibility: pack.visibility,
        status: "published",
        publishedAt: null,
        updatedAt: pack.downloadedAt,
        checksum: pack.checksum,
        itemCount: items.filter((item) => item.packId === pack.slug).length,
        items: [],
      })),
      individual: items.map((item) => ({
        contentType: item.contentType,
        slug: item.slug,
        title: item.title,
        version: item.version,
        checksum: item.checksum,
        visibility: item.entitlement,
        updatedAt: item.contentUpdatedAt,
      })),
    };
  },

  async downloadItem(userId: string, type: OfflineContentType, slug: string): Promise<OfflineItemDto> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("offline");
    }
    interrupted = false;
    await this.setSync(userId, { status: "in_progress", lastPackSlug: null });
    const response = await fetch(
      `/api/offline/item?type=${encodeURIComponent(type)}&slug=${encodeURIComponent(slug)}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      await this.setSync(userId, { status: "failed" });
      let reason = "unknown";
      try {
        const body = (await response.json()) as { error?: unknown };
        if (typeof body.error === "string" && body.error) {
          reason = body.error;
        }
      } catch {
        reason = "unknown";
      }
      throw new Error(`download_failed:${response.status}:${reason}`);
    }
    const item = await parseJson<OfflineItemDto>(response);
    if (interrupted) {
      await this.setSync(userId, { status: "failed" });
      throw new Error("download_interrupted");
    }
    await this.persistItem(userId, item, null);
    await this.setSync(userId, { status: "complete", lastSyncAt: new Date().toISOString() });
    return item;
  },

  async downloadPack(
    userId: string,
    slug: string,
    onProgress?: (done: number, total: number) => void,
  ): Promise<OfflinePackDownload> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      throw new Error("offline");
    }
    interrupted = false;
    await this.setSync(userId, { status: "in_progress", lastPackSlug: slug });
    const response = await fetch(`/api/offline/pack?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      await this.setSync(userId, { status: "failed" });
      let reason = "unknown";
      try {
        const body = (await response.json()) as { error?: unknown };
        if (typeof body.error === "string" && body.error) {
          reason = body.error;
        }
      } catch {
        reason = "unknown";
      }
      throw new Error(`download_failed:${response.status}:${reason}`);
    }
    const pack = await parseJson<OfflinePackDownload>(response);
    const total = pack.items.length;
    let done = 0;
    for (const item of pack.items) {
      if (interrupted) {
        await this.setSync(userId, { status: "failed" });
        throw new Error("download_interrupted");
      }
      await this.persistItem(userId, item, pack.pack.slug);
      await idbPut("pack_items", {
        id: `${pack.pack.slug}:${item.contentType}:${item.slug}`,
        userId,
        packId: pack.pack.slug,
        contentType: item.contentType,
        contentSlug: item.slug,
      } as { id: string } & Record<string, unknown>);
      done += 1;
      onProgress?.(done, total);
    }
    await idbPut("packs", {
      id: pack.pack.slug,
      userId,
      slug: pack.pack.slug,
      title: pack.pack.title,
      version: pack.pack.version,
      checksum: pack.pack.checksum,
      visibility: pack.pack.visibility,
      downloadedAt: new Date().toISOString(),
      stale: false,
    } as { id: string } & Record<string, unknown>);
    await this.setSync(userId, {
      status: "complete",
      lastSyncAt: new Date().toISOString(),
      lastPackSlug: slug,
    });
    return pack;
  },

  abortDownload() {
    interrupted = true;
  },

  async persistItem(userId: string, item: OfflineItemDto, packId: string | null) {
    const valid = await verifyChecksum(item.payload, item.checksum);
    if (!valid) {
      throw new Error("checksum_mismatch");
    }
    const key = await requireKey(userId);
    const blob = await encryptJson(key, item.payload);
    const id = contentId(item.contentType, item.slug);
    const row: EncryptedContentRow = {
      id,
      userId,
      contentType: item.contentType,
      slug: item.slug,
      title: item.title,
      version: item.version,
      packId,
      downloadedAt: new Date().toISOString(),
      contentUpdatedAt: item.updatedAt,
      checksum: item.checksum,
      entitlement: item.entitlement,
      stale: false,
      blob,
    };
    try {
      await idbPut("content_items", row as { id: string } & Record<string, unknown>);
      const searchBlob = await encryptJson(key, {
        title: item.title,
        slug: item.slug,
        contentType: item.contentType,
      });
      await idbPut("search_index", {
        id,
        userId,
        contentType: item.contentType,
        slug: item.slug,
        title: item.title,
        href: `/offline/view/${item.contentType}/${item.slug}`,
        blob: searchBlob,
      } as { id: string } & Record<string, unknown>);
      if (item.contentType === "calculator") {
        await idbPut("calculator_metadata", {
          id,
          userId,
          slug: item.slug,
          version: item.version,
          blob,
        } as { id: string } & Record<string, unknown>);
      }
    } catch (error) {
      if (isQuotaError(error)) {
        throw new Error("storage_full");
      }
      throw error;
    }
  },

  async getContent(userId: string, type: OfflineContentType, slug: string): Promise<unknown | null> {
    const local = await this.getLocalPayload(userId, type, slug);
    if (local) return local;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return null;
    }
    try {
      const item = await this.downloadItem(userId, type, slug);
      return item.payload;
    } catch {
      return null;
    }
  },

  async getLocalPayload(userId: string, type: OfflineContentType, slug: string): Promise<unknown | null> {
    const row = await idbGet<EncryptedContentRow>("content_items", contentId(type, slug));
    if (!row || row.userId !== userId) return null;
    const key = await requireKey(userId);
    try {
      return await decryptJson(key, row.blob);
    } catch {
      return null;
    }
  },

  async getProtocol(userId: string, slug: string) {
    return this.getContent(userId, "protocol", slug);
  },
  async getCat(userId: string, slug: string) {
    return this.getContent(userId, "cat", slug);
  },
  async getDrug(userId: string, slug: string) {
    return this.getContent(userId, "drug", slug);
  },
  async getCalculator(userId: string, slug: string) {
    return this.getContent(userId, "calculator", slug);
  },

  async listLocal(userId: string): Promise<LocalContentRecord[]> {
    const rows = (await idbGetAll<EncryptedContentRow>("content_items")).filter(
      (row) => row.userId === userId,
    );
    return rows.map((row) => ({
      id: row.id,
      contentType: row.contentType,
      slug: row.slug,
      title: row.title,
      version: row.version,
      packId: row.packId,
      downloadedAt: row.downloadedAt,
      contentUpdatedAt: row.contentUpdatedAt,
      checksum: row.checksum,
      entitlement: row.entitlement,
      stale: row.stale,
    }));
  },

  async searchContent(userId: string, query: string): Promise<SearchResult[]> {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const key = await requireKey(userId);
    const rows = (await idbGetAll<SearchRow>("search_index")).filter((row) => row.userId === userId);
    const results: SearchResult[] = [];
    for (const row of rows) {
      try {
        const entry = await decryptJson<{ title: string; slug: string; contentType: OfflineContentType }>(
          key,
          row.blob,
        );
        const haystack = `${entry.title} ${entry.slug}`.toLowerCase();
        if (!haystack.includes(needle)) continue;
        results.push({
          id: row.id,
          type: entry.contentType === "protocol" ? "protocol" : entry.contentType,
          slug: entry.slug,
          title: entry.title,
          href: `/offline/view/${entry.contentType}/${entry.slug}`,
          statusLabel: "Hors-ligne",
        });
      } catch {
        // Skip corrupted index rows.
      }
    }
    return results;
  },

  async inspectLocal(
    userId: string,
    type: OfflineContentType,
    slug: string,
  ): Promise<"missing" | "ok" | "corrupt"> {
    const row = await idbGet<EncryptedContentRow>("content_items", contentId(type, slug));
    if (!row || row.userId !== userId) return "missing";
    const key = await requireKey(userId);
    try {
      await decryptJson(key, row.blob);
      return "ok";
    } catch {
      return "corrupt";
    }
  },

  async removeItem(userId: string, type: OfflineContentType, slug: string) {
    const id = contentId(type, slug);
    const row = await idbGet<EncryptedContentRow>("content_items", id);
    if (row && row.userId === userId) {
      await idbDelete("content_items", id);
      await idbDelete("search_index", id);
      await idbDelete("calculator_metadata", id);
    }
  },

  async clearPrivateData() {
    memoryKey = null;
    await idbClearAll();
  },

  async markStaleFromManifest(userId: string, catalog: OfflineCatalogManifest) {
    const remoteItems = new Map(
      catalog.individual.map((item) => [`${item.contentType}:${item.slug}`, item.version]),
    );
    const localItems = (await idbGetAll<EncryptedContentRow>("content_items")).filter(
      (row) => row.userId === userId,
    );
    for (const row of localItems) {
      const remoteVersion = remoteItems.get(row.id);
      const stale = Boolean(remoteVersion && remoteVersion !== row.version);
      if (stale !== row.stale) {
        await idbPut("content_items", { ...row, stale } as { id: string } & Record<string, unknown>);
      }
    }
    const localPacks = (await idbGetAll<PackRow>("packs")).filter((row) => row.userId === userId);
    for (const pack of localPacks) {
      const remote = catalog.packs.find((item) => item.slug === pack.slug);
      const stale = Boolean(remote && remote.version !== pack.version);
      if (stale !== pack.stale) {
        await idbPut("packs", { ...pack, stale } as { id: string } & Record<string, unknown>);
      }
    }
  },

  async setSync(
    userId: string,
    patch: Partial<Pick<SyncRow, "status" | "lastSyncAt" | "lastPackSlug" | "manifestEtag">>,
  ) {
    const current = (await idbGet<SyncRow>("sync_state", SYNC_ID)) ?? {
      id: SYNC_ID,
      userId,
      lastSyncAt: null,
      lastPackSlug: null,
      manifestEtag: null,
      status: "idle" as const,
      bytes: 0,
    };
    await idbPut("sync_state", {
      ...current,
      userId,
      ...patch,
      bytes: await estimateStorageBytes(),
    } as { id: string } & Record<string, unknown>);
  },
};

export async function clearOfflinePrivateData() {
  await contentRepository.clearPrivateData();
}

export async function fingerprintPayload(payload: unknown) {
  return checksumPayload(payload);
}

export { publicHref };
