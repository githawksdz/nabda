"use server";

import { headers } from "next/headers";
import {
  fetchIdentityHits,
  identityHitsToSearchResults,
} from "@/lib/search/identity-search";
import {
  fetchSearchDocumentHits,
  searchDocumentHitsToSearchResults,
} from "@/lib/search/search-documents";
import { createRlsClient } from "@/lib/supabase/rls-client";
import { logWarn } from "@/lib/observability/logger";
import {
  checkRateLimit,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";
import {
  CALCULATOR_CATALOG_SELECT,
  CAT_CATALOG_SELECT,
  DRUG_CATALOG_SELECT,
  PROTOCOL_CATALOG_SELECT,
} from "@/lib/authz/selects";
import { filterReadableContent, getViewerAccess } from "@/lib/authz/access";
import type {
  Calculator,
  CatMap,
  Drug,
  Protocol,
} from "@/types/content";
import type { SearchFilter, SearchResult } from "@/types/search";

async function getCatalogClient() {
  const client = await createRlsClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }
  return client;
}

export async function getProtocols(): Promise<Protocol[]> {
  try {
    const [supabase, viewer] = await Promise.all([getCatalogClient(), getViewerAccess()]);
    const { data, error } = await supabase
      .from("protocols")
      .select(PROTOCOL_CATALOG_SELECT)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("title", { ascending: true });

    if (error) {
      console.warn("getProtocols", error.message);
      return [];
    }

    return filterReadableContent((data ?? []) as Protocol[], viewer);
  } catch (error) {
    console.warn("getProtocols", error);
    return [];
  }
}

export async function getCatMaps(): Promise<CatMap[]> {
  try {
    const [supabase, viewer] = await Promise.all([getCatalogClient(), getViewerAccess()]);
    const { data, error } = await supabase
      .from("cat_maps")
      .select(CAT_CATALOG_SELECT)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("title", { ascending: true });

    if (error) {
      console.warn("getCatMaps", error.message);
      return [];
    }

    return filterReadableContent((data ?? []) as CatMap[], viewer);
  } catch (error) {
    console.warn("getCatMaps", error);
    return [];
  }
}

export async function getCalculators(): Promise<Calculator[]> {
  try {
    const [supabase, viewer] = await Promise.all([getCatalogClient(), getViewerAccess()]);
    const { data, error } = await supabase
      .from("calculators")
      .select(CALCULATOR_CATALOG_SELECT)
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("title", { ascending: true });

    if (error) {
      console.warn("getCalculators", error.message);
      return [];
    }

    return filterReadableContent((data ?? []) as Calculator[], viewer);
  } catch (error) {
    console.warn("getCalculators", error);
    return [];
  }
}

export async function getDrugs(): Promise<Drug[]> {
  try {
    const [supabase, viewer] = await Promise.all([getCatalogClient(), getViewerAccess()]);
    const { data, error } = await supabase
      .from("drugs")
      .select(DRUG_CATALOG_SELECT)
      .eq("status", "published")
      .order("display_name", { ascending: true });

    if (error) {
      console.warn("getDrugs", error.message);
      return [];
    }

    return filterReadableContent((data ?? []) as Drug[], viewer);
  } catch (error) {
    console.warn("getDrugs", error);
    return [];
  }
}

/**
 * Stage B search against search_documents; falls back to Stage A identity
 * search if the index is empty or unavailable.
 */
export async function searchContent(
  query: string,
  filters?: { type?: SearchFilter; limit?: number },
): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const h = await headers();
    const ip = clientIpFromHeaders(h);
    const limit = checkRateLimit({
      key: `search:${ip}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      logWarn({
        event: "search_rate_limited",
        route: "searchContent",
        status: 429,
      });
      return [];
    }

    const supabase = await getCatalogClient();
    const viewer = await getViewerAccess();
    const docHits = await fetchSearchDocumentHits(supabase, trimmed, filters, viewer);
    if (docHits.length > 0) {
      return searchDocumentHitsToSearchResults(docHits);
    }
    const hits = await fetchIdentityHits(supabase, trimmed, { ...filters, viewer });
    return identityHitsToSearchResults(hits);
  } catch (error) {
    console.warn("searchContent", error);
    return [];
  }
}
