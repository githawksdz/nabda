/**
 * Staff offline catalog DTOs. Explicit fields only.
 */

import type { OfflineContentType, OfflineEntitlement } from "@/lib/offline/types";

export type StaffContentRow = {
  contentType: OfflineContentType;
  slug: string;
  title: string;
  status: "draft" | "published" | string;
  visibility: OfflineEntitlement | string;
  offlineAvailable: boolean;
  updatedAt: string;
  packSlugs: string[];
};

export type StaffPackItemRow = {
  contentType: OfflineContentType;
  slug: string;
  sortOrder: number;
  title: string;
  status: string;
  visibility: string;
  offlineAvailable: boolean;
};

export type StaffPackRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  version: number;
  visibility: OfflineEntitlement;
  status: "draft" | "published" | string;
  publishedAt: string | null;
  updatedAt: string;
  items: StaffPackItemRow[];
};

export type StaffOfflineCatalog = {
  contents: StaffContentRow[];
  packs: StaffPackRow[];
  schemaReady: boolean;
  schemaError: string | null;
};

export type StaffMutationResult =
  | { ok: true; message: string; catalog: StaffOfflineCatalog }
  | { ok: false; message: string; catalog?: StaffOfflineCatalog };
