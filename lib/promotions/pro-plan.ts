export function isProPlanSlug(planSlug: string | null | undefined): boolean {
  if (!planSlug) {
    return false;
  }
  return planSlug.startsWith("pro") && planSlug !== "freemium";
}
