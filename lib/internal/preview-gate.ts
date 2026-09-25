/**
 * Staff roles are dashboard/internal access roles, not medical-review states.
 */

import { requireRole } from "@/lib/authz/access";

export async function canAccessInternalPreview(
  _previewParam?: string | null,
): Promise<boolean> {
  void _previewParam;
  const viewer = await requireRole("reviewer");
  return Boolean(viewer);
}
