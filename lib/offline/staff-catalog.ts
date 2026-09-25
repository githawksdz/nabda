/**
 * Server-only staff pack catalog. RLS user client + editor RPCs.
 * Never uses the service-role admin client.
 */

import { requireRole } from "@/lib/authz/access";
import { createRlsClient } from "@/lib/supabase/rls-client";
import type { OfflineContentType, OfflineEntitlement } from "@/lib/offline/types";
import { validatePackItem, validatePackPublish, packRuleMessage } from "@/lib/offline/staff-rules";
import type {
  StaffContentRow,
  StaffMutationResult,
  StaffOfflineCatalog,
  StaffPackRow,
} from "@/lib/offline/staff-types";

const PROTOCOL_STAFF_SELECT = "slug, title, status, visibility, offline_available, updated_at";
const CAT_STAFF_SELECT = "slug, title, status, visibility, offline_available, updated_at";
const DRUG_STAFF_SELECT =
  "slug, display_name, status, visibility, offline_available, updated_at";
const CALCULATOR_STAFF_SELECT = "slug, title, status, visibility, offline_available, updated_at";
const PACK_STAFF_SELECT =
  "id, slug, title, description, version, visibility, status, published_at, updated_at";
const PACK_ITEM_STAFF_SELECT = "pack_id, content_type, content_slug, sort_order";

const EMPTY_CATALOG: StaffOfflineCatalog = {
  contents: [],
  packs: [],
  schemaReady: false,
  schemaError: "schema_unavailable",
};

function asEntitlement(visibility: string | null | undefined): OfflineEntitlement {
  return visibility === "premium" ? "premium" : "public_free";
}

function rpcMessage(error: { message?: string; code?: string } | null): string {
  const message = error?.message ?? "mutation_failed";
  if (message.includes("not authorized")) return "Action réservée aux éditeurs et admins.";
  if (message.includes("empty pack")) return packRuleMessage("empty_pack");
  if (message.includes("premium content")) return packRuleMessage("premium_in_free_pack");
  if (message.includes("published and offline")) return packRuleMessage("not_offline_available");
  if (message.includes("ineligible")) return "Le pack contient des éléments inéligibles.";
  if (message.includes("published pack")) {
    return "Retirez d’abord cet élément des packs publiés.";
  }
  if (message.includes("schema cache") || message.includes("does not exist")) {
    return "Migrations 0022/0023 non appliquées sur cette base.";
  }
  return message;
}

async function requireEditorClient() {
  const viewer = await requireRole("editor");
  if (!viewer) {
    return { error: "Action réservée aux éditeurs et admins." as const, client: null };
  }
  const client = await createRlsClient();
  if (!client) {
    return { error: "Supabase n’est pas configuré." as const, client: null };
  }
  return { error: null, client };
}

type IdentityLite = {
  slug: string;
  title: string;
  status: string;
  visibility: string;
  offlineAvailable: boolean;
  updatedAt: string;
  contentType: OfflineContentType;
};

function mapIdentity(
  type: OfflineContentType,
  row: {
    slug: string;
    title?: string | null;
    display_name?: string | null;
    status: string;
    visibility: string;
    offline_available?: boolean | null;
    updated_at: string;
  },
): IdentityLite {
  return {
    contentType: type,
    slug: row.slug,
    title: String(row.title ?? row.display_name ?? row.slug),
    status: row.status,
    visibility: row.visibility,
    offlineAvailable: row.offline_available === true,
    updatedAt: row.updated_at,
  };
}

export async function loadStaffOfflineCatalog(): Promise<StaffOfflineCatalog> {
  const access = await requireEditorClient();
  if (access.error || !access.client) {
    return { ...EMPTY_CATALOG, schemaError: access.error ?? "unauthorized" };
  }
  const supabase = access.client;

  const [protocols, cats, drugs, calculators, packs, packItems] = await Promise.all([
    supabase.from("protocols").select(PROTOCOL_STAFF_SELECT).order("title"),
    supabase.from("cat_maps").select(CAT_STAFF_SELECT).order("title"),
    supabase.from("drugs").select(DRUG_STAFF_SELECT).order("display_name"),
    supabase.from("calculators").select(CALCULATOR_STAFF_SELECT).order("title"),
    supabase.from("content_packs").select(PACK_STAFF_SELECT).order("updated_at", { ascending: false }),
    supabase.from("content_pack_items").select(PACK_ITEM_STAFF_SELECT).order("sort_order"),
  ]);

  const schemaError =
    packs.error?.message ??
    packItems.error?.message ??
    protocols.error?.message ??
    cats.error?.message ??
    drugs.error?.message ??
    calculators.error?.message ??
    null;
  if (schemaError && /schema cache|does not exist|offline_available/i.test(schemaError)) {
    return { ...EMPTY_CATALOG, schemaError };
  }

  const identities: IdentityLite[] = [
    ...(protocols.data ?? []).map((row) => mapIdentity("protocol", row)),
    ...(cats.data ?? []).map((row) => mapIdentity("cat", row)),
    ...(drugs.data ?? []).map((row) => mapIdentity("drug", row)),
    ...(calculators.data ?? []).map((row) => mapIdentity("calculator", row)),
  ];
  const byKey = new Map(identities.map((row) => [`${row.contentType}:${row.slug}`, row]));

  const membership = new Map<string, string[]>();
  const packsOut: StaffPackRow[] = (packs.data ?? []).map((pack) => {
    const items = (packItems.data ?? [])
      .filter((item) => item.pack_id === pack.id)
      .map((item) => {
        const identity = byKey.get(`${item.content_type}:${item.content_slug}`);
        const key = `${item.content_type}:${item.content_slug}`;
        const slugs = membership.get(key) ?? [];
        slugs.push(pack.slug);
        membership.set(key, slugs);
        return {
          contentType: item.content_type as OfflineContentType,
          slug: item.content_slug,
          sortOrder: item.sort_order,
          title: identity?.title ?? item.content_slug,
          status: identity?.status ?? "unknown",
          visibility: identity?.visibility ?? "public_free",
          offlineAvailable: identity?.offlineAvailable ?? false,
        };
      });
    return {
      id: pack.id,
      slug: pack.slug,
      title: pack.title,
      description: pack.description,
      version: pack.version,
      visibility: asEntitlement(pack.visibility),
      status: pack.status,
      publishedAt: pack.published_at,
      updatedAt: pack.updated_at,
      items,
    };
  });

  const contents: StaffContentRow[] = identities.map((row) => ({
    contentType: row.contentType,
    slug: row.slug,
    title: row.title,
    status: row.status,
    visibility: row.visibility,
    offlineAvailable: row.offlineAvailable,
    updatedAt: row.updatedAt,
    packSlugs: membership.get(`${row.contentType}:${row.slug}`) ?? [],
  }));

  return {
    contents,
    packs: packsOut,
    schemaReady: true,
    schemaError: schemaError,
  };
}

