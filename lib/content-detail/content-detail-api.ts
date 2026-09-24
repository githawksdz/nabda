import { cache } from "react";
// Mock remains the clinical fallback. DB sections/graphs overlay only when validated.

import {
  attachMockFlowchart,
  catDetailFromDbRow,
  catLookupSlugs,
  deriveLinkedContentForCat,
  normalizeCatRouteSlug,
} from "@/lib/cat-detail/cat-detail-mappers";
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
import type {
  CatBlockRow,
  CatEdgeRow,
  CatMap as DbCatMap,
  ProtocolLinkRow,
  ProtocolReferenceRow,
  ProtocolSectionRow,
  Protocol as DbProtocol,
} from "@/types/content";
import type { CatDetail, ProtocolDetail } from "@/types/content-detail";

const EMPTY_CATALOGS: LinkedCatalogs = {
  protocols: [],
  cats: [],
  calculators: [],
  drugs: [],
};

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
    const [protocols, cats, calculators, drugs] = await Promise.all([
      supabase.from("protocols").select("slug, title, short_title"),
      supabase.from("cat_maps").select("slug, title, protocol_id"),
      supabase.from("calculators").select("slug, title, short_title, description"),
      supabase.from("drugs").select("slug, display_name, summary"),
    ]);

    if (protocols.error) {
      console.warn("loadLinkedCatalogs protocols", protocols.error.message);
    }
    if (cats.error) {
      console.warn("loadLinkedCatalogs cats", cats.error.message);
    }
    if (calculators.error) {
      console.warn("loadLinkedCatalogs calculators", calculators.error.message);
    }
    if (drugs.error) {
      console.warn("loadLinkedCatalogs drugs", drugs.error.message);
    }

    return {
      protocols: protocols.data ?? [],
      cats: cats.data ?? [],
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
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn("fetchProtocolBySlug", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("fetchProtocolBySlug", error);
    return null;
  }
}

export async function fetchCatMapForRouteSlug(
  routeSlug: string,
): Promise<DbCatMap | null> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return null;
  }

  const slugs = catLookupSlugs(routeSlug);

  try {
    const { data, error } = await supabase
      .from("cat_maps")
      .select("*")
      .in("slug", slugs);

    if (error) {
      console.warn("fetchCatMapForRouteSlug", error.message);
    } else if (data && data.length > 0) {
      const exact = data.find((row) => row.slug === routeSlug);
      const dashed = data.find(
        (row) => row.slug === `${normalizeCatRouteSlug(routeSlug)}-cat`,
      );
      return exact ?? dashed ?? data[0];
    }

    const protocol = await fetchProtocolBySlug(normalizeCatRouteSlug(routeSlug));
    if (!protocol) {
      return null;
    }

    const linked = await supabase
      .from("cat_maps")
      .select("*")
      .eq("protocol_id", protocol.id)
      .maybeSingle();

    if (linked.error) {
      console.warn("fetchCatMapForRouteSlug protocol join", linked.error.message);
      return null;
    }

    return linked.data;
  } catch (error) {
    console.warn("fetchCatMapForRouteSlug", error);
    return null;
  }
}

async function fetchProtocolById(id: string): Promise<DbProtocol | null> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("protocols")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn("fetchProtocolById", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("fetchProtocolById", error);
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
      .select("*")
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolSections", error.message);
      return [];
    }

    return data ?? [];
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
      .select("*")
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolReferences", error.message);
      return [];
    }

    return data ?? [];
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
      .select("*")
      .eq("protocol_id", protocolId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchProtocolLinks", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn("fetchProtocolLinks", error);
    return [];
  }
}

export async function fetchCatBlocks(catMapId: string): Promise<CatBlockRow[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("cat_blocks")
      .select("*")
      .eq("cat_map_id", catMapId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchCatBlocks", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn("fetchCatBlocks", error);
    return [];
  }
}

export async function fetchCatEdges(catMapId: string): Promise<CatEdgeRow[]> {
  const supabase = await getSupabaseOrNull();
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("cat_edges")
      .select("*")
      .eq("cat_map_id", catMapId)
      .order("order_index", { ascending: true });

    if (error) {
      console.warn("fetchCatEdges", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.warn("fetchCatEdges", error);
    return [];
  }
}

export const getProtocolDetailBySlug = cache(
  async (slug: string): Promise<ProtocolDetail | undefined> => {
    const mock = getContentDetailDemoFixtures()?.getProtocolDetail(slug);

    try {
      const [row, catalogs] = await Promise.all([
        fetchProtocolBySlug(slug),
        loadLinkedCatalogs(),
      ]);

      if (!row) {
        return mock;
      }

      const [sectionRows, referenceRows, linkRows] = await Promise.all([
        fetchProtocolSections(row.id),
        fetchProtocolReferences(row.id),
        fetchProtocolLinks(row.id),
      ]);

      const linkedCat = catalogs.cats.find(
        (item) =>
          item.protocol_id === row.id ||
          item.slug === slug ||
          item.slug === `${slug}-cat`,
      );
      const catRouteSlug = linkedCat
        ? normalizeCatRouteSlug(linkedCat.slug)
        : null;

      const dbLinks = mapProtocolLinks(linkRows);
      const linked = deriveLinkedContentForProtocol({
        protocolId: row.id,
        protocolSlug: row.slug,
        fallback: mock?.linked_content,
        catalogs,
        catRouteSlug,
        catTitle: linkedCat?.title,
        dbLinks,
      });

      return protocolDetailFromDbRow(row, mock, linked, Boolean(linkedCat), {
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

export const getCatDetailBySlug = cache(
  async (slug: string): Promise<CatDetail | undefined> => {
    const canonicalSlug = normalizeCatRouteSlug(slug);
    const fixtures = getContentDetailDemoFixtures();
    const mock =
      fixtures?.getCatDetail(canonicalSlug) ?? fixtures?.getCatDetail(slug);

    try {
      const [row, catalogs] = await Promise.all([
        fetchCatMapForRouteSlug(slug),
        loadLinkedCatalogs(),
      ]);

      if (!row) {
        return mock ? attachMockFlowchart(mock) : undefined;
      }

      const [protocol, blocks, edges] = await Promise.all([
        row.protocol_id
          ? fetchProtocolById(row.protocol_id)
          : fetchProtocolBySlug(canonicalSlug),
        fetchCatBlocks(row.id),
        fetchCatEdges(row.id),
      ]);

      const routeSlug = protocol?.slug ?? canonicalSlug;
      const linked = deriveLinkedContentForCat({
        catId: row.id,
        fallbackTools: mock?.linked_tools,
        fallbackProtocols: mock?.linked_protocols,
        catalogs,
        protocol,
      });

      return catDetailFromDbRow(row, protocol, mock, routeSlug, linked, {
        blocks,
        edges,
      });
    } catch (error) {
      console.warn("getCatDetailBySlug", error);
      return mock ? attachMockFlowchart(mock) : undefined;
    }
  },
);

export async function getLinkedContentForProtocol(protocolId: string) {
  const rows = await fetchProtocolLinks(protocolId);
  return mapProtocolLinks(rows);
}

export async function getLinkedContentForCat(catId: string) {
  void catId;
  // CAT-specific link table is not in this minimal schema.
  // Linked tools still come from protocol_links / mock overlay in getCatDetailBySlug.
  return [];
}
