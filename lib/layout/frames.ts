/** Shared doctor-shell frame classes. Width tokens live in app/globals.css. */

export type ShellFrame = "workspace" | "clinical";

export const LAYOUT_GUTTER = "layout-gutter";

export const LAYOUT_FRAME: Record<ShellFrame, string> = {
  workspace: "layout-workspace",
  clinical: "layout-clinical",
};

export const LAYOUT_READING = "layout-reading";

export const LAYOUT_HEADER_OFFSET =
  "pt-[calc(var(--layout-header-height)+env(safe-area-inset-top,0px))]";

/** Bottom nav owns this reserve. Applied by the persistent shell on non-detail routes. */
export const LAYOUT_NAV_RESERVE =
  "pb-[calc(var(--layout-nav-clearance)+env(safe-area-inset-bottom,0px))] lg:pb-8";

/**
 * Reading dock + bottom nav. Applied by ClinicalDetailFrame, not AppShell.
 * Safe-area is counted once. Desktop omits nav height because BottomNav is hidden.
 */
export const LAYOUT_DOCK_ABOVE_NAV_RESERVE =
  "pb-[calc(var(--layout-detail-clearance)+env(safe-area-inset-bottom,0px))] lg:pb-[calc(var(--layout-dock-clearance)+env(safe-area-inset-bottom,0px))]";

export const LAYOUT_STICKY_UNDER_HEADER =
  "top-[calc(var(--layout-header-height)+env(safe-area-inset-top,0px))]";
