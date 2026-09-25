/**
 * Static checks for public publication boundary (doctor-facing app).
 *
 * Usage: npx tsx scripts/verify-publication-boundary.ts
 */
import fs from "node:fs";
import path from "node:path";

import {
  ANONYMOUS_VIEWER,
  canReadContent,
  filterReadableContent,
} from "@/lib/authz/content-gate";

const ROOT = process.cwd();

type Check = { id: string; ok: boolean; detail: string };

const checks: Check[] = [];

function read(rel: string): string {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function walkTs(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walkTs(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(path.relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

// 1–7 gate semantics
{
  const free = canReadContent(
    { status: "published", visibility: "public_free" },
    ANONYMOUS_VIEWER,
  );
  const draft = canReadContent(
    { status: "draft", visibility: "public_free" },
    ANONYMOUS_VIEWER,
  );
  const hidden = canReadContent(
    { status: "published", visibility: "hidden" },
    ANONYMOUS_VIEWER,
  );
  const placeholder = canReadContent(
    { status: "seed_placeholder", visibility: "public_free" },
    ANONYMOUS_VIEWER,
  );
  const premiumNoPro = canReadContent(
    { status: "published", visibility: "premium" },
    ANONYMOUS_VIEWER,
  );
  const premiumPro = canReadContent(
    { status: "published", visibility: "premium" },
    { ...ANONYMOUS_VIEWER, authenticated: true, hasActivePro: true },
  );
  checks.push(
    { id: "published_free_allowed", ok: free, detail: `allowed=${free}` },
    { id: "draft_rejected", ok: !draft, detail: `allowed=${draft}` },
    { id: "hidden_rejected", ok: !hidden, detail: `allowed=${hidden}` },
    { id: "seed_placeholder_rejected", ok: !placeholder, detail: `allowed=${placeholder}` },
    { id: "premium_requires_entitlement", ok: !premiumNoPro && premiumPro, detail: `anon=${premiumNoPro} pro=${premiumPro}` },
  );
  const filtered = filterReadableContent(
    [
      { slug: "a", status: "published", visibility: "public_free" },
      { slug: "b", status: "draft", visibility: "public_free" },
    ],
    ANONYMOUS_VIEWER,
  );
  checks.push({
    id: "filter_readable_content",
    ok: filtered.length === 1 && filtered[0]?.slug === "a",
    detail: `count=${filtered.length}`,
  });
}

// 8 search zero copy
{
  const zero = read("components/search/ZeroResultCanvas.tsx");
  checks.push({
    id: "search_zero_copy",
    ok:
      zero.includes("SEARCH_EMPTY_TITLE") &&
      zero.includes("SEARCH_EMPTY_HELP") &&
      read("lib/search/search-outcome.ts").includes(
        "Ce contenu n’existe pas dans Nabda",
      ) &&
      read("lib/search/search-outcome.ts").includes("Essayez un autre terme"),
    detail: "ZeroResultCanvas messaging",
  });
}

// 9–10 home/history helpers
{
  const homeApi = read("features/home/api.ts");
  const personal = read("lib/personal/personal-mappers.ts");
  checks.push({
    id: "home_feed_clinical_gate",
    ok: homeApi.includes("viewerCanReadSlug"),
    detail: "getHomeFeedItems clinical targets",
  });
  checks.push({
    id: "history_catalog_readable",
    ok: personal.includes("isCatalogReadable"),
    detail: "personal catalog readability",
  });
}

// 11 public routes gate before render data
for (const route of [
  "app/protocols/[slug]/page.tsx",
  "app/cat/[slug]/page.tsx",
  "app/drugs/[slug]/page.tsx",
  "app/calculators/[slug]/page.tsx",
]) {
  const src = read(route);
  checks.push({
    id: `route_gate_${path.basename(path.dirname(route))}`,
    ok:
      src.includes("requirePublishedDoctorContent") &&
      src.includes('redirect("/home")'),
    detail: route,
  });
}

// 11b no ContentUnavailable on public detail routes
for (const route of [
  "app/protocols/[slug]/page.tsx",
  "app/cat/[slug]/page.tsx",
  "app/drugs/[slug]/page.tsx",
  "app/calculators/[slug]/page.tsx",
]) {
  checks.push({
    id: `route_no_content_unavailable_${path.basename(path.dirname(route))}`,
    ok: !read(route).includes("ContentUnavailable"),
    detail: route,
  });
}

// 12 no public route imports preparation components
{
  const publicRoots = ["app/protocols", "app/cat", "app/drugs", "app/calculators"];
  const prepImports = [
    "ProtocolPreparationState",
    "CatPreparationView",
    "CatMapPreparationState",
    "DrugPreparationState",
    "CalculatorPreparationState",
  ];
  const violations: string[] = [];
  for (const root of publicRoots) {
    const dir = path.join(ROOT, root);
    for (const file of walkTs(dir)) {
      if (file.includes("/internal/")) continue;
      const src = read(file);
      for (const token of prepImports) {
        if (src.includes(token)) {
          violations.push(`${file}:${token}`);
        }
      }
    }
  }
  checks.push({
    id: "no_prep_imports_public_routes",
    ok: violations.length === 0,
    detail: violations.length ? violations.join(", ") : "none",
  });
}

// 13 identity search published filter
{
  const identity = read("lib/search/identity-search.ts");
  checks.push({
    id: "identity_search_published_eq",
    ok: identity.includes('.eq("status", "published")'),
    detail: "server-side published filter",
  });
}

// 14 require helper exists
{
  const helper = read("lib/authz/require-published-doctor-content.ts");
  checks.push({
    id: "require_published_helper",
    ok: helper.includes("viewerCanReadSlug") && helper.includes('redirect("/home")'),
    detail: "shared doctor gate",
  });
}

// 15 no service role on public detail routes
for (const route of [
  "app/protocols/[slug]/page.tsx",
  "app/cat/[slug]/page.tsx",
  "app/drugs/[slug]/page.tsx",
  "app/calculators/[slug]/page.tsx",
]) {
  checks.push({
    id: `route_no_service_role_${path.basename(path.dirname(route))}`,
    ok: !read(route).includes("service_role") && !read(route).includes("createAdminClient"),
    detail: route,
  });
}

const failed = checks.filter((c) => !c.ok);
if (failed.length > 0) {
  console.error(`Publication boundary verification failed (${failed.length}):`);
  for (const check of failed) {
    console.error(`  - ${check.id}: ${check.detail}`);
  }
  process.exit(1);
}

console.log(`Publication boundary verification ok (${checks.length} checks).`);
