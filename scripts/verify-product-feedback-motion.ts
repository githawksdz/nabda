/**
 * Static checks for UI-8D product feedback motion.
 * Does not require live Supabase data and does not scan node_modules.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const css = read("app/globals.css");
const field = read("components/ui/TextField.tsx");
const searchBar = read("components/search/SearchInputBar.tsx");
const homeSearch = read("components/home/HomeSearchBar.tsx");
const toast = read("components/ui/StatusToast.tsx");
const timing = read("lib/ui/feedback-timing.ts");
const notice = read("components/ui/useTimedFlag.ts");
const favorite = read("lib/ui/favorite-result.ts");
const medication = read("components/search/MedicationResultCard.tsx");
const protocol = read("components/protocols/ProtocolDetailPage.tsx");
const cat = read("components/cat-detail/CatDetailPage.tsx");
const drug = read("components/drugs/DrugDetailPage.tsx");
const calculator = read("components/calculators/CalculatorDetailPage.tsx");
const cockcroft = read("components/calculators/cockcroft/CockcroftCalculator.tsx");
const progress = read("components/ui/OfflineProgressStatus.tsx");
const manager = read("components/offline/OfflineManagerPage.tsx");
const library = read("components/content-detail/DetailLibraryStatus.tsx");
const connection = read("components/pwa/ConnectionIndicator.tsx");
const auth = read("components/onboarding/AuthDrawer.tsx");
const actions = read("lib/content-detail/user-content-actions.ts");
const pkg = JSON.parse(read("package.json")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

check(
  "search_standard_height",
  field.includes('compact ? "h-11" : "h-[var(--size-input)]"') &&
    !field.includes("h-14") &&
    !searchBar.includes("h-14") &&
    !searchBar.includes("h-12") &&
    !searchBar.includes("h-11") &&
    !homeSearch.includes("h-14") &&
    read("components/cat/CatSearchBar.tsx").includes("h-[var(--size-input)]") &&
    read("components/drugs/DrugSearchBar.tsx").includes("h-[var(--size-input)]") &&
    read("components/calculators/CalculatorSearchBar.tsx").includes(
      "h-[var(--size-input)]",
    ) &&
    read("components/protocols/ProtocolsIndexPage.tsx").includes("compact"),
  "SearchField and index bars",
);

check(
  "toast_enter_exit",
  css.includes(".status-toast") &&
    css.includes("translateY(8px)") &&
    css.includes("var(--duration-standard)") &&
    css.includes("var(--duration-fast)") &&
    toast.includes('data-phase={phase === "open" ? "open" : "closed"}') &&
    toast.includes('role={alert ? "alert" : "status"}') &&
    toast.includes("pointer-events-none") &&
    toast.includes("z-[var(--z-toast)]") &&
    toast.includes("safe-area-inset-bottom"),
  "StatusToast / globals.css",
);

check(
  "toast_restart_and_cleanup",
  timing.includes("TOAST_DWELL_MS = 2800") &&
    notice.includes("idRef.current += 1") &&
    toast.includes("window.clearTimeout") &&
    toast.includes("cancelAnimationFrame") &&
    toast.includes("TOAST_DWELL_MS"),
  "feedback timing",
);

const favoritePages = [protocol, cat, drug, calculator, medication];
check(
  "favorite_rollback",
  favorite.includes('case "unauthenticated"') &&
    favorite.includes('case "write_failed"') &&
    favoritePages.every((src) => src.includes("reconcileFavorite")) &&
    favoritePages.every((src) => src.includes("write_failed")),
  "favorite result reconciliation",
);

check(
  "favorite_inplace_success",
  css.includes(".motion-emphasis") &&
    css.includes("var(--motion-emphasis)") &&
    protocol.includes("FAVORITE_ADDED_MESSAGE") &&
    protocol.includes("favoriteEmphasis") &&
    medication.includes("motion-emphasis") &&
    !protocol.includes("Synthèse sauvegardée"),
  "in-place favorite confirmation",
);

check(
  "copy_inplace",
  timing.includes("COPY_LABEL_MS = 2000") &&
    cockcroft.includes('copied.active ? "Copié"') &&
    protocol.includes('copied.active ? "Copié"') &&
    cat.includes('copied.active ? "Copié"') &&
    calculator.includes('copied.active ? "Copié"') &&
    calculator.includes('"Copie indisponible", "alert"') &&
    notice.includes("window.clearTimeout(timer.current)"),
  "copy label",
);

check(
  "offline_real_progress",
  progress.includes("<progress") &&
    progress.includes("aria-label={label}") &&
    progress.includes("value={done}") &&
    progress.includes("max={total}") &&
    !progress.includes("%") &&
    manager.includes("done}/${total}") &&
    manager.includes("OfflineProgressStatus") &&
    library.includes("OfflineProgressStatus") &&
    manager.includes("setProgress(null)"),
  "offline progress",
);

check(
  "removal_after_success",
  manager.includes("contentRepository.removeItem") &&
    manager.indexOf("await contentRepository.removeItem") <
      manager.indexOf("setExitingId(id)") &&
    manager.includes('event.propertyName !== "opacity"') &&
    !manager.includes("setTimeout") &&
    !manager.includes("setInterval"),
  "OfflineManagerPage",
);

check(
  "connection_no_fake_sync",
  connection.includes("En ligne") &&
    connection.includes("Hors-ligne") &&
    connection.includes('aria-live="polite"') &&
    !connection.toLowerCase().includes("synchron"),
  "ConnectionIndicator",
);

check(
  "auth_safe_area",
  auth.includes("pb-[calc(24px+env(safe-area-inset-bottom,0px))]") &&
    auth.includes("shouldScaleBackground={false}"),
  "AuthDrawer",
);

check(
  "reduced_motion_feedback",
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.status-toast\[data-phase="open"\] \{\s*transform: translateX\(-50%\);/.test(
    css,
  ) &&
    css.includes(".motion-emphasis") &&
    css.includes("animation: none;") &&
    timing.includes("prefersReducedMotion()"),
  "globals.css",
);

const depNames = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
];
check(
  "no_new_motion_dependency",
  depNames.includes("vaul") &&
    depNames.includes("framer-motion") &&
    !depNames.some((name) => /gsap|auto-animate|react-spring|sonner|react-hot-toast/i.test(name)),
  "package.json",
);

check(
  "favorite_action_unchanged",
  actions.includes("export async function toggleFavorite") &&
    actions.includes('reason: "unauthenticated"') &&
    actions.includes('reason: "write_failed"') &&
    actions.includes('from("user_favorites")'),
  "user-content-actions.ts",
);

check(
  "deferred_motion_still_present",
  read("components/onboarding/WelcomeCarousel.tsx").includes("framer-motion") &&
    read("components/cat-flowchart/CatFlowchartBoard.tsx").includes(
      "preferredMotionDuration(220)",
    ),
  "WelcomeCarousel / CatFlowchartBoard",
);

check(
  "no_transition_all_in_feedback_css",
  !/transition:\s*all/.test(css.slice(css.indexOf(".status-toast"))),
  "globals.css",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `product feedback ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
