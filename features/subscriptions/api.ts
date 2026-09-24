"use server";

import { createClient } from "@/lib/supabase/server";
import type { SubscriptionPlan } from "@/types/content";

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("getSubscriptionPlans", error.message);
    return [];
  }

  return data ?? [];
}

export async function getCurrentUserPlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_slug, plan_status")
    .eq("id", user.id)
    .maybeSingle();

  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_slug, status, ends_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const slug = subscription?.plan_slug ?? profile?.plan_slug ?? "freemium";
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return {
    slug,
    status: subscription?.status ?? profile?.plan_status ?? "active",
    plan: plan ?? null,
  };
}
