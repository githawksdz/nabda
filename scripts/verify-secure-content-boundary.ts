/**
 * Secure content boundary verification.
 * Always runs static checks. Live Supabase/RLS runs only when credentials exist.
 *
 * Usage: npx tsx scripts/verify-secure-content-boundary.ts
 * Output: data/secure-content-boundary-report.json
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import { getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { safeAuthRedirectPath } from "@/lib/authz/redirect";
import {
  ANONYMOUS_VIEWER,
  canReadContent,
  canReadStaffContent,
  hasStaffRole,
  isProPlanSlug,
  type ViewerAccess,
} from "@/lib/authz/content-gate";
import { isSafeMediaFilename, resolveCatSourceMediaPath, resolveDrugSourceMediaPath } from "@/lib/content-data/source-media-paths";
import { assertNoSearchableTextLeak } from "@/lib/search/search-documents";
import { identityHitsHaveClinicalFields } from "@/lib/search/identity-search";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "secure-content-boundary-report.json");

type Check = { id: string; layer: "static" | "live"; ok: boolean; detail: string };

const PUBLIC_REQUEST_ROOTS = ["app", "features", "components"];
const LIB_USER_PATHS = ["lib"];
const ADMIN_ALLOWLIST = new Set([
  "lib/supabase/admin.ts",
  "lib/nabda-db/import-client.ts",
]);

function walkFiles(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "nabda_db", "data"].includes(entry.name)) continue;
      walkFiles(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function rel(file: string): string {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function checkRedirects(): Check[] {
  const cases: Array<[string | null, string, string]> = [
    [null, "/home", "missing"],
    ["", "/home", "empty"],
    ["/onboarding/personalisation", "/onboarding/personalisation", "safe relative"],
    ["https://evil.com", "/home", "absolute"],
    ["http://evil.com/phish", "/home", "http absolute"],
    ["//evil.com", "/home", "protocol-relative"],
    ["///evil.com", "/home", "triple slash"],
    ["\\\\evil.com", "/home", "backslash"],
    ["/\\evil.com", "/home", "slash backslash"],
    ["/%2F%2Fevil.com", "/home", "encoded protocol-relative"],
    ["/%2e%2e/secret", "/home", "encoded traversal"],
    ["/home/../admin", "/home", "dot-dot"],
    ["javascript:alert(1)", "/home", "javascript scheme"],
    ["/%09/evil.com", "/home", "encoded tab"],
  ];

  return cases.map(([input, expected, id]) => {
    const got = safeAuthRedirectPath(input, "/home");
    return {
      id: `redirect_${id.replace(/\s+/g, "_")}`,
      layer: "static",
      ok: got === expected,
      detail: `input=${JSON.stringify(input)} got=${got} expected=${expected}`,
    };
  });
}

function checkContentGate(): Check[] {
  const anon = ANONYMOUS_VIEWER;
  const auth: ViewerAccess = {
    userId: "a",
    authenticated: true,
    hasActivePro: false,
    staffRole: "none",
  };
  const pro: ViewerAccess = { ...auth, hasActivePro: true };
  const expiredPro: ViewerAccess = { ...auth, hasActivePro: false };
  const reviewer: ViewerAccess = {
    userId: "r",
    authenticated: true,
    hasActivePro: false,
    staffRole: "reviewer",
  };
  const publicFree = {
    slug: "x",
    visibility: "public_free",
    status: "published",
    reviewStatus: "unreviewed",
  };
  const publicValidated = { ...publicFree, reviewStatus: "validated" };
  const premium = { ...publicFree, visibility: "premium" };
  const draft = { ...publicFree, status: "draft" };
  const seed = { ...publicFree, status: "seed_placeholder" };
  const adminOnly = { ...publicFree, visibility: "admin_only" };

  const cases: Array<[string, boolean, boolean]> = [
    ["anon_public", canReadContent(publicFree, anon), true],
    ["anon_public_unreviewed", canReadContent(publicFree, anon), true],
    ["anon_public_validated_label_irrelevant", canReadContent(publicValidated, anon), true],
    ["anon_premium", canReadContent(premium, anon), false],
    ["auth_public", canReadContent(publicFree, auth), true],
    ["freemium_premium", canReadContent(premium, auth), false],
    ["pro_premium", canReadContent(premium, pro), true],
    ["expired_premium", canReadContent(premium, expiredPro), false],
    ["anon_draft", canReadContent(draft, anon), false],
    ["anon_seed_placeholder", canReadContent(seed, anon), false],
    ["anon_admin_only", canReadContent(adminOnly, anon), false],
    ["reviewer_admin_only_not_public", canReadContent(adminOnly, reviewer), false],
    ["reviewer_draft_not_public", canReadContent(draft, reviewer), false],
    ["reviewer_draft_staff_path", canReadStaffContent(draft, reviewer), true],
    ["reviewer_admin_only_staff_path", canReadStaffContent(adminOnly, reviewer), true],
    ["missing", canReadContent(null, pro), false],
    ["staff_rank", hasStaffRole("reviewer", "reviewer") && !hasStaffRole("none", "reviewer"), true],
    ["pro_plan_slug_exact", isProPlanSlug("pro_yearly") && !isProPlanSlug("pro_monthly"), true],
  ];

  return cases.map(([id, got, expected]) => ({
    id: `gate_${id}`,
    layer: "static",
    ok: got === expected,
    detail: `got=${got} expected=${expected}`,
  }));
}

function checkMediaTraversal(): Check[] {
  const attacks = ["../secret.png", "..\\secret.png", "/etc/passwd", "....//x.png", "a/../../b.png"];
  return attacks.map((name) => ({
    id: `media_traversal_${name}`,
    layer: "static",
    ok:
      !isSafeMediaFilename(name) &&
      resolveCatSourceMediaPath(name) === null &&
      resolveDrugSourceMediaPath(name) === null,
    detail: name,
  }));
}

function checkServiceRoleImports(): Check[] {
  const files = [
    ...PUBLIC_REQUEST_ROOTS.flatMap((d) => walkFiles(path.join(ROOT, d))),
    ...LIB_USER_PATHS.flatMap((d) => walkFiles(path.join(ROOT, d))),
  ];
  const hits: string[] = [];
  for (const file of files) {
    const name = rel(file);
    if (ADMIN_ALLOWLIST.has(name)) continue;
    if (name.startsWith("lib/nabda-db/")) continue;
    if (name.includes("scripts/")) continue;
    const text = fs.readFileSync(file, "utf8");
    if (
      /createAdminClient\s*\(/.test(text) ||
      /from\s+"@\/lib\/supabase\/admin"/.test(text) ||
      /createImportClient\s*\(/.test(text)
    ) {
      hits.push(name);
    }
  }
  return [
    {
      id: "no_service_role_on_user_paths",
      layer: "static",
      ok: hits.length === 0,
      detail: hits.length ? hits.join(", ") : "none",
    },
  ];
}

function checkSelectStar(): Check[] {
  const files = [
    ...walkFiles(path.join(ROOT, "app")),
    ...walkFiles(path.join(ROOT, "features")),
    ...walkFiles(path.join(ROOT, "lib", "content-data")),
    ...walkFiles(path.join(ROOT, "lib", "content-detail")),
    ...walkFiles(path.join(ROOT, "lib", "search")),
    ...walkFiles(path.join(ROOT, "lib", "personal")),
  ];
  const hits: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (/\.select\(\s*"\*"\s*\)/.test(text)) {
      hits.push(rel(file));
    }
  }
  return [
    {
      id: "no_public_select_star",
      layer: "static",
      ok: hits.length === 0,
      detail: hits.length ? hits.join(", ") : "none",
    },
  ];
}

function checkPublicationAuthIgnoresReview(): Check[] {
  const roots = [
    path.join(ROOT, "lib", "authz"),
    path.join(ROOT, "lib", "search", "identity-search.ts"),
    path.join(ROOT, "lib", "search", "search-documents.ts"),
    path.join(ROOT, "lib", "content-data"),
    path.join(ROOT, "features", "content"),
    path.join(ROOT, "app", "content-media"),
    path.join(ROOT, "supabase", "migrations", "0021_publishing_hub_boundary.sql"),
  ];
  const hits: string[] = [];
  const scan = (file: string) => {
    if (!fs.existsSync(file)) return;
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      walkFiles(file).forEach(scan);
      return;
    }
    const text = fs.readFileSync(file, "utf8");
    if (
      /\.eq\(\s*["']review_status["']\s*,\s*["']validated["']\s*\)/.test(text) ||
      /p_review_status\s*=\s*'validated'/.test(text) ||
      /\.eq\(\s*["']clinical_payload_status["']\s*,\s*["']validated["']\s*\)/.test(text) ||
      /clinical_payload_status\s*=\s*'validated'/.test(text)
    ) {
      hits.push(rel(file));
    }
  };
  roots.forEach(scan);
  const migration0021 = path.join(ROOT, "supabase", "migrations", "0021_publishing_hub_boundary.sql");
  const migrationText = fs.existsSync(migration0021)
    ? fs.readFileSync(migration0021, "utf8")
    : "";
  return [
    {
      id: "public_auth_ignores_review_status",
      layer: "static",
      ok: hits.length === 0,
      detail: hits.length ? hits.join(", ") : "published + visibility only",
    },
    {
      id: "public_auth_ignores_clinical_payload_status",
      layer: "static",
      ok: hits.length === 0,
      detail: "clinical_payload_status is not an authorization requirement",
    },
    {
      id: "migration_0021_publishing_hub",
      layer: "static",
      ok:
        fs.existsSync(migration0021) &&
        migrationText.includes("p_status = 'published'") &&
        migrationText.includes("p_visibility = 'public_free'") &&
        !/p_review_status\s*=\s*'validated'/.test(migrationText),
      detail: "0021 replaces public ACL without review_status = validated",
    },
    {
      id: "has_active_pro_uses_pro_yearly",
      layer: "static",
      ok: /s\.plan_slug\s*=\s*'pro_yearly'/.test(migrationText),
      detail: "has_active_pro requires plan_slug = pro_yearly",
    },
  ];
}

function checkPublishedCatalogQueries(): Check[] {
  const files = [
    path.join(ROOT, "features", "content", "api.ts"),
    path.join(ROOT, "features", "home", "api.ts"),
    path.join(ROOT, "lib", "search", "identity-search.ts"),
  ];
  const missing: string[] = [];
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (!text.includes('.eq("status", "published")')) {
      missing.push(rel(file));
    }
  }
  return [
    {
      id: "public_queries_require_published",
      layer: "static",
      ok: missing.length === 0,
      detail: missing.length ? missing.join(", ") : "catalog/search filter status=published",
    },
  ];
}

function checkEntitlementSource(): Check[] {
  const access = fs.readFileSync(path.join(ROOT, "lib", "authz", "access.ts"), "utf8");
  const usesSubscriptions =
    access.includes('from("user_subscriptions")') && access.includes("ends_at");
  const profilesSelectIsStaffOnly = /from\("profiles"\)\s*\.select\("staff_role"\)/.test(access);
  const middleware = fs.readFileSync(path.join(ROOT, "lib", "supabase", "middleware.ts"), "utf8");
  const mediaCat = fs.readFileSync(path.join(ROOT, "app", "content-media", "cat", "route.ts"), "utf8");
  const mediaDrug = fs.readFileSync(path.join(ROOT, "app", "content-media", "drug", "route.ts"), "utf8");
  return [
    {
      id: "entitlement_not_from_profile_plan",
      layer: "static",
      ok:
        usesSubscriptions && profilesSelectIsStaffOnly,
      detail: "getViewerAccess reads user_subscriptions, not profiles.plan_slug",
    },
    {
      id: "middleware_preserves_cookie_options",
      layer: "static",
      ok:
        middleware.includes("applySessionCookies") &&
        middleware.includes("sessionCookies") &&
        /cookies\.set\(name, value, options\)/.test(middleware),
      detail: "redirects copy full cookie options",
    },
    {
      id: "media_uses_parent_content_acl",
      layer: "static",
      ok: mediaCat.includes("viewerCanReadSlug") && mediaDrug.includes("viewerCanReadSlug"),
      detail: "media routes authorize via parent slug publication and entitlement",
    },
  ];
}

function checkSearchLeaks(): Check[] {
  const payload = {
    id: "1",
    title: "Asthme",
    snippet: "Extrait",
    searchable_text: "should not leak",
  };
  const leaks = assertNoSearchableTextLeak({ hits: [payload] });
  const clinical = identityHitsHaveClinicalFields([
    {
      type: "protocol",
      slug: "x",
      title: "X",
    },
  ]);
  return [
    {
      id: "search_no_searchable_text_leak",
      layer: "static",
      ok: leaks.length > 0,
      detail: "assertNoSearchableTextLeak detects nested searchable_text",
    },
    {
      id: "identity_no_clinical_fields",
      layer: "static",
      ok: clinical.length === 0,
      detail: clinical.join(",") || "clean",
    },
  ];
}

function checkPreviewParamRemoved(): Check[] {
  const access = fs.readFileSync(path.join(ROOT, "lib/internal/preview-access.ts"), "utf8");
  const gate = fs.readFileSync(path.join(ROOT, "lib/internal/preview-gate.ts"), "utf8");
  return [
    {
      id: "preview_not_query_param_gate",
      layer: "static",
      ok:
        !access.includes('previewParam === "internal"') &&
        gate.includes("requireRole") &&
        !gate.includes('previewParam === "internal"'),
      detail: "canAccessInternalPreview uses requireRole",
    },
  ];
}

async function runLiveChecks(): Promise<{ checks: Check[]; skipped: boolean; reason?: string }> {
  const { url, serviceRoleKey, anonKey } = getImportSupabaseEnv();
  const emailA = process.env.NABDA_TEST_USER_A_EMAIL;
  const passwordA = process.env.NABDA_TEST_USER_A_PASSWORD;
  const emailB = process.env.NABDA_TEST_USER_B_EMAIL;
  const passwordB = process.env.NABDA_TEST_USER_B_PASSWORD;

  if (!url || !anonKey) {
    return { checks: [], skipped: true, reason: "missing NEXT_PUBLIC_SUPABASE_URL or anon key" };
  }
  if (!emailA || !passwordA || !emailB || !passwordB) {
    return {
      checks: [],
      skipped: true,
      reason:
        "missing NABDA_TEST_USER_A_EMAIL/PASSWORD and NABDA_TEST_USER_B_EMAIL/PASSWORD",
    };
  }

  const checks: Check[] = [];
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const admin =
    serviceRoleKey
      ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
      : null;

  const { data: anonPremium, error: anonPremiumError } = await anon
    .from("protocols")
    .select("slug")
    .eq("visibility", "premium")
    .limit(1);
  checks.push({
    id: "live_anon_cannot_read_premium",
    layer: "live",
    ok: !anonPremiumError && (anonPremium ?? []).length === 0,
    detail: anonPremiumError?.message ?? `rows=${anonPremium?.length ?? 0}`,
  });

  const { data: anonDraft } = await anon
    .from("protocols")
    .select("slug")
    .eq("status", "draft")
    .limit(1);
  checks.push({
    id: "live_anon_cannot_read_draft",
    layer: "live",
    ok: (anonDraft ?? []).length === 0,
    detail: `rows=${anonDraft?.length ?? 0}`,
  });

  const { data: anonHidden } = await anon
    .from("protocols")
    .select("slug")
    .in("visibility", ["hidden", "admin_only", "preview_only"])
    .limit(1);
  checks.push({
    id: "live_anon_cannot_read_internal_visibility",
    layer: "live",
    ok: (anonHidden ?? []).length === 0,
    detail: `rows=${anonHidden?.length ?? 0}`,
  });

  const sessionA = createClient(url, anonKey, { auth: { persistSession: false } });
  const sessionB = createClient(url, anonKey, { auth: { persistSession: false } });
  const signA = await sessionA.auth.signInWithPassword({ email: emailA, password: passwordA });
  const signB = await sessionB.auth.signInWithPassword({ email: emailB, password: passwordB });
  checks.push({
    id: "live_user_a_session",
    layer: "live",
    ok: Boolean(signA.data.user) && !signA.error,
    detail: signA.error?.message ?? signA.data.user?.id ?? "ok",
  });
  checks.push({
    id: "live_user_b_session",
    layer: "live",
    ok: Boolean(signB.data.user) && !signB.error,
    detail: signB.error?.message ?? signB.data.user?.id ?? "ok",
  });

  const userA = signA.data.user;
  const userB = signB.data.user;
  if (!userA || !userB) {
    return { checks, skipped: false };
  }

  const { data: bProfile } = await sessionA.from("profiles").select("id").eq("id", userB.id);
  checks.push({
    id: "live_a_cannot_read_b_profile",
    layer: "live",
    ok: (bProfile ?? []).length === 0,
    detail: `rows=${bProfile?.length ?? 0}`,
  });

  const { error: updateB } = await sessionA
    .from("profiles")
    .update({ full_name: "intrusion" })
    .eq("id", userB.id);
  const { data: afterUpdate } = await sessionB
    .from("profiles")
    .select("full_name")
    .eq("id", userB.id)
    .maybeSingle();
  checks.push({
    id: "live_a_cannot_update_b_profile",
    layer: "live",
    ok: afterUpdate?.full_name !== "intrusion",
    detail: updateB?.message ?? `full_name=${afterUpdate?.full_name ?? "null"}`,
  });

  const { error: planUpdate } = await sessionA
    .from("profiles")
    .update({ plan_slug: "pro_yearly", plan_status: "active" } as never)
    .eq("id", userA.id);
  checks.push({
    id: "live_user_cannot_update_plan",
    layer: "live",
    ok: Boolean(planUpdate),
    detail: planUpdate?.message ?? "update unexpectedly succeeded",
  });

  const { error: staffUpdate } = await sessionA
    .from("profiles")
    .update({ staff_role: "admin" } as never)
    .eq("id", userA.id);
  checks.push({
    id: "live_user_cannot_update_staff_role",
    layer: "live",
    ok: Boolean(staffUpdate),
    detail: staffUpdate?.message ?? "update unexpectedly succeeded",
  });

  for (const table of ["user_favorites", "user_history", "clinical_consents"] as const) {
    const { data } = await sessionA.from(table).select("id").eq("user_id", userB.id);
    checks.push({
      id: `live_a_cannot_read_b_${table}`,
      layer: "live",
      ok: (data ?? []).length === 0,
      detail: `rows=${data?.length ?? 0}`,
    });
  }

  if (admin) {
    const { data: proFn } = await sessionA.rpc("has_active_pro");
    checks.push({
      id: "live_has_active_pro_rpc",
      layer: "live",
      ok: proFn === true || proFn === false,
      detail: `value=${String(proFn)}`,
    });
  }

  await sessionA.auth.signOut();
  await sessionB.auth.signOut();
  return { checks, skipped: false };
}

async function main() {
  loadLocalEnvFiles(ROOT);
  const staticChecks: Check[] = [
    ...checkRedirects(),
    ...checkContentGate(),
    ...checkMediaTraversal(),
    ...checkServiceRoleImports(),
    ...checkSelectStar(),
    ...checkPublicationAuthIgnoresReview(),
    ...checkPublishedCatalogQueries(),
    ...checkEntitlementSource(),
    ...checkSearchLeaks(),
    ...checkPreviewParamRemoved(),
  ];

  const live = await runLiveChecks();
  const checks = [...staticChecks, ...live.checks];
  const staticFailed = staticChecks.filter((c) => !c.ok);
  const liveFailed = live.checks.filter((c) => !c.ok);

  const report = {
    generated_at: new Date().toISOString(),
    static: {
      ok: staticFailed.length === 0,
      checked: staticChecks.length,
      failed: staticFailed,
    },
    live: live.skipped
      ? {
          ran: false,
          skipped: true,
          reason: live.reason,
          note: "Live RLS was not executed. Do not claim database isolation from this run.",
        }
      : {
          ran: true,
          skipped: false,
          ok: liveFailed.length === 0,
          checked: live.checks.length,
          failed: liveFailed,
        },
    checks,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`STATIC ${report.static.ok ? "PASS" : "FAIL"} (${staticChecks.length} checks)`);
  if (live.skipped) {
    console.log(`LIVE SKIPPED: ${live.reason}`);
  } else {
    console.log(`LIVE ${liveFailed.length === 0 ? "PASS" : "FAIL"} (${live.checks.length} checks)`);
  }

  if (!report.static.ok || (!live.skipped && liveFailed.length > 0)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
