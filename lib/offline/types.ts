/**
 * Offline/PWA content types. Narrow DTOs only — never raw database rows.
 */

export type OfflineContentType = "protocol" | "cat" | "drug" | "calculator";

export type OfflineEntitlement = "public_free" | "premium";

export type OfflineItemDto = {
  contentType: OfflineContentType;
  slug: string;
  title: string;
  version: string;
  updatedAt: string;
  checksum: string;
  visibility: OfflineEntitlement;
  entitlement: OfflineEntitlement;
  offlineAvailable: true;
  payload: unknown;
};

export type OfflinePackManifest = {
  slug: string;
  title: string;
  description: string | null;
  version: number;
  visibility: OfflineEntitlement;
  status: "published";
  publishedAt: string | null;
  updatedAt: string;
  checksum: string;
  itemCount: number;
  items: Array<{
    contentType: OfflineContentType;
    slug: string;
    sortOrder: number;
    version: string;
    checksum: string;
    visibility: OfflineEntitlement;
  }>;
};

export type OfflineCatalogManifest = {
  generatedAt: string;
  packs: OfflinePackManifest[];
  individual: Array<{
    contentType: OfflineContentType;
    slug: string;
    title: string;
    version: string;
    checksum: string;
    visibility: OfflineEntitlement;
    updatedAt: string;
  }>;
};

export type OfflinePackDownload = {
  pack: OfflinePackManifest;
  items: OfflineItemDto[];
};

export type LocalContentRecord = {
  id: string;
  contentType: OfflineContentType;
  slug: string;
  title: string;
  version: string;
  packId: string | null;
  downloadedAt: string;
  contentUpdatedAt: string;
  checksum: string;
  entitlement: OfflineEntitlement;
  stale: boolean;
};

export type OfflineStatus = {
  online: boolean;
  lastSyncAt: string | null;
  storageBytes: number;
  itemCount: number;
  packCount: number;
  updateAvailable: boolean;
  appVersion: string | null;
};

export type DownloadFailureReason =
  | "unauthenticated"
  | "unpublished"
  | "draft"
  | "not_offline_available"
  | "premium_requires_pro"
  | "hidden"
  | "unknown"
  | "pack_unpublished"
  | "pack_item_missing"
  | "premium_in_free_pack"
  | "checksum_mismatch"
  | "integrity_failed";
