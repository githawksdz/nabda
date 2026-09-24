/**
 * Fail if public/runtime surfaces import internal tooling, mocks, local JSON,
 * nabda_db, or demo fixtures directly (except the gated loader).
 * Usage: npx tsx scripts/check-renderer-import-boundaries.ts
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const PUBLIC_SCAN_ROOTS = [
  "app/home",
  "app/search",
  "app/cat",
  "app/protocols",
  "app/drugs",
  "app/calculators",
  "app/favorites",
  "app/history",
  "app/profile",
  "app/content-media",
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

const ALLOWED_IMPORT_ROOTS = [
  "scripts/",
  "app/internal/",
  "lib/internal/",
  "lib/nabda-db/",
  "lib/demo-fixtures/",
];

/** Only this module may load demo fixtures from production/runtime paths. */
const DEMO_FIXTURE_LOADER = "lib/demo-fixtures/load.ts";

const FORBIDDEN_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  {
    id: "@/components/internal/",
    pattern: /from\s+["']@\/components\/internal\//,
  },
  {
    id: "@/lib/internal/",
    pattern: /from\s+["']@\/lib\/internal\//,
  },
  {
    id: "@/types/internal-*",
    pattern: /from\s+["']@\/types\/internal/,
  },
  {
    id: "*-local loaders",
    pattern: /from\s+["']@\/lib\/(?:content-data|internal)\/[^"']*-local["']/,
  },
  {
    id: "data/*.json",
    pattern: /from\s+["'][^"']*\/data\/[^"']*\.json["']/,
  },
  {
    id: "nabda_db/",
    pattern: /from\s+["'][^"']*nabda_db\//,
  },
  {
    id: "mock-* modules",
    pattern: /from\s+["']@\/lib\/[^"']*mock[^"']*["']/i,
  },
  {
    id: "*-mock* modules",
    pattern: /from\s+["']@\/[^"']*-mock[^"']*["']/i,
  },
  {
    id: "lib/demo-fixtures/* (direct)",
    pattern: /from\s+["']@\/lib\/demo-fixtures\/(?!load(?:["']|$))[^"']+["']/,
  },
];

const FILE_RE = /\.(ts|tsx)$/;

type Violation = {
  file: string;
  line: number;
  rule: string;
  import: string;
};

function rel(file: string): string {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function isAllowedImporter(file: string): boolean {
  const normalized = rel(file);
  return ALLOWED_IMPORT_ROOTS.some((prefix) => normalized.startsWith(prefix));
}

function walk(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === "internal"
      ) {
        continue;
      }
      walk(full, out);
    } else if (FILE_RE.test(entry.name)) {
      out.push(full);
    }
  }
}

const files: string[] = [];
for (const scanRoot of PUBLIC_SCAN_ROOTS) {
  walk(path.join(ROOT, scanRoot), files);
}

const violations: Violation[] = [];
for (const file of files) {
  const normalized = rel(file);
  if (isAllowedImporter(file)) {
    continue;
  }
  if (normalized === DEMO_FIXTURE_LOADER) {
    continue;
  }

  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.trim().startsWith("//")) {
      return;
    }
    for (const rule of FORBIDDEN_PATTERNS) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: normalized,
          line: index + 1,
          rule: rule.id,
          import: line.trim(),
        });
      }
    }
  });
}

const report = {
  generated_at: new Date().toISOString(),
  ok: violations.length === 0,
  publicScanRoots: PUBLIC_SCAN_ROOTS,
  allowedImportRoots: ALLOWED_IMPORT_ROOTS,
  demoFixtureLoaderException: DEMO_FIXTURE_LOADER,
  forbiddenRules: FORBIDDEN_PATTERNS.map((rule) => rule.id),
  scannedFileCount: files.length,
  violationCount: violations.length,
  violations,
};

const outPath = path.join(ROOT, "data", "renderer-import-boundary-report.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

if (violations.length > 0) {
  console.error(`Renderer import boundary failed: ${violations.length} violation(s)`);
  for (const item of violations) {
    console.error(`  [${item.rule}] ${item.file}:${item.line} ${item.import}`);
  }
  process.exit(1);
}

console.log(`Renderer import boundary ok (${files.length} files scanned).`);
