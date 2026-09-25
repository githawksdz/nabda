/**
 * Publication and entitlement gate. Fail closed.
 * Nabda is a publishing hub: public access is published + free/premium,
 * not a medical-review workflow.
 */

export type StaffRole = "none" | "reviewer" | "editor" | "admin";

export const STAFF_ROLE_RANK: Record<StaffRole, number> = {
  none: 0,
  reviewer: 1,
  editor: 2,
  admin: 3,
};

export type ViewerAccess = {
  userId: string | null;
  authenticated: boolean;
  hasActivePro: boolean;
  staffRole: StaffRole;
};

export type ContentIdentity = {
  slug?: string | null;
  visibility?: string | null;
  status?: string | null;
  reviewStatus?: string | null;
};

export const ANONYMOUS_VIEWER: ViewerAccess = {
  userId: null,
  authenticated: false,
  hasActivePro: false,
  staffRole: "none",
};

export const PRO_PLAN_SLUG = "pro_yearly";

const PUBLIC_VISIBILITY = new Set(["public_free"]);
const PREMIUM_VISIBILITY = new Set(["premium"]);
const BLOCKED_PARENT_VISIBILITY = new Set(["hidden", "admin_only", "preview_only"]);
const BLOCKED_CHILD_VISIBILITY = new Set([
  "hidden",
  "admin_only",
  "preview_only",
  "hidden_until_adapted",
]);

export function isProPlanSlug(slug?: string | null): boolean {
  return slug === PRO_PLAN_SLUG;
}

export function parseStaffRole(value: string | null | undefined): StaffRole {
  if (value === "reviewer" || value === "editor" || value === "admin") {
    return value;
  }
  return "none";
}

export function hasStaffRole(
  role: StaffRole,
  minimum: StaffRole = "reviewer",
): boolean {
  return STAFF_ROLE_RANK[role] >= STAFF_ROLE_RANK[minimum];
}

export function isPublishedStatus(status?: string | null): boolean {
  return status === "published";
}

/**
 * Legacy badge helper. Public authorization must not call this.
 */
export function isValidatedReview(reviewStatus?: string | null): boolean {
  return reviewStatus === "validated";
}

export function isApprovedChildRecord(input: {
  visibility?: string | null;
  reviewStatus?: string | null;
}): boolean {
  void input.reviewStatus;
  const visibility = input.visibility ?? "public_free";
  return !BLOCKED_CHILD_VISIBILITY.has(visibility);
}

/**
 * Public/Pro read of a parent entity.
 * Staff bypass is not applied here: drafts stay on dashboard/internal routes.
 * review_status is ignored.
 */
export function canReadContent(
  identity: ContentIdentity | null | undefined,
  viewer: ViewerAccess,
): boolean {
  if (!identity) {
    return false;
  }

  if (!isPublishedStatus(identity.status)) {
    return false;
  }

  const visibility = identity.visibility ?? "";
  if (BLOCKED_PARENT_VISIBILITY.has(visibility)) {
    return false;
  }
  if (PUBLIC_VISIBILITY.has(visibility)) {
    return true;
  }
  if (PREMIUM_VISIBILITY.has(visibility)) {
    return viewer.authenticated && viewer.hasActivePro;
  }
  return false;
}

export function canReadStaffContent(
  identity: ContentIdentity | null | undefined,
  viewer: ViewerAccess,
): boolean {
  if (!identity) {
    return false;
  }
  if (hasStaffRole(viewer.staffRole, "reviewer")) {
    return true;
  }
  return canReadContent(identity, viewer);
}

export function assertPublicClinicalContent(
  identity: ContentIdentity | null | undefined,
  viewer: ViewerAccess,
): boolean {
  return canReadContent(identity, viewer);
}

export function filterReadableContent<
  T extends { slug?: string | null; status?: string | null; visibility?: string | null },
>(rows: T[], viewer: ViewerAccess): T[] {
  return rows.filter((row) =>
    canReadContent(
      {
        slug: row.slug,
        status: row.status,
        visibility: row.visibility,
      },
      viewer,
    ),
  );
}

export function filterApprovedChildren<T extends { visibility?: string | null; review_status?: string | null }>(
  rows: T[],
): T[] {
  return rows.filter((row) =>
    isApprovedChildRecord({
      visibility: row.visibility,
      reviewStatus: row.review_status,
    }),
  );
}

export function identityOnlyFields<T extends Record<string, unknown>>(row: T): {
  slug: unknown;
  title: unknown;
  status: unknown;
  review_status: unknown;
  visibility: unknown;
} {
  return {
    slug: row.slug,
    title: row.title ?? row.display_name,
    status: row.status,
    review_status: row.review_status,
    visibility: row.visibility,
  };
}
