/**
 * Static checks for UI-8E reduced motion and announcement timing.
 * Does not scan node_modules.
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

const carousel = read("components/onboarding/WelcomeCarousel.tsx");
const dock = read("components/onboarding/BottomActionDock.tsx");
const board = read("components/cat-flowchart/CatFlowchartBoard.tsx");
const toolbar = read("components/cat-flowchart/CatFlowchartToolbar.tsx");
const motionUtil = read("lib/ui/scroll-behavior.ts");
const announce = read("components/ui/useDebouncedAnnouncement.ts");
const cockcroft = read("components/calculators/cockcroft/CockcroftResultCard.tsx");
const glasgow = read("components/calculators/glasgow/GlasgowResultCard.tsx");
const formula = read("components/calculators/GeneratedFormulaCalculator.tsx");
const css = read("app/globals.css");
const pkg = JSON.parse(read("package.json")) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

check(
  "framer_reduced_motion_user",
  carousel.includes('reducedMotion="user"') && carousel.includes("useReducedMotion"),
  "WelcomeCarousel.tsx",
);

check(
  "carousel_no_elastic",
  carousel.includes("dragElastic={0}") &&
    !carousel.includes("0.22") &&
    !carousel.includes("0.18") &&
    carousel.includes("duration: spatial ? 0.26 : 0"),
  "WelcomeCarousel.tsx",
);

check(
  "onboarding_press_shared",
  dock.includes("motion-press") &&
    !dock.includes("whileTap") &&
    !dock.includes("framer-motion"),
  "BottomActionDock.tsx",
);

check(
  "flowchart_reduced_duration",
  board.includes("preferredMotionDuration(220)") &&
    toolbar.includes("preferredMotionDuration(220)") &&
    motionUtil.includes("prefersReducedMotion()") &&
    motionUtil.includes("return 0"),
  "flowchart / scroll-behavior",
);

check(
  "calculator_visible_not_debounced",
  cockcroft.includes("{result.display}") &&
    glasgow.includes("{interpretation.fraction}") &&
    formula.includes("{resultText}") &&
    !formula.includes("useDebouncedAnnouncement"),
  "result cards",
);

check(
  "announcement_debounced_separately",
  announce.includes("CALCULATOR_ANNOUNCEMENT_MS = 500") &&
    announce.includes("window.clearTimeout") &&
    cockcroft.includes('className="sr-only"') &&
    cockcroft.includes('aria-live="polite"') &&
    glasgow.includes('className="sr-only"') &&
    glasgow.includes('aria-live="polite"'),
  "live region",
);

function displayIsNotLive(source: string) {
  const marker = source.indexOf("text-display");
  const open = source.lastIndexOf("<p", marker);
  const close = source.indexOf(">", marker);
  return open >= 0 && close > open && !source.slice(open, close).includes("aria-live");
}

check(
  "visible_result_not_live",
  displayIsNotLive(cockcroft) && displayIsNotLive(glasgow),
  "visible result text",
);

check(
  "duration_slow_removed",
  !css.includes("--duration-slow"),
  "globals.css",
);

const depNames = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
];
check(
  "no_new_motion_dependency",
  depNames.includes("framer-motion") &&
    !depNames.some((name) => /gsap|auto-animate|react-spring/i.test(name)),
  "package.json",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `motion final ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
