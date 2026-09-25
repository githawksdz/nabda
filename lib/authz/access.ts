/**
 * Server-only authorization helpers. Fail closed.
 * Entitlement is read from user_subscriptions, never from the browser or profiles.plan_slug.
 */

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createRlsClient } from "@/lib/supabase/rls-client";
import {
  ANONYMOUS_VIEWER,
  canReadContent,
  hasStaffRole,
  isProPlanSlug,
  parseStaffRole,
  type ContentIdentity,
  type StaffRole,
  type ViewerAccess,
} from "@/lib/authz/content-gate";
import { CAT_CATALOG_SELECT, DRUG_CATALOG_SELECT } from "@/lib/authz/selects";

export {
  canReadContent,
  canReadStaffContent,
  assertPublicClinicalContent,
  filterReadableContent,
  hasStaffRole,
  isProPlanSlug,
  parseStaffRole,
  ANONYMOUS_VIEWER,
  PRO_PLAN_SLUG,
} from "@/lib/authz/content-gate";
export type { ContentIdentity, StaffRole, ViewerAccess } from "@/lib/authz/content-gate";

function isActiveUnexpired(status: string | null | undefined, endsAt: string | null | undefined): boolean {
  if (status !== "active") {
    return false;
  }
  if (!endsAt) {
    return true;
  }
  const end = Date.parse(endsAt);
  if (Number.isNaN(end)) {
    return false;
  }
  return end > Date.now();
}

export async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
}

export const getViewerAccess = cache(async (): Promise<ViewerAccess> => {
  const session = await requireAuthenticatedUser();
  if (!session) {
    return ANONYMOUS_VIEWER;
  }

  const { user, supabase } = session;

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("staff_role").eq("id", user.id).maybeSingle(),
    supabase
      .from("user_subscriptions")
      .select("plan_slug, status, ends_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const staffRole = parseStaffRole(
    profile && "staff_role" in profile ? String(profile.staff_role ?? "none") : "none",
  );

  const hasActivePro =
    isProPlanSlug(subscription?.plan_slug) &&
    isActiveUnexpired(subscription?.status, subscription?.ends_at);

  return {
    userId: user.id,
    authenticated: true,
    hasActivePro,
    staffRole,
  };
});

export async function requireUserEntitlement(): Promise<ViewerAccess | null> {
  const viewer = await getViewerAccess();
  if (!viewer.authenticated || !viewer.hasActivePro) {
    return null;
  }
  return viewer;
}

export async function requireRole(minimum: StaffRole = "reviewer"): Promise<ViewerAccess | null> {
  const viewer = await getViewerAccess();
  if (!hasStaffRole(viewer.staffRole, minimum)) {
    return null;
  }
  return viewer;
}

export type ParentContentType = "protocol" | "cat" | "drug" | "calculator";

export async function loadContentIdentity(
  type: ParentContentType,
  slug: string,
): Promise<ContentIdentity | null> {
  const supabase = await createRlsClient();
  if (!supabase || !slug) {
    return null;
  }

  const table =
    type === "protocol"
      ? "protocols"
      : type === "cat"
        ? "cat_maps"
        : type === "drug"
          ? "drugs"
          : "calculators";
  const columns =
    type === "cat"
      ? CAT_CATALOG_SELECT
      : type === "drug"
        ? DRUG_CATALOG_SELECT
        : "slug, status, review_status, visibility";

  const { data, error } = await supabase
    .from(table)
    .select(columns)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as {
    slug?: string;
    status?: string;
    review_status?: string;
    visibility?: string;
  };

  return {
    slug: row.slug ?? slug,
    status: row.status,
    reviewStatus: row.review_status,
    visibility: row.visibility,
  };
}

export async function viewerCanReadSlug(
  type: ParentContentType,
  slug: string,
): Promise<boolean> {
  const [viewer, identity] = await Promise.all([getViewerAccess(), loadContentIdentity(type, slug)]);
  return canReadContent(identity, viewer);
}
