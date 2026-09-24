"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUserPlan } from "@/features/subscriptions/api";
import type { Calculator, HomeFeedItem, Protocol } from "@/types/content";
import type { Profile } from "@/types/database";

export async function getCurrentPlan(userId?: string) {
  void userId;
  return getCurrentUserPlan();
}

export async function getFeaturedProtocols(): Promise<Protocol[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("protocols")
    .select("*")
    .eq("is_featured", true)
    .order("title", { ascending: true });

  if (error) {
    console.warn("getFeaturedProtocols", error.message);
    return [];
  }

  return data ?? [];
}

export async function getFeaturedCalculators(): Promise<Calculator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calculators")
    .select("*")
    .eq("is_featured", true)
    .order("title", { ascending: true });

  if (error) {
    console.warn("getFeaturedCalculators", error.message);
    return [];
  }

  return data ?? [];
}

export async function getHomeFeedItems(profile: Profile | null): Promise<HomeFeedItem[]> {
  const supabase = await createClient();
  const plan = await getCurrentUserPlan();
  const isPro = (plan?.slug ?? profile?.plan_slug ?? "freemium").startsWith("pro");

  const query = supabase
    .from("home_feed_items")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.warn("getHomeFeedItems", error.message);
    return [];
  }

  return (data ?? []).filter((item) => {
    if (!isPro && item.plan_required === "pro") {
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