export async function staffSetOfflineAvailable(
  contentType: OfflineContentType,
  slug: string,
  available: boolean,
): Promise<StaffMutationResult> {
  const access = await requireEditorClient();
  if (access.error || !access.client) {
    return { ok: false, message: access.error ?? "unauthorized" };
  }
  const { error } = await access.client.rpc("staff_set_offline_available", {
    p_content_type: contentType,
    p_content_slug: slug,
    p_available: available,
  });
  const catalog = await loadStaffOfflineCatalog();
  if (error) {
    return { ok: false, message: rpcMessage(error), catalog };
  }
  return {
    ok: true,
    message: available ? "Disponible hors-ligne." : "Retiré du hors-ligne.",
    catalog,
  };
}

export async function staffUpsertPack(input: {
  id?: string | null;
  slug: string;
  title: string;
  description: string | null;
  visibility: OfflineEntitlement;
  version: number;
}): Promise<StaffMutationResult> {
  const access = await requireEditorClient();
  if (access.error || !access.client) {
    return { ok: false, message: access.error ?? "unauthorized" };
  }
  const { error } = await access.client.rpc("staff_upsert_content_pack", {
    p_id: input.id ?? null,
    p_slug: input.slug,
    p_title: input.title,
    p_description: input.description,
    p_visibility: input.visibility,
    p_version: input.version,
  });
  const catalog = await loadStaffOfflineCatalog();
  if (error) {
    return { ok: false, message: rpcMessage(error), catalog };
  }
  return { ok: true, message: "Pack enregistré.", catalog };
}

export async function staffReplacePackItems(
  packId: string,
  items: Array<{ contentType: OfflineContentType; slug: string; sortOrder: number }>,
  catalogHint?: StaffOfflineCatalog,
): Promise<StaffMutationResult> {
  const access = await requireEditorClient();
  if (access.error || !access.client) {
    return { ok: false, message: access.error ?? "unauthorized" };
  }
  const catalog = catalogHint ?? (await loadStaffOfflineCatalog());
  const pack = catalog.packs.find((row) => row.id === packId);
  if (pack) {
    const resolved = items.map((item) => {
      const row = catalog.contents.find(
        (content) => content.contentType === item.contentType && content.slug === item.slug,
      );
      return {
        contentType: item.contentType,
        slug: item.slug,
        status: row?.status,
        visibility: row?.visibility,
        offlineAvailable: row?.offlineAvailable,
      };
    });
    for (const item of resolved) {
      const decision = validatePackItem(pack, item);
      if (!decision.ok) {
        return { ok: false, message: packRuleMessage(decision.reason), catalog };
      }
    }
  }
  const { error } = await access.client.rpc("staff_replace_pack_items", {
    p_pack_id: packId,
    p_items: items.map((item) => ({
      content_type: item.contentType,
      content_slug: item.slug,
      sort_order: item.sortOrder,
    })),
  });
  const next = await loadStaffOfflineCatalog();
  if (error) {
    return { ok: false, message: rpcMessage(error), catalog: next };
  }
  return { ok: true, message: "Membres du pack mis à jour.", catalog: next };
}

export async function staffSetPackStatus(
  packId: string,
  status: "draft" | "published",
): Promise<StaffMutationResult> {
  const access = await requireEditorClient();
  if (access.error || !access.client) {
    return { ok: false, message: access.error ?? "unauthorized" };
  }
  const catalog = await loadStaffOfflineCatalog();
  const pack = catalog.packs.find((row) => row.id === packId);
  if (status === "published" && pack) {
    const decision = validatePackPublish(pack, pack.items);
    if (!decision.ok) {
      return { ok: false, message: packRuleMessage(decision.reason), catalog };
    }
  }
  const { error } = await access.client.rpc("staff_set_pack_status", {
    p_pack_id: packId,
    p_status: status,
  });
  const next = await loadStaffOfflineCatalog();
  if (error) {
    return { ok: false, message: rpcMessage(error), catalog: next };
  }
  return {
    ok: true,
    message: status === "published" ? "Pack publié." : "Pack dépublié.",
    catalog: next,
  };
}
