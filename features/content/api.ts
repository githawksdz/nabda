"use server";

import { headers } from "next/headers";
import { isProductionContentMode } from "@/lib/content-data/content-source-mode";
import {
  fetchIdentityHits,
  identityHitsToSearchResults,
} from "@/lib/search/identity-search";
import {
  fetchSearchDocumentHits,
  searchDocumentHitsToSearchResults,
} from "@/lib/search/search-documents";
import { createAdminClient, canUseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logWarn } from "@/lib/observability/logger";
import {
  checkRateLimit,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";
import type {
  Calculator,
  CatMap,
  Drug,
  Protocol,
} from "@/types/content";
import type { SearchFilter, SearchResult } from "@/types/search";

async function getCatalogClient() {
  if (isProductionContentMode() && canUseAdminClient()) {
    return createAdminClient();
  }
  return await createClient();
}

export async function getProtocols(): Promise<Protocol[]> {
  const supabase = await getCatalogClient();
  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    console.warn("getProtocols", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCatMaps(): Promise<CatMap[]> {
  const supabase = await getCatalogClient();
  const { data, error } = await supabase
    .from("cat_maps")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    console.warn("getCatMaps", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCalculators(): Promise<Calculator[]> {
  const supabase = await getCatalogClient();
  const { data, error } = await supabase
    .from("calculators")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    console.warn("getCalculators", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDrugs(): Promise<Drug[]> {
  const supabase = await getCatalogClient();
  const { data, error } = await supabase
    .from("drugs")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) {
    console.warn("getDrugs", error.message);
    return [];
  }

  return data ?? [];
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
    const docHits = await fetchSearchDocumentHits(supabase, trimmed, filters);
    if (docHits.length > 0) {
      return searchDocumentHitsToSearchResults(docHits);
    }
    const hits = await fetchIdentityHits(supabase, trimmed, filters);
    return identityHitsToSearchResults(hits);
  } catch (error) {
    console.warn("searchContent", error);
    return [];
  }
}
