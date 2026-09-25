/**
 * Server-only offline DTO builder. RLS user client. No service role.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getViewerAccess, requireAuthenticatedUser } from "@/lib/authz/access";
import { checksumPayload } from "@/lib/offline/checksum";
import { decideDownload, decidePackDownload } from "@/lib/offline/download-rules";
import type {
  OfflineCatalogManifest,
  OfflineContentType,
  OfflineEntitlement,
  OfflineItemDto,
  OfflinePackDownload,
  OfflinePackManifest,
} from "@/lib/offline/types";
import { createRlsClient } from "@/lib/supabase/rls-client";
import { getProtocolRenderData } from "@/lib/content-data/protocol-data";
import { getCatRenderData } from "@/lib/content-data/cat-data";
import { getDrugRenderData } from "@/lib/content-data/drug-data";
import { getCalculatorRenderData } from "@/lib/content-data/calculator-data";
import type { ViewerAccess } from "@/lib/authz/content-gate";

type IdentityRow = {
  slug: string;
  title?: string | null;
  display_name?: string | null;
  status: string;
  visibility: string;
  offline_available: boolean;
  updated_at: string;
};

const TABLES: Record<OfflineContentType, string> = {
  protocol: "protocols",
  cat: "cat_maps",
  drug: "drugs",
  calculator: "calculators",
};

function asEntitlement(visibility: string): OfflineEntitlement {
  return visibility === "premium" ? "premium" : "public_free";
}

async function db(): Promise<SupabaseClient | null> {
  const client = await createRlsClient();
  return client as unknown as SupabaseClient | null;
}

export async function requireOfflineViewer() {
  const session = await requireAuthenticatedUser();
  if (!session) return null;
  const viewer = await getViewerAccess();
  if (!viewer.authenticated) return null;
  return { ...session, viewer };
}

async function loadIdentity(
  type: OfflineContentType,
  slug: string,
): Promise<IdentityRow | null> {
  const supabase = await db();
  if (!supabase) return null;
  const columns =
    type === "drug"
      ? "slug, display_name, status, visibility, offline_available, updated_at"
      : "slug, title, status, visibility, offline_available, updated_at";
  const { data, error } = await supabase.from(TABLES[type]).select(columns).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  const row = data as IdentityRow;
  return { ...row, title: row.title ?? row.display_name ?? slug };
}

async function loadPayload(type: OfflineContentType, slug: string): Promise<unknown | null> {
  if (type === "protocol") return getProtocolRenderData(slug, { linkMode: "public" });
  if (type === "cat") return getCatRenderData(slug, { linkMode: "public" });
  if (type === "drug") return getDrugRenderData(slug, { linkMode: "public" });
  return getCalculatorRenderData(slug, { linkMode: "public" });
}

export async function buildOfflineItem(
  type: OfflineContentType,
  slug: string,
  viewer: ViewerAccess,
): Promise<{ item: OfflineItemDto } | { error: number; reason: string }> {
  const identity = await loadIdentity(type, slug);
  const decision = decideDownload(
    identity
      ? {
          contentType: type,
          slug: identity.slug,
          status: identity.status,
          visibility: identity.visibility,
          offlineAvailable: identity.offline_available,
        }
      : null,
    viewer,
  );
  if (!decision.ok) {
    return { error: decision.reason === "unauthenticated" ? 401 : 404, reason: decision.reason };
  }
  const payload = await loadPayload(type, slug);
  if (!payload || !identity) {
    return { error: 404, reason: "unknown" };
  }
  const checksum = await checksumPayload(payload);
  const entitlement = asEntitlement(identity.visibility);
  return {
    item: {
      contentType: type,
      slug: identity.slug,
      title: String(identity.title ?? slug),
      version: identity.updated_at,
      updatedAt: identity.updated_at,
      checksum,
      visibility: entitlement,
      entitlement,
      offlineAvailable: true,
      payload,
    },
  };
}

export async function buildCatalogManifest(
  viewer: ViewerAccess,
): Promise<OfflineCatalogManifest | null> {
  const supabase = await db();
  if (!supabase) return null;

  const [packsRes, protocols, cats, drugs, calculators] = await Promise.all([
    supabase
      .from("content_packs")
      .select("id, slug, title, description, version, visibility, status, published_at, updated_at")
      .eq("status", "published"),
    supabase
      .from("protocols")
      .select("slug, title, status, visibility, offline_available, updated_at")
      .eq("status", "published")
      .eq("offline_available", true),
    supabase
      .from("cat_maps")
      .select("slug, title, status, visibility, offline_available, updated_at")
      .eq("status", "published")
      .eq("offline_available", true),
    supabase
      .from("drugs")
      .select("slug, display_name, status, visibility, offline_available, updated_at")
      .eq("status", "published")
      .eq("offline_available", true),
    supabase
      .from("calculators")
      .select("slug, title, status, visibility, offline_available, updated_at")
      .eq("status", "published")
      .eq("offline_available", true),
  ]);

  const packRows = (packsRes.data ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    version: number;
    visibility: string;
    status: string;
    published_at: string | null;
    updated_at: string;
  }>;

  const packs: OfflinePackManifest[] = [];
  if (packRows.length) {
    const { data: itemRows } = await supabase
      .from("content_pack_items")
      .select("pack_id, content_type, content_slug, sort_order")
      .in(
        "pack_id",
        packRows.map((row) => row.id),
      );
    const byPack = new Map<string, NonNullable<typeof itemRows>>();
    for (const row of itemRows ?? []) {
      const list = byPack.get(row.pack_id) ?? [];
      list.push(row);
      byPack.set(row.pack_id, list);
    }
    for (const pack of packRows) {
      if (pack.visibility === "premium" && !viewer.hasActivePro) continue;
      const members = byPack.get(pack.id) ?? [];
      const checksum = await checksumPayload({
        slug: pack.slug,
        version: pack.version,
        items: members,
      });
      packs.push({
        slug: pack.slug,
        title: pack.title,
        description: pack.description,
        version: pack.version,
        visibility: asEntitlement(pack.visibility),
        status: "published",
        publishedAt: pack.published_at,
        updatedAt: pack.updated_at,
        checksum,
        itemCount: members.length,
        items: members.map((member) => ({
          contentType: member.content_type as OfflineContentType,
          slug: member.content_slug,
          sortOrder: member.sort_order,
          version: pack.updated_at,
          checksum,
          visibility: asEntitlement(pack.visibility),
        })),
      });
    }
  }

  const individual = [
    ...mapIndividuals("protocol", protocols.data),
    ...mapIndividuals("cat", cats.data),
    ...mapIndividuals("drug", drugs.data, "display_name"),
    ...mapIndividuals("calculator", calculators.data),
  ].filter((row) => row.visibility !== "premium" || viewer.hasActivePro);

  return {
    generatedAt: new Date().toISOString(),
    packs,
    individual,
  };
}

function mapIndividuals(
  type: OfflineContentType,
  rows: unknown[] | null,
  titleKey: "title" | "display_name" = "title",
) {
  return (rows ?? []).map((raw) => {
    const row = raw as IdentityRow;
    return {
      contentType: type,
      slug: row.slug,
      title: String(row[titleKey] ?? row.title ?? row.display_name ?? row.slug),
      version: row.updated_at,
      checksum: row.updated_at,
      visibility: asEntitlement(row.visibility),
      updatedAt: row.updated_at,
    };
  });
}

export async function buildPackDownload(
  slug: string,
  viewer: ViewerAccess,
): Promise<{ pack: OfflinePackDownload } | { error: number; reason: string }> {
  const supabase = await db();
  if (!supabase) return { error: 503, reason: "unknown" };

  const { data: packRow } = await supabase
    .from("content_packs")
    .select("id, slug, title, description, version, visibility, status, published_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (!packRow) return { error: 404, reason: "pack_unpublished" };

  const { data: memberRows } = await supabase
    .from("content_pack_items")
    .select("content_type, content_slug, sort_order")
    .eq("pack_id", packRow.id)
    .order("sort_order", { ascending: true });

  const identities: Array<IdentityRow & { contentType: OfflineContentType }> = [];
  for (const member of memberRows ?? []) {
    const identity = await loadIdentity(member.content_type as OfflineContentType, member.content_slug);
    if (!identity) return { error: 404, reason: "pack_item_missing" };
    identities.push({ ...identity, contentType: member.content_type as OfflineContentType });
  }

  const decision = decidePackDownload(
    packRow,
    identities.map((row) => ({
      contentType: row.contentType,
      slug: row.slug,
      status: row.status,
      visibility: row.visibility,
      offlineAvailable: row.offline_available,
    })),
    viewer,
  );
  if (!decision.ok) {
    return { error: decision.reason === "unauthenticated" ? 401 : 404, reason: decision.reason };
  }

  const items: OfflineItemDto[] = [];
  for (const identity of identities) {
    const built = await buildOfflineItem(identity.contentType, identity.slug, viewer);
    if ("error" in built) return built;
    items.push(built.item);
  }

  const checksum = await checksumPayload({
    slug: packRow.slug,
    version: packRow.version,
    items: items.map((item) => item.checksum),
  });
  const pack: OfflinePackManifest = {
    slug: packRow.slug,
    title: packRow.title,
    description: packRow.description,
    version: packRow.version,
    visibility: asEntitlement(packRow.visibility),
    status: "published",
    publishedAt: packRow.published_at,
    updatedAt: packRow.updated_at,
    checksum,
    itemCount: items.length,
    items: items.map((item, index) => ({
      contentType: item.contentType,
      slug: item.slug,
      sortOrder: index,
      version: item.version,
      checksum: item.checksum,
      visibility: item.visibility,
    })),
  };

  return { pack: { pack, items } };
}
