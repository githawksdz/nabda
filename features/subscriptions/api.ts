"use server";

import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLAN_SELECT } from "@/lib/authz/selects";
import { getViewerAccess } from "@/lib/authz/access";
import type { SubscriptionPlan } from "@/types/content";

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select(SUBSCRIPTION_PLAN_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.warn("getSubscriptionPlans", error.message);
    return [];
  }

  return (data ?? []) as SubscriptionPlan[];
}

export async function getCurrentUserPlan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const viewer = await getViewerAccess();
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("plan_slug, status, ends_at")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const live =
    subscription?.status === "active" &&
    (subscription.ends_at == null || Date.parse(subscription.ends_at) > Date.now()) &&
    Boolean(subscription.plan_slug);

  const slug = live && viewer.hasActivePro ? subscription.plan_slug : "freemium";
  const status = live && viewer.hasActivePro ? subscription.status : "active";

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select(SUBSCRIPTION_PLAN_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  return {
    slug,
    status,
    plan: (plan as SubscriptionPlan | null) ?? null,
  };
}
