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

/** Bottom nav owns this reserve. Applied only when the nav is shown. */
export const LAYOUT_NAV_RESERVE =
  "pb-[calc(var(--layout-nav-clearance)+env(safe-area-inset-bottom,0px))] lg:pb-8";

/**
 * Reading dock owns this reserve. Applied by ClinicalDetailFrame, not AppShell.
 * Covers the 72px bar, optional meta line, and a small gap.
 */
export const LAYOUT_DOCK_RESERVE =
  "pb-[calc(var(--layout-dock-clearance)+env(safe-area-inset-bottom,0px))]";

export const LAYOUT_STICKY_UNDER_HEADER =
  "top-[calc(var(--layout-header-height)+env(safe-area-inset-top,0px))]";
