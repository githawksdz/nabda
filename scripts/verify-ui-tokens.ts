import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");

const tokens = [
  "--canvas",
  "--surface-muted",
  "--surface-elevated",
  "--text-primary",
  "--action-primary",
  "--status-success",
  "--status-warning",
  "--status-premium",
  "--size-touch",
  "--z-header",
  "--duration-standard",
  "--layout-sidebar",
  "--layout-workspace",
  "--layout-clinical",
  "--layout-reading",
  "--layout-header-height",
  "--layout-nav-clearance",
  "--layout-dock-clearance",
];

const layoutClasses = [
  ".layout-gutter",
  ".layout-workspace",
  ".layout-clinical",
  ".layout-reading",
];

const primitives = [
  "components/ui/Button.tsx",
  "components/ui/IconButton.tsx",
  "components/ui/Surface.tsx",
  "components/ui/StatusBadge.tsx",
  "components/ui/FilterChip.tsx",
  "components/ui/PillNav.tsx",
  "components/ui/TextField.tsx",
  "components/ui/LoadingIndicator.tsx",
  "components/ui/EmptyState.tsx",
];

const checks: { id: string; ok: boolean; detail: string }[] = [];

for (const token of tokens) {
  checks.push({
    id: `token_${token}`,
    ok: css.includes(token),
    detail: token,
  });
}

for (const className of layoutClasses) {
  checks.push({
    id: `layout_class_${className.slice(1)}`,
    ok: css.includes(className),
    detail: className,
  });
}

const shell = fs.readFileSync(
  path.join(ROOT, "components/app/AppShell.tsx"),
  "utf8",
);
checks.push({
  id: "shell_uses_layout_frames",
  ok:
    shell.includes("LAYOUT_FRAME") &&
    shell.includes("LAYOUT_NAV_RESERVE") &&
    !shell.includes("max-w-[42rem]") &&
    !shell.includes("frameClassName"),
  detail: "AppShell.tsx",
});

const detailFrame = fs.readFileSync(
  path.join(ROOT, "components/content-detail/ClinicalDetailFrame.tsx"),
  "utf8",
);
checks.push({
  id: "detail_uses_clinical_frame",
  ok:
    detailFrame.includes('frame="clinical"') &&
    detailFrame.includes("READING_DOCK_CONTENT_CLASS") &&
    !detailFrame.includes("max-w-[56rem]"),
  detail: "ClinicalDetailFrame.tsx",
});

checks.push({
  id: "indexes_not_phone_column",
  ok: ![
    "components/cat/CatIndexPage.tsx",
    "components/protocols/ProtocolsIndexPage.tsx",
    "components/drugs/DrugsIndexPage.tsx",
    "components/calculators/CalculatorsIndexPage.tsx",
    "components/personal/profile/ProfilePage.tsx",
  ].some((file) =>
    fs.readFileSync(path.join(ROOT, file), "utf8").includes("max-w-[390px]"),
  ),
  detail: "index and profile frames",
});

checks.push({
  id: "reduced_motion",
  ok: css.includes("prefers-reduced-motion"),
  detail: "globals.css",
});

checks.push({
  id: "viewport_still_scalable",
  ok:
    !fs.readFileSync(path.join(ROOT, "app/layout.tsx"), "utf8").includes(
      "userScalable: false",
    ),
  detail: "app/layout.tsx",
});

for (const file of primitives) {
  checks.push({
    id: `primitive_${path.basename(file, ".tsx")}`,
    ok: fs.existsSync(path.join(ROOT, file)),
    detail: file,
  });
}

const failed = checks.filter((item) => !item.ok);
console.log(`ui tokens ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
