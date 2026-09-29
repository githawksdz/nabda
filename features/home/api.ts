"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import {
  CALCULATOR_CATALOG_SELECT,
  HOME_FEED_SELECT,
  PROTOCOL_CATALOG_SELECT,
} from "@/lib/authz/selects";
import {
  filterReadableContent,
  getViewerAccess,
  viewerCanReadSlug,
  type ParentContentType,
} from "@/lib/authz/access";
import type { ClinicalFeedItem } from "@/lib/home/clinical-feed";
import { toClinicalFeedItems } from "@/lib/home/map-clinical-feed";
import type { Calculator, HomeFeedItem, Protocol } from "@/types/content";
import type { Profile } from "@/types/database";

export async function getCurrentPlan(userId?: string) {
  void userId;
  return getCurrentUserPlan();
}

export async function getFeaturedProtocols(): Promise<Protocol[]> {
  const [supabase, viewer] = await Promise.all([createClient(), getViewerAccess()]);
  const { data, error } = await supabase
    .from("protocols")
    .select(PROTOCOL_CATALOG_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("title", { ascending: true });

  if (error) {
    console.warn("getFeaturedProtocols", error.message);
    return [];
  }

  return filterReadableContent((data ?? []) as Protocol[], viewer);
}

export async function getFeaturedCalculators(): Promise<Calculator[]> {
  const [supabase, viewer] = await Promise.all([createClient(), getViewerAccess()]);
  const { data, error } = await supabase
    .from("calculators")
    .select(CALCULATOR_CATALOG_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("title", { ascending: true });

  if (error) {
    console.warn("getFeaturedCalculators", error.message);
    return [];
  }

  return filterReadableContent((data ?? []) as Calculator[], viewer);
}

export async function getHomeFeedItems(profile: Profile | null): Promise<HomeFeedItem[]> {
  const supabase = await createClient();
  const viewer = await getViewerAccess();

  const query = supabase
    .from("home_feed_items")
    .select(HOME_FEED_SELECT)
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.warn("getHomeFeedItems", error.message);
    return [];
  }

  const audienceFiltered = ((data ?? []) as HomeFeedItem[]).filter((item) => {
    if (item.visibility === "premium" && !(viewer.authenticated && viewer.hasActivePro)) {
      return false;
    }
    if (!viewer.hasActivePro && item.plan_required === "pro") {
      return false;
    }
    if (
      profile?.profession &&
      item.audience_professions.length > 0 &&
      !item.audience_professions.includes(profile.profession)
    ) {
      return false;
    }
    return true;
  });

  const clinical: Array<{ type: ParentContentType; slug: string }> = [];
  for (const item of audienceFiltered) {
    const parent = feedTargetParentType(item.target_type);
    if (parent && item.target_slug) {
      clinical.push({ type: parent, slug: item.target_slug });
    }
  }

  const readableClinical = new Set<string>();
  await Promise.all(
    clinical.map(async ({ type, slug }) => {
      if (await viewerCanReadSlug(type, slug)) {
        readableClinical.add(`${type}:${slug}`);
      }
    }),
  );

  return audienceFiltered.filter((item) => {
    const parent = feedTargetParentType(item.target_type);
    if (!parent || !item.target_slug) {
      return true;
    }
    return readableClinical.has(`${parent}:${item.target_slug}`);
  });
}

const HOME_PROTOCOL_PICK =
  "id, slug, title, short_title, category_slug, is_featured, published_at, status, review_status, visibility";

type HomeProtocolPick = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  category_slug: string | null;
  is_featured: boolean;
  published_at: string | null;
  status: string;
  review_status: string;
  visibility: string;
};

export async function getHomeClinicalCatalog(
  profile: Profile | null,
): Promise<ClinicalFeedItem[]> {
  try {
    const [supabase, viewer, feed] = await Promise.all([
      createClient(),
      getViewerAccess(),
      getHomeFeedItems(profile),
    ]);

    const [recentProtocols, featuredProtocols] = await Promise.all([
      supabase
        .from("protocols")
        .select(HOME_PROTOCOL_PICK)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(30),
      supabase
        .from("protocols")
        .select(HOME_PROTOCOL_PICK)
        .eq("status", "published")
        .eq("is_featured", true)
        .limit(20),
    ]);

    for (const result of [recentProtocols, featuredProtocols]) {
      if (result.error) {
        console.warn("getHomeClinicalCatalog", result.error.message);
        return [];
      }
    }

    const protocols = filterReadableContent(
      dedupeById([
        ...((recentProtocols.data ?? []) as HomeProtocolPick[]),
        ...((featuredProtocols.data ?? []) as HomeProtocolPick[]),
      ]),
      viewer,
    );

    return toClinicalFeedItems(
      protocols.map((protocol) => ({
        id: protocol.id,
        kind: "protocol" as const,
        title: protocol.short_title || protocol.title,
        slug: protocol.slug,
        categorySlug: protocol.category_slug,
        publishedAt: protocol.published_at,
        featured: protocol.is_featured,
        priority: feedPriority(feed, protocol.slug),
      })),
    );
  } catch (error) {
    console.warn("getHomeClinicalCatalog", error);
    return [];
  }
}

function feedPriority(feed: HomeFeedItem[], slug: string): number {
  let priority = 0;
  for (const item of feed) {
    if (item.target_type === "protocol" && item.target_slug === slug) {
      priority = Math.max(priority, item.priority ?? 0);
    }
  }
  return priority;
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const unique: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) {
      continue;
    }
    seen.add(row.id);
    unique.push(row);
  }
  return unique;
}

function feedTargetParentType(
  targetType: string | null,
): ParentContentType | null {
  if (targetType === "protocol") return "protocol";
  if (targetType === "drug") return "drug";
  if (targetType === "calculator") return "calculator";
  return null;
}
