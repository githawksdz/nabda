"use server";

import { z } from "zod";
import {
  loadStaffOfflineCatalog,
  staffReplacePackItems,
  staffSetOfflineAvailable,
  staffSetPackStatus,
  staffUpsertPack,
} from "@/lib/offline/staff-catalog";
import type { StaffMutationResult, StaffOfflineCatalog } from "@/lib/offline/staff-types";

const contentTypeSchema = z.enum(["protocol", "cat", "drug", "calculator"]);
const visibilitySchema = z.enum(["public_free", "premium"]);
const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide.");

export async function getStaffOfflineCatalogAction(): Promise<StaffOfflineCatalog> {
  return loadStaffOfflineCatalog();
}

export async function setOfflineAvailableAction(input: {
  contentType: string;
  slug: string;
  available: boolean;
}): Promise<StaffMutationResult> {
  const parsed = z
    .object({
      contentType: contentTypeSchema,
      slug: z.string().trim().min(1),
      available: z.boolean(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Requête invalide." };
  }
  return staffSetOfflineAvailable(
    parsed.data.contentType,
    parsed.data.slug,
    parsed.data.available,
  );
}

export async function upsertPackAction(input: {
  id?: string | null;
  slug: string;
  title: string;
  description: string | null;
  visibility: string;
  version: number;
}): Promise<StaffMutationResult> {
  const parsed = z
    .object({
      id: z.string().uuid().nullable().optional(),
      slug: slugSchema,
      title: z.string().trim().min(1, "Titre requis."),
      description: z.string().nullable(),
      visibility: visibilitySchema,
      version: z.number().int().min(1),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Requête invalide." };
  }
  return staffUpsertPack({
    id: parsed.data.id ?? null,
    slug: parsed.data.slug,
    title: parsed.data.title,
    description: parsed.data.description,
    visibility: parsed.data.visibility,
    version: parsed.data.version,
  });
}

export async function replacePackItemsAction(input: {
  packId: string;
  items: Array<{ contentType: string; slug: string; sortOrder: number }>;
}): Promise<StaffMutationResult> {
  const parsed = z
    .object({
      packId: z.string().uuid(),
      items: z.array(
        z.object({
          contentType: contentTypeSchema,
          slug: z.string().trim().min(1),
          sortOrder: z.number().int().min(0),
        }),
      ),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Requête invalide." };
  }
  return staffReplacePackItems(parsed.data.packId, parsed.data.items);
}

export async function setPackStatusAction(input: {
  packId: string;
  status: "draft" | "published";
}): Promise<StaffMutationResult> {
  const parsed = z
    .object({
      packId: z.string().uuid(),
      status: z.enum(["draft", "published"]),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Requête invalide." };
  }
  return staffSetPackStatus(parsed.data.packId, parsed.data.status);
}
