/**
 * Verify production/runtime paths do not import mock-named modules or demo
 * fixtures directly. Demo fixtures must load only via lib/demo-fixtures/load.ts
 * when NABDA_CONTENT_MODE=demo.
 *
 * Usage: npx tsx scripts/verify-no-runtime-mock-imports.ts
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const RUNTIME_SCAN_ROOTS = [
  "app/home",
  "app/search",
  "app/cat",
  "app/protocols",
  "app/drugs",
  "app/calculators",
  "app/favorites",
  "app/history",
  "app/profile",
  "components",
  "features",
  "lib/content-data",
  "lib/content-rendering",
  "lib/content-source",
  "lib/home",
  "lib/search",
  "lib/cat",
  "lib/cat-detail",
  "lib/cat-flowchart",
  "lib/drugs",
  "lib/calculators",
  "lib/personal",
  "lib/content-detail",
];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  "internal",
]);

const FILE_RE = /\.(ts|tsx)$/;

const FORBIDDEN = [
  {
    id: "mock-named import",
    pattern: /from\s+["']@\/lib\/[^"']*mock[^"']*["']/i,
  },
  {
    id: "direct demo-fixture import",
    pattern: /from\s+["']@\/lib\/demo-fixtures\/(?!load(?:["']|$))[^"']+["']/,
  },
  {
    id: "local JSON import",
    pattern: /from\s+["'][^"']*\/data\/[^"']*\.json["']/,
  },
  {
    id: "nabda_db import",
    pattern: /from\s+["'][^"']*nabda_db\//,
  },
  {
    id: "internal loader import",
    pattern: /from\s+["']@\/lib\/internal\//,
  },
];

const REQUIRED_UI_CONFIG = [
  "lib/home/home-ui-config.ts",
  "lib/search/search-ui-constants.ts",
  "lib/cat/cat-ui-config.ts",
  "lib/drugs/drug-ui-config.ts",
  "lib/calculators/calculator-ui-config.ts",
  "lib/personal/personal-ui-config.ts",
  "lib/content-detail/content-detail-ui-config.ts",
  "lib/cat-flowchart/flowchart-ui-config.ts",
];

const REQUIRED_DEMO_FIXTURES = [
  "lib/demo-fixtures/load.ts",
  "lib/demo-fixtures/home.ts",
  "lib/demo-fixtures/search.ts",
  "lib/demo-fixtures/cat.ts",
  "lib/demo-fixtures/personal.ts",
  "lib/demo-fixtures/drugs.ts",
  "lib/demo-fixtures/calculators.ts",
  "lib/demo-fixtures/content-detail.ts",
  "lib/demo-fixtures/flowchart.ts",
];

const DEMO_HEADER =
  "// Demo-mode fixture only. Do not import from production runtime providers.";

type Violation = {
  file: string;
  line?: number;
  rule: string;
  detail: string;
};

function rel(file: string): string {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function walk(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      walk(full, out);
    } else if (FILE_RE.test(entry.name)) {
      out.push(full);
    }
  }
}

const violations: Violation[] = [];
const files: string[] = [];
for (const root of RUNTIME_SCAN_ROOTS) {
  walk(path.join(ROOT, root), files);
}

for (const file of files) {
  const normalized = rel(file);
  if (normalized.startsWith("lib/demo-fixtures/")) continue;

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trim().startsWith("//")) return;
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: normalized,
          line: index + 1,
          rule: rule.id,
          detail: line.trim(),
        });
      }
    }
  });
}

const leftoverMocks = walkFindMocks(path.join(ROOT, "lib"));
for (const mockFile of leftoverMocks) {
  violations.push({
    file: mockFile,
    rule: "leftover mock-* file under lib/",
    detail: "Delete or move to lib/demo-fixtures / *-ui-config",
  });
}

for (const uiConfig of REQUIRED_UI_CONFIG) {
  if (!fs.existsSync(path.join(ROOT, uiConfig))) {
    violations.push({
      file: uiConfig,
      rule: "missing ui-config module",
      detail: "Expected production UI config module",
    });
  }
}

for (const fixture of REQUIRED_DEMO_FIXTURES) {
  const full = path.join(ROOT, fixture);
  if (!fs.existsSync(full)) {
    violations.push({
      file: fixture,
      rule: "missing demo fixture module",
      detail: "Expected gated demo fixture",
    });
    continue;
  }
  if (fixture.endsWith("load.ts")) continue;
  const head = fs.readFileSync(full, "utf8").split(/\r?\n/).slice(0, 3).join("\n");
  if (!head.includes(DEMO_HEADER)) {
    violations.push({
      file: fixture,
      rule: "missing demo fixture header comment",
      detail: DEMO_HEADER,
    });
  }
}

const loadSrc = fs.readFileSync(
  path.join(ROOT, "lib/demo-fixtures/load.ts"),
  "utf8",
);
if (
  !loadSrc.includes("isDemoContentMode") ||
  !loadSrc.includes("isDemoContentModeClient")
) {
  violations.push({
    file: "lib/demo-fixtures/load.ts",
    rule: "demo loader missing mode gate",
    detail: "load.ts must check NABDA_CONTENT_MODE / NEXT_PUBLIC demo flags",
  });
}

function walkFindMocks(dir: string): string[] {
  const found: string[] = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name) || entry.name === "demo-fixtures") {
        continue;
      }
      found.push(...walkFindMocks(full));
    } else if (/^mock[-.].*\.tsx?$/i.test(entry.name) || /.*-mock\.tsx?$/i.test(entry.name)) {
      found.push(rel(full));
    }
  }
  return found;
}

const report = {
  generated_at: new Date().toISOString(),
  ok: violations.length === 0,
  runtimeScanRoots: RUNTIME_SCAN_ROOTS,
  scannedFileCount: files.length,
  uiConfigModules: REQUIRED_UI_CONFIG,
  demoFixtureModules: REQUIRED_DEMO_FIXTURES,
  demoModeStillSupported: true,
  demoLoader: "lib/demo-fixtures/load.ts",
  violationCount: violations.length,
  violations,
};

const outPath = path.join(ROOT, "data", "no-runtime-mock-imports-report.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

if (violations.length > 0) {
  console.error(`No-runtime-mock-imports failed: ${violations.length} violation(s)`);
  for (const item of violations) {
    const loc = item.line ? `:${item.line}` : "";
    console.error(`  [${item.rule}] ${item.file}${loc} ${item.detail}`);
  }
  process.exit(1);
}

console.log(
  `No runtime mock imports ok (${files.length} files scanned; demo fixtures gated via load.ts).`,
);
