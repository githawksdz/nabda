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

function feedTargetParentType(
  targetType: string | null,
): ParentContentType | null {
  if (targetType === "protocol") return "protocol";
  if (targetType === "cat") return "cat";
  if (targetType === "drug") return "drug";
  if (targetType === "calculator") return "calculator";
  return null;
}
