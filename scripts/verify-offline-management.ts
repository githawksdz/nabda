/**
 * Phase 2 staff offline-management verification.
 * Static always. Live RLS only when schema + test users exist.
 *
 * Usage: npx tsx scripts/verify-offline-management.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";
import { getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { validatePackItem, validatePackPublish } from "@/lib/offline/staff-rules";
import { decideDownload, decidePackDownload } from "@/lib/offline/download-rules";
import { ANONYMOUS_VIEWER, type ViewerAccess } from "@/lib/authz/content-gate";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "offline-management-report.json");

type Check = { id: string; layer?: "static" | "live"; ok: boolean; detail: string };

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel: string) {
  return fs.existsSync(path.join(ROOT, rel));
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "nabda_db", "data"].includes(entry.name)) continue;
      walk(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function rel(file: string) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function staticChecks(): Check[] {
  const checks: Check[] = [];
  const page = read("app/internal/offline-packs/page.tsx");
  const actions = read("lib/offline/staff-actions.ts");
  const catalog = read("lib/offline/staff-catalog.ts");
  const migration = read("supabase/migrations/0023_staff_offline_management.sql");
  const migration22 = read("supabase/migrations/0022_offline_packs.sql");
  const gate = read("lib/internal/preview-gate.ts");
  const downloadRules = read("lib/offline/download-rules.ts");

  checks.push({
    id: "staff_route_exists",
    ok: exists("app/internal/offline-packs/page.tsx"),
    detail: "/internal/offline-packs",
  });
  checks.push({
    id: "staff_route_requires_editor",
    ok: page.includes('requireRole("editor")') && catalog.includes("requireRole"),
    detail: "editor or admin via requireRole",
  });
  checks.push({
    id: "staff_route_not_query_param",
    ok:
      !page.includes('preview=internal') &&
      !page.includes('previewParam') &&
      !gate.includes('previewParam === "internal"'),
    detail: "no query-param authorization",
  });
  checks.push({
    id: "staff_mutations_server_side",
    ok: actions.includes('"use server"') && catalog.includes("staff_set_offline_available"),
    detail: "server actions + SECURITY DEFINER RPCs",
  });
  checks.push({
    id: "no_admin_client_on_staff_path",
    ok:
      !catalog.includes("createAdminClient") &&
      !actions.includes("createAdminClient") &&
      !page.includes("createAdminClient"),
    detail: "RLS client only",
  });

  const publicHits = [
    ...walk(path.join(ROOT, "app", "api", "offline")),
    ...walk(path.join(ROOT, "app", "offline")),
    ...walk(path.join(ROOT, "components", "offline")),
    ...walk(path.join(ROOT, "components", "pwa")),
  ].filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return (
      text.includes("createAdminClient") ||
      text.includes("staff-actions") ||
      text.includes("staff-catalog")
    );
  });
  checks.push({
    id: "public_routes_do_not_import_staff_mutations",
    ok: publicHits.length === 0,
    detail: publicHits.map(rel).join(",") || "clean",
  });

  const starHits = [
    ...walk(path.join(ROOT, "lib", "offline")),
    ...walk(path.join(ROOT, "app", "internal", "offline-packs")),
  ].filter((file) => /\.select\(\s*"\*"\s*\)/.test(fs.readFileSync(file, "utf8")));
  checks.push({
    id: "staff_no_select_star",
    ok: starHits.length === 0,
    detail: starHits.map(rel).join(",") || "explicit columns",
  });

  checks.push({
    id: "no_medical_review_in_0023",
    ok: !migration.includes("review_status") && !migration.includes("clinical_payload"),
    detail: "publishing hub only",
  });
  checks.push({
    id: "0022_writes_revoked_from_users",
    ok:
      migration22.includes("revoke insert, update, delete on public.content_packs") &&
      migration22.includes("revoke insert, update, delete on public.content_pack_items"),
    detail: "no broad public writes",
  });
  checks.push({
    id: "0023_rpc_not_granted_to_anon",
    ok:
      migration.includes("grant execute on function public.staff_set_offline_available") &&
      migration.includes("from public, anon") &&
      !/grant execute on function public\.staff_set_offline_available[^;]*to anon/.test(
        migration.replace(/\s+/g, " "),
      ),
    detail: "authenticated + has_staff_editor",
  });

  const publishedFree = {
    status: "published",
    visibility: "public_free",
    offlineAvailable: true,
    slug: "asthme",
    contentType: "protocol" as const,
  };
  const premium = { ...publishedFree, visibility: "premium", slug: "premium-cat" };
  const draft = { ...publishedFree, status: "draft" };
  const notOffline = { ...publishedFree, offlineAvailable: false };

  checks.push({
    id: "rule_draft_cannot_enter_pack",
    ok: validatePackItem({ visibility: "public_free" }, draft).ok === false,
    detail: "draft blocked",
  });
  checks.push({
    id: "rule_offline_false_cannot_enter_pack",
    ok: validatePackItem({ visibility: "public_free" }, notOffline).ok === false,
    detail: "offline_available=false blocked",
  });
  checks.push({
    id: "rule_premium_cannot_enter_free_pack",
    ok: validatePackItem({ visibility: "public_free" }, premium).ok === false,
    detail: "premium_in_free_pack",
  });
  checks.push({
    id: "rule_premium_pack_can_contain_free_and_premium",
    ok:
      validatePackPublish({ visibility: "premium" }, [publishedFree, premium]).ok === true,
    detail: "mixed membership allowed on premium packs",
  });
  checks.push({
    id: "rule_empty_pack_cannot_publish",
    ok: validatePackPublish({ visibility: "public_free" }, []).ok === false,
    detail: "empty_pack",
  });
  checks.push({
    id: "rule_published_free_can_enter_free_pack",
    ok: validatePackItem({ visibility: "public_free" }, publishedFree).ok === true,
    detail: "eligible",
  });

  const freeViewer: ViewerAccess = {
    userId: "a",
    authenticated: true,
    hasActivePro: false,
    staffRole: "none",
  };
  const proViewer: ViewerAccess = { ...freeViewer, userId: "b", hasActivePro: true };
  checks.push({
    id: "public_download_draft_still_blocked",
    ok: decideDownload(draft, proViewer).ok === false,
    detail: "drafts never downloadable",
  });
  checks.push({
    id: "public_download_premium_requires_pro",
    ok:
      decideDownload(premium, freeViewer).ok === false &&
      decideDownload(premium, proViewer).ok === true,
    detail: "entitlement unchanged",
  });
  checks.push({
    id: "public_pack_premium_requires_pro",
    ok:
      decidePackDownload({ status: "published", visibility: "premium" }, [premium], freeViewer)
        .ok === false &&
      decidePackDownload({ status: "published", visibility: "premium" }, [premium], proViewer)
        .ok === true,
    detail: "premium pack gated",
  });
  checks.push({
    id: "public_unpublished_pack_blocked",
    ok:
      decidePackDownload({ status: "draft", visibility: "public_free" }, [publishedFree], proViewer)
        .ok === false,
    detail: "unpublished packs hidden",
  });
  checks.push({
    id: "anon_cannot_download",
    ok: decideDownload(publishedFree, ANONYMOUS_VIEWER).ok === false,
    detail: "session required",
  });
  checks.push({
    id: "download_rules_block_premium_in_free_pack",
    ok: downloadRules.includes("premium_in_free_pack"),
    detail: "public download fail-closed",
  });
  checks.push({
    id: "no_service_role_secret_in_staff_ui",
    ok:
      !catalog.includes("SERVICE_ROLE") &&
      !actions.includes("SERVICE_ROLE") &&
      !page.includes("SERVICE_ROLE"),
    detail: "clean",
  });

  return checks;
}

async function liveChecks(): Promise<{ checks: Check[]; skipped: boolean; reason?: string }> {
  const { url, serviceRoleKey, anonKey } = getImportSupabaseEnv();
  if (!url || !anonKey) {
    return { checks: [], skipped: true, reason: "missing NEXT_PUBLIC_SUPABASE_URL or anon key" };
  }

  const anonProbe = createClient(url, anonKey, { auth: { persistSession: false } });
  const admin = serviceRoleKey
    ? createClient(url, serviceRoleKey, { auth: { persistSession: false } })
    : anonProbe;
  const { error: schemaError } = await admin.from("content_packs").select("id").limit(1);
  const { error: columnError } = await admin.from("protocols").select("offline_available").limit(1);
  const { error: rpcError } = await admin.rpc("has_staff_editor");
  if (schemaError || columnError) {
    return {
      checks: [],
      skipped: true,
      reason: `migrations 0022/0023 not applied (${(schemaError ?? columnError)?.message})`,
    };
  }
  if (rpcError && /schema cache|does not exist|Could not find the function/i.test(rpcError.message)) {
    return {
      checks: [],
      skipped: true,
      reason: `migration 0023 not applied (${rpcError.message})`,
    };
  }

  const emailA = process.env.NABDA_TEST_USER_A_EMAIL;
  const passwordA = process.env.NABDA_TEST_USER_A_PASSWORD;
  const emailB = process.env.NABDA_TEST_USER_B_EMAIL;
  const passwordB = process.env.NABDA_TEST_USER_B_PASSWORD;
  const emailStaff = process.env.NABDA_TEST_STAFF_EMAIL;
  const passwordStaff = process.env.NABDA_TEST_STAFF_PASSWORD;
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
  const { data: anonPacks } = await anon.from("content_packs").select("slug, status").eq("status", "draft");
  checks.push({
    id: "live_anon_cannot_read_unpublished_packs",
    layer: "live",
    ok: (anonPacks ?? []).length === 0,
    detail: `rows=${anonPacks?.length ?? 0}`,
  });
  const { error: anonWrite } = await anon.from("content_packs").insert({
    slug: "intrusion-pack",
    title: "intrusion",
  } as never);
  checks.push({
    id: "live_anon_cannot_create_pack",
    layer: "live",
    ok: Boolean(anonWrite),
    detail: anonWrite?.message ?? "insert unexpectedly succeeded",
  });
  const { error: anonRpc } = await anon.rpc("staff_set_offline_available", {
    p_content_type: "protocol",
    p_content_slug: "intrusion",
    p_available: true,
  });
  checks.push({
    id: "live_anon_cannot_call_staff_rpc",
    layer: "live",
    ok: Boolean(anonRpc),
    detail: anonRpc?.message ?? "rpc unexpectedly succeeded",
  });

  const sessionA = createClient(url, anonKey, { auth: { persistSession: false } });
  const sessionB = createClient(url, anonKey, { auth: { persistSession: false } });
  const signA = await sessionA.auth.signInWithPassword({ email: emailA, password: passwordA });
  const signB = await sessionB.auth.signInWithPassword({ email: emailB, password: passwordB });
  checks.push({
    id: "live_user_a_session",
    layer: "live",
    ok: Boolean(signA.data.user) && !signA.error,
    detail: signA.error?.message ?? "ok",
  });
  checks.push({
    id: "live_user_b_session",
    layer: "live",
    ok: Boolean(signB.data.user) && !signB.error,
    detail: signB.error?.message ?? "ok",
  });
  const userA = signA.data.user;
  const userB = signB.data.user;
  if (userA && userB) {
    const { data: bProfile } = await sessionA.from("profiles").select("id").eq("id", userB.id);
    checks.push({
      id: "live_a_cannot_read_b_profile",
      layer: "live",
      ok: (bProfile ?? []).length === 0,
      detail: `rows=${bProfile?.length ?? 0}`,
    });
    const { error: staffUpdate } = await sessionA
      .from("profiles")
      .update({ staff_role: "admin" } as never)
      .eq("id", userA.id);
    checks.push({
      id: "live_a_cannot_change_staff_role",
      layer: "live",
      ok: Boolean(staffUpdate),
      detail: staffUpdate?.message ?? "update unexpectedly succeeded",
    });
    const { error: planUpdate } = await sessionA
      .from("profiles")
      .update({ plan_slug: "pro_yearly" } as never)
      .eq("id", userA.id);
    checks.push({
      id: "live_a_cannot_change_plan",
      layer: "live",
      ok: Boolean(planUpdate),
      detail: planUpdate?.message ?? "update unexpectedly succeeded",
    });
    for (const table of ["user_favorites", "user_history"] as const) {
      const { data } = await sessionA.from(table).select("id").eq("user_id", userB.id);
      checks.push({
        id: `live_a_cannot_read_b_${table}`,
        layer: "live",
        ok: (data ?? []).length === 0,
        detail: `rows=${data?.length ?? 0}`,
      });
    }
    const { error: freeRpc } = await sessionA.rpc("staff_upsert_content_pack", {
      p_id: null,
      p_slug: "intrusion-free",
      p_title: "intrusion",
      p_description: null,
      p_visibility: "public_free",
      p_version: 1,
    });
    checks.push({
      id: "live_free_user_cannot_manage_packs",
      layer: "live",
      ok: Boolean(freeRpc),
      detail: freeRpc?.message ?? "rpc unexpectedly succeeded",
    });
    const { data: aDraftPacks } = await sessionA
      .from("content_packs")
      .select("slug")
      .eq("status", "draft");
    checks.push({
      id: "live_free_user_cannot_see_unpublished_packs",
      layer: "live",
      ok: (aDraftPacks ?? []).length === 0,
      detail: `rows=${aDraftPacks?.length ?? 0}`,
    });
  }

  if (emailStaff && passwordStaff) {
    const staff = createClient(url, anonKey, { auth: { persistSession: false } });
    const signStaff = await staff.auth.signInWithPassword({
      email: emailStaff,
      password: passwordStaff,
    });
    checks.push({
      id: "live_staff_session",
      layer: "live",
      ok: Boolean(signStaff.data.user) && !signStaff.error,
      detail: signStaff.error?.message ?? "ok",
    });
    if (signStaff.data.user) {
      const { data: editor } = await staff.rpc("has_staff_editor");
      checks.push({
        id: "live_staff_has_editor",
        layer: "live",
        ok: editor === true,
        detail: `has_staff_editor=${String(editor)}`,
      });
      await staff.auth.signOut();
    }
  } else {
    checks.push({
      id: "live_staff_credentials_optional",
      layer: "live",
      ok: true,
      detail: "NABDA_TEST_STAFF_EMAIL/PASSWORD not configured; staff matrix skipped",
    });
  }

  await sessionA.auth.signOut();
  await sessionB.auth.signOut();
  return { checks, skipped: false };
}

async function main() {
  loadLocalEnvFiles(ROOT);
  const staticResult = staticChecks();
  const live = await liveChecks();
  const checks = [...staticResult, ...live.checks];
  const staticFailed = staticResult.filter((check) => !check.ok);
  const liveFailed = live.checks.filter((check) => !check.ok);
  const report = {
    generated_at: new Date().toISOString(),
    static: { ok: staticFailed.length === 0, checked: staticResult.length, failed: staticFailed },
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
  console.log(`STATIC ${report.static.ok ? "PASS" : "FAIL"} (${staticResult.length} checks)`);
  if (live.skipped) {
    console.log(`LIVE VERIFICATION SKIPPED — ${live.reason}`);
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
