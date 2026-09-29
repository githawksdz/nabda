import { cache } from "react";
import { canReadContent, getViewerAccess } from "@/lib/authz/access";
import { isDemoContentMode } from "@/lib/content-data/content-source-mode";

import { getContentDetailDemoFixtures } from "@/lib/demo-fixtures/load";
import {
  deriveLinkedContentForProtocol,
  keyPointsFromSections,
  mapProtocolLinks,
  mapProtocolReferences,
  mapProtocolSections,
  protocolDetailFromDbRow,
  type LinkedCatalogs,
} from "@/lib/content-detail/content-detail-mappers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  PROTOCOL_CATALOG_SELECT,
  PROTOCOL_LINK_SELECT,
  PROTOCOL_REFERENCE_SELECT,
  PROTOCOL_SECTION_SELECT,
} from "@/lib/authz/selects";
import type {
  ProtocolLinkRow,
  ProtocolReferenceRow,
  ProtocolSectionRow,
  Protocol as DbProtocol,
} from "@/types/content";
import type { ProtocolDetail } from "@/types/content-detail";

const EMPTY_CATALOGS: LinkedCatalogs = {
  protocols: [],
  cats: [],
  calculators: [],
  drugs: [],
};

function asRow<T>(value: unknown): T {
  return value as T;
}

async function getSupabaseOrNull() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    return await createClient();
  } catch (error) {
    console.warn("content-detail supabase client", error);
    return null;
  }
}

async function loadLinkedCatalogs(): Promise<LinkedCatalogs> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return EMPTY_CATALOGS;
  }

  try {
    const [protocols, calculators, drugs] = await Promise.all([
      supabase.from("protocols").select("slug, title, short_title"),
      supabase.from("calculators").select("slug, title, short_title, description"),
      supabase.from("drugs").select("slug, display_name, summary"),
    ]);

    if (protocols.error) {
      console.warn("loadLinkedCatalogs protocols", protocols.error.message);
    }
    if (calculators.error) {
      console.warn("loadLinkedCatalogs calculators", calculators.error.message);
    }
    if (drugs.error) {
      console.warn("loadLinkedCatalogs drugs", drugs.error.message);
    }

    return {
      protocols: protocols.data ?? [],
      cats: [],
      calculators: calculators.data ?? [],
      drugs: drugs.data ?? [],
    };
  } catch (error) {
    console.warn("loadLinkedCatalogs", error);
    return EMPTY_CATALOGS;
  }
}

export async function fetchProtocolBySlug(
  slug: string,
): Promise<DbProtocol | null> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("protocols")
      .select(PROTOCOL_CATALOG_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn("fetchProtocolBySlug", error.message);
      return null;
    }

    return asRow<DbProtocol | null>(data);
  } catch (error) {
    console.warn("fetchProtocolBySlug", error);
    return null;
  }
}

export async function fetchProtocolSections(
  protocolId: string,
): Promise<ProtocolSectionRow[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("protocol_sections")
      .select(PROTOCOL_SECTION_SELECT)
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolSections", error.message);
      return [];
    }

    return asRow<ProtocolSectionRow[]>(data ?? []);
  } catch (error) {
    console.warn("fetchProtocolSections", error);
    return [];
  }
}

export async function fetchProtocolReferences(
  protocolId: string,
): Promise<ProtocolReferenceRow[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("protocol_references")
      .select(PROTOCOL_REFERENCE_SELECT)
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolReferences", error.message);
      return [];
    }

    return asRow<ProtocolReferenceRow[]>(data ?? []);
  } catch (error) {
    console.warn("fetchProtocolReferences", error);
    return [];
  }
}

export async function fetchProtocolLinks(
  protocolId: string,
): Promise<ProtocolLinkRow[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("protocol_links")
      .select(PROTOCOL_LINK_SELECT)
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolLinks", error.message);
      return [];
    }

    return asRow<ProtocolLinkRow[]>(data ?? []);
  } catch (error) {
    console.warn("fetchProtocolLinks", error);
    return [];
  }
}

export const getProtocolDetailBySlug = cache(
  async (slug: string): Promise<ProtocolDetail | undefined> => {
    const mock = getContentDetailDemoFixtures()?.getProtocolDetail(slug);

    try {
      const [row, catalogs, viewer] = await Promise.all([
        fetchProtocolBySlug(slug),
        loadLinkedCatalogs(),
        getViewerAccess(),
      ]);

      if (!row || !canReadContent(row, viewer)) {
        return isDemoContentMode() ? mock : undefined;
      }

      const [sectionRows, referenceRows, linkRows] = await Promise.all([
        fetchProtocolSections(row.id),
        fetchProtocolReferences(row.id),
        fetchProtocolLinks(row.id),
      ]);

      const dbLinks = mapProtocolLinks(linkRows);
      const linked = deriveLinkedContentForProtocol({
        protocolId: row.id,
        protocolSlug: row.slug,
        fallback: mock?.linked_content,
        catalogs,
        dbLinks,
      });

      return protocolDetailFromDbRow(row, mock, linked, false, {
        sections: mapProtocolSections(sectionRows),
        key_points: keyPointsFromSections(sectionRows),
        references: mapProtocolReferences(referenceRows),
      });
    } catch (error) {
      console.warn("getProtocolDetailBySlug", error);
      return mock;
    }
  },
);

export async function getLinkedContentForProtocol(protocolId: string) {
  const rows = await fetchProtocolLinks(protocolId);
  return mapProtocolLinks(rows);
}
