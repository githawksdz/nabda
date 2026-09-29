/**
 * Static checks for Recovery Phase R1: persistent doctor application shell.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCTOR_APP = "app/(doctor)";

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel: string) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walkTs(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walkTs(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(path.relative(ROOT, full).replaceAll("\\", "/"));
    }
  }
  return out;
}

const layout = read(`${DOCTOR_APP}/layout.tsx`);
const loading = read(`${DOCTOR_APP}/loading.tsx`);
const errorBoundary = read(`${DOCTOR_APP}/error.tsx`);
const shell = read("components/app/AppShell.tsx");
const header = read("components/app/AppHeader.tsx");
const sidebar = read("components/app/DesktopSidebar.tsx");
const bottomNav = read("components/app/BottomNav.tsx");
const sheet = read("components/app/ModuleSheet.tsx");
const frame = read("components/content-detail/ClinicalDetailFrame.tsx");
const dock = read("components/content-detail/BottomReadingDock.tsx");
const frames = read("lib/layout/frames.ts");
const routeState = read("lib/navigation/doctor-route-state.ts");
const css = read("app/globals.css");
const pkg = read("package.json");

check(
  "doctor_layout_owns_appshell",
  layout.includes('from "@/components/app/AppShell"') &&
    layout.includes("<AppShell") &&
    layout.includes("{children}"),
  `${DOCTOR_APP}/layout.tsx`,
);

const doctorFiles = walkTs(path.join(ROOT, DOCTOR_APP));
const doctorPageShellImports = doctorFiles.filter((file) => {
  if (file.endsWith("layout.tsx")) return false;
  return read(file).includes("@/components/app/AppShell");
});
check(
  "doctor_pages_do_not_instantiate_shell",
  doctorPageShellImports.length === 0,
  doctorPageShellImports.join(", ") || "none",
);

const componentShellOwners = walkTs(path.join(ROOT, "components")).filter(
  (file) => {
    if (file === "components/app/AppShell.tsx") return false;
    return read(file).includes("@/components/app/AppShell");
  },
);
check(
  "components_do_not_own_shell",
  componentShellOwners.length === 0,
  componentShellOwners.join(", ") || "none",
);

check(
  "header_is_shell_owned",
  shell.includes("<AppHeader") && header.includes("data-app-header"),
  "AppHeader",
);
check(
  "sidebar_is_shell_owned",
  shell.includes("<DesktopSidebar") && sidebar.includes("data-desktop-sidebar"),
  "DesktopSidebar",
);
check(
  "bottom_nav_is_shell_owned",
  shell.includes("<BottomNav") &&
    bottomNav.includes("data-bottom-nav") &&
    !shell.includes("showBottomNav"),
  "BottomNav always mounted",
);
check(
  "module_sheet_is_shell_owned",
  shell.includes("<ModuleSheet") && sheet.includes("id=\"doctor-modules\""),
  "ModuleSheet",
);

check(
  "detail_does_not_hide_bottom_nav",
  !frame.includes("showBottomNav") &&
    !frame.includes("@/components/app/AppShell") &&
    routeState.includes("hasReadingDock: true"),
  "detail routes keep bottom nav",
);

check(
  "reading_dock_clearance_includes_nav",
  frames.includes("LAYOUT_DOCK_ABOVE_NAV_RESERVE") &&
    frames.includes("layout-detail-clearance") &&
    dock.includes("LAYOUT_DOCK_ABOVE_NAV_RESERVE") &&
    dock.includes("layout-nav-height") &&
    css.includes("--layout-detail-clearance"),
  "dock above nav",
);

check(
  "loading_does_not_instantiate_shell",
  !loading.includes("AppShell") && loading.includes("AppLoadingState"),
  `${DOCTOR_APP}/loading.tsx`,
);

check(
  "error_does_not_instantiate_shell",
  !errorBoundary.includes("AppShell") &&
    errorBoundary.includes("AppErrorBoundaryFallback"),
  `${DOCTOR_APP}/error.tsx`,
);

check(
  "shell_has_no_pathname_key",
  !shell.includes("key={pathname}") &&
    !layout.includes("key={pathname}") &&
    shell.includes("data-doctor-shell"),
  "stable shell node",
);

check(
  "shell_uses_next_link_nav",
  bottomNav.includes('from "next/link"') &&
    sidebar.includes('from "next/link"') &&
    sheet.includes('from "next/link"') &&
    header.includes('from "next/link"'),
  "Link in chrome",
);

const outsideDoctor = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/auth/update-password/page.tsx",
  "app/onboarding/personalisation/page.tsx",
  "app/internal/layout.tsx",
  "app/api/health/route.ts",
  "app/interactions/page.tsx",
  "app/notifications/page.tsx",
  "app/premium/page.tsx",
  "app/staging-access/page.tsx",
];
check(
  "non_doctor_routes_remain_outside_group",
  outsideDoctor.every((file) => exists(file)),
  "auth/onboarding/internal/api/redirects",
);

const expectedDoctorPages = [
  `${DOCTOR_APP}/home/page.tsx`,
  `${DOCTOR_APP}/search/page.tsx`,
  `${DOCTOR_APP}/cat/page.tsx`,
  `${DOCTOR_APP}/cat/[slug]/page.tsx`,
  `${DOCTOR_APP}/protocols/page.tsx`,
  `${DOCTOR_APP}/protocols/[slug]/page.tsx`,
  `${DOCTOR_APP}/drugs/page.tsx`,
  `${DOCTOR_APP}/drugs/[slug]/page.tsx`,
  `${DOCTOR_APP}/calculators/page.tsx`,
  `${DOCTOR_APP}/calculators/[slug]/page.tsx`,
  `${DOCTOR_APP}/favorites/page.tsx`,
  `${DOCTOR_APP}/history/page.tsx`,
  `${DOCTOR_APP}/offline/page.tsx`,
  `${DOCTOR_APP}/offline/view/[type]/[slug]/page.tsx`,
  `${DOCTOR_APP}/profile/page.tsx`,
];
check(
  "doctor_urls_use_pathless_group",
  expectedDoctorPages.every((file) => exists(file)) &&
    !exists("app/home/page.tsx") &&
    !exists("app/cat/page.tsx"),
  "pathless (doctor) group",
);

const gated = [
  `${DOCTOR_APP}/protocols/[slug]/page.tsx`,
  `${DOCTOR_APP}/drugs/[slug]/page.tsx`,
  `${DOCTOR_APP}/calculators/[slug]/page.tsx`,
];
const ungated = gated.filter(
  (file) => !read(file).includes("requirePublishedDoctorContent"),
);
check(
  "publication_gates_remain_on_detail_routes",
  ungated.length === 0,
  ungated.join(", ") || "gated",
);

const stateDeps = ["zustand", "jotai", "redux", "recoil", "valtio", "@tanstack/react-query"];
check(
  "no_new_app_state_dependency",
  stateDeps.every((dep) => !pkg.includes(`"${dep}"`)),
  stateDeps.join(", "),
);

check(
  "connection_indicator_not_in_header",
  !shell.includes("ConnectionIndicator"),
  "AppShell.tsx",
);

function indexReturnsShellBeforeData(rel: string, chrome: string) {
  const src = read(rel);
  return (
    /export default function/.test(src) &&
    !/export default async function/.test(src) &&
    src.includes("<Suspense") &&
    src.includes("fallback=") &&
    src.includes(chrome)
  );
}

check(
  "search_page_returns_shell_before_data",
  indexReturnsShellBeforeData(`${DOCTOR_APP}/search/page.tsx`, "SearchIndexChrome") &&
    !read(`${DOCTOR_APP}/search/page.tsx`).includes("await searchParams"),
  `${DOCTOR_APP}/search/page.tsx`,
);
check(
  "home_page_returns_shell_before_data",
  indexReturnsShellBeforeData(`${DOCTOR_APP}/home/page.tsx`, "HomeIndexChrome"),
  `${DOCTOR_APP}/home/page.tsx`,
);
check(
  "cat_routes_redirect_to_protocols",
  read(`${DOCTOR_APP}/cat/page.tsx`).includes('redirect("/protocols")') &&
    read(`${DOCTOR_APP}/cat/[slug]/page.tsx`).includes("redirect(") &&
    read(`${DOCTOR_APP}/cat/[slug]/page.tsx`).includes("/protocols/"),
  `${DOCTOR_APP}/cat`,
);
check(
  "appshell_imports_instant_chromes",
  shell.includes('from "./instant-chromes"') &&
    shell.includes("InstantIndexChrome") &&
    shell.includes("INSTANT_INDEX_HREFS") &&
    shell.includes("router.prefetch"),
  "AppShell.tsx",
);
check(
  "appshell_header_has_no_back_control",
  !header.includes("Retour") &&
    !header.includes("ArrowLeft") &&
    !header.includes("onBack") &&
    !header.includes("backHref") &&
    header.includes('href="/home"') &&
    header.includes("Nabda, accueil") &&
    header.includes("aspect-square") &&
    header.includes("grid-cols-3") &&
    header.includes("text-center"),
  "AppHeader uses a centered title and N mark, without Retour",
);

check(
  "bottom_nav_optimistic_active_chip",
  bottomNav.includes("activePath") &&
    bottomNav.includes("pressedHref") &&
    bottomNav.includes("bg-surface-container") &&
    !bottomNav.includes("rounded-full") &&
    shell.includes("activePath={displayPath}"),
  "chip hugs icon+label and switches on pointer down",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `persistent shell ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
