/**
 * Static checks for UI-8B primitive motion.
 * Overlay timing is covered by verify-motion-overlays.ts.
 * Framer Motion stays deferred and must not fail this script.
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
    } else if (entry.name.endsWith(".tsx")) {
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
const pkg = read("package.json");
const button = read("components/ui/Button.tsx");
const iconButton = read("components/ui/IconButton.tsx");
const chip = read("components/ui/FilterChip.tsx");
const pill = read("components/ui/PillNav.tsx");
const field = read("components/ui/TextField.tsx");
const surface = read("components/ui/Surface.tsx");
const badge = read("components/ui/StatusBadge.tsx");
const loading = read("components/ui/LoadingIndicator.tsx");

const tokens: Record<string, string> = {
  "--motion-instant": "80ms",
  "--duration-fast": "120ms",
  "--duration-standard": "200ms",
  "--motion-emphasis": "220ms",
  "--motion-overlay": "260ms",
  "--ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "--ease-enter": "cubic-bezier(0, 0, 0.2, 1)",
  "--ease-exit": "cubic-bezier(0.4, 0, 1, 1)",
};

for (const [name, value] of Object.entries(tokens)) {
  check(
    `token_${name}`,
    css.includes(`${name}: ${value}`),
    `${name}: ${value}`,
  );
}

check(
  "duration_slow_removed",
  !css.includes("--duration-slow"),
  "unused slow token removed",
);

const motionBlock = css.slice(css.indexOf(".motion-press"));
check("motion_press_tokens", motionBlock.includes("var(--duration-fast)") && motionBlock.includes("var(--motion-instant)") && motionBlock.includes("var(--ease-standard)"), "globals.css");
check("motion_press_scale", css.includes("transform: scale(0.98)"), "globals.css");
check("reduced_motion_rule", css.includes("prefers-reduced-motion: reduce") && css.includes("transition-duration: 0.01ms !important"), "globals.css");
check("reduced_motion_removes_scale", /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.motion-press:active:not\(:disabled\) \{\s*transform: none;/.test(css), "globals.css");
check("reduced_motion_stops_spin", /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.motion-spin \{\s*animation: none;/.test(css), "globals.css");
check("no_transition_all_in_globals", !/transition:\s*all/.test(css) && !css.includes("transition-all"), "globals.css");

check("button_press", button.includes("motion-press") && button.includes("Spinner") && button.includes("disabled || loading"), "Button.tsx");
check("button_no_scale_utility", !button.includes("active:scale"), "Button.tsx");
check("icon_button_press", iconButton.includes("motion-press") && !iconButton.includes("active:scale"), "IconButton.tsx");
check("chip_color", chip.includes("motion-color") && !chip.includes("active:scale") && chip.includes("aria-pressed"), "FilterChip.tsx");
check("pill_color", pill.includes("motion-color") && pill.includes('aria-current={current ? "page"'), "PillNav.tsx");
check("field_focus", field.includes("motion-field") && !field.includes("h-14") && field.includes("aria-describedby"), "TextField.tsx");
check("surface_interactive_only", surface.includes('interactive:\n    "motion-surface') || surface.includes("motion-surface bg-surface-elevated"), "Surface.tsx");
check("badge_color", badge.includes("motion-color") && !badge.includes("animate-"), "StatusBadge.tsx");
check(
  "loading_spinner",
  loading.includes("motion-spin") &&
    loading.includes('role="status"') &&
    loading.includes('aria-live="polite"') &&
    !loading.includes("animate-pulse") &&
    !loading.includes("animate-spin"),
  "LoadingIndicator.tsx",
);

const uiDir = walk(path.join(ROOT, "components/ui"));
for (const file of uiDir) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  check(`ui_no_transition_all_${path.basename(file)}`, !text.includes("transition-all") && !/transition:\s*all/.test(text), rel);
  check(`ui_no_slow_or_overlay_${path.basename(file)}`, !text.includes("duration-slow") && !text.includes("motion-overlay") && !text.includes("320ms") && !text.includes("500ms"), rel);
  check(`ui_no_motion_lib_${path.basename(file)}`, !text.includes("framer-motion") && !text.includes("from \"vaul\""), rel);
}

const productFiles = [
  ...walk(path.join(ROOT, "components")),
  ...walk(path.join(ROOT, "app")),
];

const scaleHits: string[] = [];
const pulseHits: string[] = [];
const chevronHits: string[] = [];

for (const file of productFiles) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file).replaceAll("\\", "/");
  if (/active:scale/.test(text)) scaleHits.push(rel);
  if (/animate-pulse/.test(text)) pulseHits.push(rel);
  if (/group-hover:translate|hover:translate-/.test(text)) chevronHits.push(rel);
}

check("no_press_scale_utilities", scaleHits.length === 0, scaleHits.join(", ") || "none");
check("no_decorative_pulse", pulseHits.length === 0, pulseHits.join(", ") || "none");
check("no_decorative_chevron_travel", chevronHits.length === 0, chevronHits.join(", ") || "none");

check(
  "deps_unchanged",
  pkg.includes('"framer-motion"') &&
    pkg.includes('"vaul"') &&
    !pkg.includes('"gsap"') &&
    !pkg.includes("auto-animate"),
  "package.json",
);

check(
  "vaul_stylesheet_uses_overlay_tokens",
  !read("app/vaul.css").includes("0.5s") &&
    read("app/vaul.css").includes("var(--motion-overlay)") &&
    read("app/vaul.css").includes("var(--duration-fast)"),
  "app/vaul.css",
);
check(
  "deferred_framer_still_present",
  read("components/onboarding/WelcomeCarousel.tsx").includes("framer-motion"),
  "WelcomeCarousel.tsx",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `motion primitives ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
