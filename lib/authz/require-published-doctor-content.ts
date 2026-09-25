/**
 * Public doctor-facing detail routes: fail closed with redirect to /home.
 * Uses existing viewer + content-gate policy (no parallel auth model).
 */

import { redirect } from "next/navigation";
import { normalizeSlug } from "@/lib/nabda-db/slugs";
import {
  viewerCanReadSlug,
  type ParentContentType,
} from "@/lib/authz/access";

export function normalizeDoctorContentSlug(raw: string): string | null {
  if (!raw || typeof raw !== "string") {
    return null;
  }
  const normalized = normalizeSlug(raw);
  if (!normalized || normalized.length > 120) {
    return null;
  }
  return normalized;
}

/**
 * Redirects to `/home` when the slug is invalid or not readable for the current viewer.
 * Returns the normalized slug when access is allowed.
 */
export async function requirePublishedDoctorContent(
  type: ParentContentType,
  rawSlug: string,
): Promise<string> {
  const slug = normalizeDoctorContentSlug(rawSlug);
  if (!slug) {
    redirect("/home");
  }

  const allowed = await viewerCanReadSlug(type, slug);
  if (!allowed) {
    redirect("/home");
  }

  return slug;
}
