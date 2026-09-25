"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import {
  CALCULATOR_CATALOG_SELECT,
  HOME_FEED_SELECT,
  PROTOCOL_CATALOG_SELECT,
} from "@/lib/authz/selects";
import { filterReadableContent, getViewerAccess } from "@/lib/authz/access";
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

  return ((data ?? []) as HomeFeedItem[]).filter((item) => {
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
}
