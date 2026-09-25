/**
 * Static checks for UI-8C overlay motion and reduced-motion scrolling.
 * Does not scan node_modules or reject deferred Framer Motion / flowchart zoom.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function walk(dir: string, out: string[] = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const css = read("app/globals.css");
const vaul = read("app/vaul.css");
const sheet = read("components/app/ModuleSheet.tsx");
const auth = read("components/onboarding/AuthDrawer.tsx");
const personal = read("components/personal/profile/PersonalizationSheet.tsx");
const scroll = read("lib/ui/scroll-behavior.ts");
const pkg = JSON.parse(read("package.json")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const overlayCss = css.slice(css.indexOf(".module-sheet {"));

check(
  "modules_dialog_tokens",
  sheet.includes("module-sheet") &&
    sheet.includes("data-phase") &&
    overlayCss.includes("var(--motion-overlay)") &&
    overlayCss.includes("var(--duration-fast)") &&
    overlayCss.includes("var(--ease-enter)") &&
    overlayCss.includes("var(--ease-exit)") &&
    overlayCss.includes("translateY(16px)"),
  "ModuleSheet.tsx / globals.css",
);

const backdropRule = overlayCss.slice(
  overlayCss.indexOf(".module-sheet::backdrop"),
  overlayCss.indexOf(".module-sheet[data-phase=\"open\"]::backdrop"),
);
check(
  "backdrop_opacity_only",
  backdropRule.includes("transition-property: opacity") &&
    !backdropRule.includes("backdrop-filter") &&
    !backdropRule.includes("blur") &&
    overlayCss.includes("var(--duration-standard)"),
  "module-sheet backdrop",
);

check(
  "modules_exit_faster_than_entrance",
  overlayCss.includes(".module-sheet[data-phase=\"open\"]") &&
    overlayCss.indexOf("transition-duration: var(--duration-fast)") <
      overlayCss.indexOf("transition-duration: var(--motion-overlay)") &&
    overlayCss.includes("transition-duration: var(--duration-fast)") &&
    overlayCss.includes("transition-duration: var(--motion-overlay)"),
  "globals.css",
);

check(
  "no_500ms_in_scoped_sheets",
  !vaul.includes("0.5s") &&
    !vaul.includes("500ms") &&
    !auth.includes("500ms") &&
    !auth.includes("0.5s") &&
    !personal.includes("500ms") &&
    !personal.includes("0.5s") &&
    !sheet.includes("500ms") &&
    !sheet.includes("0.5s") &&
    !/0\.5s|500ms/.test(overlayCss),
  "vaul.css, auth, personalization, modules",
);

check(
  "vaul_uses_overlay_and_fast_timings",
  vaul.includes("var(--motion-overlay)") &&
    vaul.includes("var(--duration-fast)") &&
    vaul.includes("var(--ease-enter)") &&
    vaul.includes("var(--ease-exit)") &&
    overlayCss.includes('[data-vaul-drawer][data-state="open"]') &&
    overlayCss.includes("var(--motion-overlay) !important") &&
    overlayCss.includes('[data-vaul-drawer][data-state="closed"]') &&
    overlayCss.includes("var(--duration-fast) !important") &&
    overlayCss.includes('[data-vaul-overlay][data-state="open"]') &&
    overlayCss.includes("var(--duration-standard) !important"),
  "app/vaul.css and globals.css",
);

const depNames = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
];
check(
  "no_new_motion_dependency",
  depNames.includes("vaul") &&
    depNames.includes("framer-motion") &&
    !depNames.some((name) =>
      /gsap|auto-animate|react-spring|lottie|popmotion/i.test(name),
    ),
  depNames.filter((name) => /motion|vaul|gsap|spring|lottie/i.test(name)).join(", "),
);

check(
  "reduced_motion_scroll_utility",
  scroll.includes("preferredScrollBehavior") &&
    scroll.includes("scrollElementIntoView") &&
    scroll.includes("scrollWindowTo") &&
    scroll.includes('matchMedia("(prefers-reduced-motion: reduce)")') &&
    scroll.includes('typeof window === "undefined"') &&
    scroll.includes('"auto"') &&
    scroll.includes('"smooth"'),
  "lib/ui/scroll-behavior.ts",
);

const smoothHits: string[] = [];
for (const dir of ["app", "components", "features", "lib"]) {
  for (const file of walk(path.join(ROOT, dir))) {
    const text = fs.readFileSync(file, "utf8");
    if (/behavior:\s*["']smooth["']/.test(text)) {
      smoothHits.push(path.relative(ROOT, file).replaceAll("\\", "/"));
    }
  }
}
check(
  "scoped_smooth_calls_replaced",
  smoothHits.length === 0,
  smoothHits.join(", ") || "none",
);

check(
  "flowchart_zoom_still_deferred",
    read("components/cat-flowchart/CatFlowchartBoard.tsx").includes(
      "preferredMotionDuration(220)",
    ) &&
    read("components/cat-flowchart/CatFlowchartToolbar.tsx").includes(
      "preferredMotionDuration(220)",
    ),
  "CatFlowchartBoard.tsx / CatFlowchartToolbar.tsx",
);

check(
  "framer_motion_still_deferred",
  read("components/onboarding/WelcomeCarousel.tsx").includes("framer-motion") &&
    read("components/onboarding/WelcomeCarousel.tsx").includes("dragElastic={0}"),
  "WelcomeCarousel.tsx",
);

const clinicalChips = [
  "components/content-detail/SectionNav.tsx",
  "components/cat-detail/CatSegmentedTabs.tsx",
  "components/drugs/DrugTabs.tsx",
  "components/content-renderers/protocol/ProtocolSectionChips.tsx",
  "components/content-renderers/cat/CatStepChips.tsx",
  "components/content-renderers/drug/DrugPreviewTabs.tsx",
  "components/content-renderers/protocol/ProtocolShiftModeToggle.tsx",
  "components/content-renderers/drug/DrugPreviewModeToggle.tsx",
  "components/content-renderers/cat/CatPreviewModeToggle.tsx",
];
const chipMisses = clinicalChips.filter((file) => !read(file).includes("motion-color"));
check("clinical_chips_use_motion_color", chipMisses.length === 0, chipMisses.join(", ") || "all");

const slideHits = clinicalChips.filter((file) => {
  const text = read(file);
  return /motion-transform|framer-motion|translate-x|animate-in|slide-/.test(text);
});
check(
  "no_clinical_panel_slide",
  slideHits.length === 0,
  slideHits.join(", ") || "none",
);

check(
  "modules_focus_and_scroll_lock",
  sheet.includes("showModal()") &&
    sheet.includes(".close()") &&
    sheet.includes('overflow = "hidden"') &&
    sheet.includes("onClose") &&
    sheet.includes("onCancel") &&
    sheet.includes("preventDefault()") &&
    sheet.includes('setAttribute("closedby", "any")') &&
    sheet.includes("aria-current") &&
    sheet.includes("MODULE_NAV"),
  "ModuleSheet.tsx",
);

check(
  "vaul_behavior_preserved",
  auth.includes("shouldScaleBackground={false}") &&
    auth.includes("snapPoints={SNAP_POINTS}") &&
    auth.includes("LoginForm") &&
    auth.includes("RegisterForm") &&
    auth.includes("z-[var(--z-backdrop)]") &&
    auth.includes("z-[var(--z-sheet)]") &&
    personal.includes("shouldScaleBackground={false}") &&
    personal.includes('saveState === "saving"') &&
    personal.includes("z-[var(--z-backdrop)]") &&
    personal.includes("z-[var(--z-sheet)]") &&
    personal.includes("safe-area-inset-bottom"),
  "AuthDrawer.tsx / PersonalizationSheet.tsx",
);

check(
  "reduced_motion_removes_sheet_translation",
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.module-sheet\[data-phase="open"\] \{\s*transform: none;/.test(
    css,
  ),
  "globals.css",
);

check(
  "no_transition_all_in_overlay_css",
  !/transition:\s*all/.test(overlayCss) && !/transition:\s*all/.test(vaul),
  "globals.css / vaul.css",
);

const longDurations = [...overlayCss.matchAll(/(\d+(?:\.\d+)?)(ms|s)/g)]
  .map((match) => {
    const amount = Number(match[1]);
    const ms = match[2] === "s" ? amount * 1000 : amount;
    return ms > 300 ? match[0] : null;
  })
  .filter((value): value is string => Boolean(value));
const vaulLong = [...vaul.matchAll(/(\d+(?:\.\d+)?)(ms|s)/g)]
  .map((match) => {
    const amount = Number(match[1]);
    const ms = match[2] === "s" ? amount * 1000 : amount;
    return ms > 300 ? match[0] : null;
  })
  .filter((value): value is string => Boolean(value));
check(
  "overlay_durations_within_300ms",
  longDurations.length === 0 && vaulLong.length === 0,
  [...longDurations, ...vaulLong].join(", ") || "none",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `motion overlays ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
