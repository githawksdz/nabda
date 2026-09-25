/**
 * Phase 1 PWA / offline verification.
 * Static + in-process tests. Does not require a live browser install.
 *
 * Usage: npx tsx scripts/verify-pwa.ts
 */
import fs from "node:fs";
import path from "node:path";
import { ANONYMOUS_VIEWER, type ViewerAccess } from "@/lib/authz/content-gate";
import { decideDownload, decidePackDownload } from "@/lib/offline/download-rules";
import { checksumPayload, verifyChecksum } from "@/lib/offline/checksum";
import { decryptJson, encryptJson, generateContentKey } from "@/lib/offline/crypto";
import { interpretGlasgow } from "@/lib/calculators/glasgow";
import { computeCockcroft, COCKCROFT_EMPTY_VALUES } from "@/lib/calculators/cockcroft-gault";
import { GLASGOW_DEFAULT_SELECTION } from "@/lib/calculators/glasgow";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "pwa-report.json");

type Check = { id: string; ok: boolean; detail: string };

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

async function main() {
  const checks: Check[] = [];
  const sw = read("public/sw.js");
  const manifest = read("app/manifest.ts");
  const fallback = read("public/offline-fallback.html");
  const provider = read("components/pwa/PwaProvider.tsx");
  const packRoute = read("app/api/offline/pack/route.ts");
  const itemRoute = read("app/api/offline/item/route.ts");
  const manifestRoute = read("app/api/offline/manifest/route.ts");
  const formula = read("components/calculators/GeneratedFormulaCalculator.tsx");
  const registry = read("lib/calculators/engine-registry.ts");
  const repo = read("lib/offline/repository.ts");
  const cryptoSrc = read("lib/offline/crypto.ts");
  const migration = read("supabase/migrations/0022_offline_packs.sql");
  const signOut = read("features/auth/api.ts");
  const layout = read("app/layout.tsx");

  checks.push({
    id: "manifest_exists",
    ok: manifest.includes('name: "Nabda"') && manifest.includes('display: "standalone"'),
    detail: "app/manifest.ts",
  });
  checks.push({
    id: "service_worker_registers",
    ok: provider.includes("serviceWorker.register") && layout.includes("PwaProvider"),
    detail: "PwaProvider + root layout",
  });
  checks.push({
    id: "offline_fallback_exists",
    ok: fallback.includes("hors-ligne") && sw.includes("/offline-fallback.html"),
    detail: "public/offline-fallback.html",
  });
  checks.push({
    id: "sw_versioned_cache",
    ok: sw.includes("nabda-shell-") && sw.includes('params.get("v")'),
    detail: "cache name tied to registration version",
  });
  checks.push({
    id: "sw_does_not_cache_api",
    ok: sw.includes("isApi") && sw.includes("return;") && !/cache\.(add|put).*\/api\/offline/.test(sw),
    detail: "API and RSC requests are not cached",
  });
  checks.push({
    id: "sw_safe_update_flow",
    ok:
      sw.includes('data.type === "SKIP_WAITING"') &&
      provider.includes("SKIP_WAITING") &&
      sw.includes("caches.delete"),
    detail: "waiting worker until user confirms; old cache deleted on activate",
  });
  checks.push({
    id: "sw_static_only_precache",
    ok: /PRECACHE = \[/.test(sw) && !sw.includes("/api/offline"),
    detail: "precache is a short allowlist",
  });

  const freeViewer: ViewerAccess = {
    userId: "u1",
    authenticated: true,
    hasActivePro: false,
    staffRole: "none",
  };
  const proViewer: ViewerAccess = { ...freeViewer, hasActivePro: true };
  const expired: ViewerAccess = { ...freeViewer, hasActivePro: false };
  const publishedFree = {
    status: "published",
    visibility: "public_free",
    offlineAvailable: true,
    slug: "asthme",
  };
  const premium = { ...publishedFree, visibility: "premium" };
  const draft = { ...publishedFree, status: "draft" };
  const notOffline = { ...publishedFree, offlineAvailable: false };

  checks.push({
    id: "draft_cannot_download",
    ok: decideDownload(draft, proViewer).ok === false,
    detail: decideDownload(draft, proViewer).ok ? "unexpected" : "blocked",
  });
  checks.push({
    id: "published_free_can_download",
    ok: decideDownload(publishedFree, freeViewer).ok === true,
    detail: "authenticated free user",
  });
  checks.push({
    id: "anon_cannot_download",
    ok: decideDownload(publishedFree, ANONYMOUS_VIEWER).ok === false,
    detail: "session required",
  });
  checks.push({
    id: "premium_requires_pro",
    ok: decideDownload(premium, freeViewer).ok === false,
    detail: "free user blocked",
  });
  checks.push({
    id: "premium_pro_allowed",
    ok: decideDownload(premium, proViewer).ok === true,
    detail: "active Pro",
  });
  checks.push({
    id: "expired_pro_cannot_download_premium",
    ok: decideDownload(premium, expired).ok === false,
    detail: "hasActivePro false",
  });
  checks.push({
    id: "unavailable_offline_blocked",
    ok: decideDownload(notOffline, proViewer).ok === false,
    detail: "offline_available=false",
  });
  checks.push({
    id: "individual_item_downloadable",
    ok: decideDownload(publishedFree, freeViewer).ok,
    detail: "one item",
  });
  checks.push({
    id: "pack_only_explicit_items",
    ok:
      decidePackDownload(
        { status: "published", visibility: "public_free" },
        [publishedFree],
        freeViewer,
      ).ok === true,
    detail: "explicit membership",
  });
  checks.push({
    id: "empty_pack_blocked",
    ok:
      decidePackDownload({ status: "published", visibility: "public_free" }, [], freeViewer).ok ===
      false,
    detail: "no implicit corpus",
  });

  const payload = { slug: "x", title: "Asthme", body: "contenu" };
  const checksum = await checksumPayload(payload);
  checks.push({
    id: "checksum_roundtrip",
    ok: await verifyChecksum(payload, checksum),
    detail: checksum.slice(0, 12),
  });
  checks.push({
    id: "checksum_detects_tamper",
    ok: !(await verifyChecksum({ ...payload, body: "mutated" }, checksum)),
    detail: "integrity",
  });

  const key = await generateContentKey();
  const blob = await encryptJson(key, payload);
  const roundtrip = await decryptJson<typeof payload>(key, blob);
  checks.push({
    id: "aes_gcm_roundtrip",
    ok: roundtrip.title === payload.title && blob.alg === "AES-GCM",
    detail: "Web Crypto AES-GCM",
  });
  let integrityFailed = false;
  try {
    await decryptJson(key, { ...blob, ciphertext: blob.ciphertext.slice(0, 8) });
  } catch {
    integrityFailed = true;
  }
  checks.push({
    id: "corrupted_payload_fails",
    ok: integrityFailed,
    detail: "GCM auth tag",
  });

  checks.push({
    id: "indexeddb_not_localstorage_for_content",
    ok:
      /indexeddb/i.test(repo) &&
      repo.includes("content_items") &&
      !repo.includes("localStorage") &&
      read("lib/offline/idb.ts").includes("indexedDB.open"),
    detail: "lib/offline/repository.ts",
  });
  checks.push({
    id: "logout_clears_private_data",
    ok: signOut.includes("clearOfflinePrivateData") && repo.includes("idbClearAll"),
    detail: "signOut wipes encrypted stores",
  });
  checks.push({
    id: "no_hardcoded_encryption_key",
    ok: !/AES.?KEY|encryptionKey\s*=\s*["']/.test(cryptoSrc) && cryptoSrc.includes("generateKey"),
    detail: "per-device CryptoKey",
  });
  checks.push({
    id: "no_n_plus_one_pack_endpoint",
    ok: packRoute.includes("buildPackDownload") && packRoute.includes("searchParams.get(\"slug\")"),
    detail: "one pack HTTP request",
  });
  checks.push({
    id: "manifest_conditional_request",
    ok: manifestRoute.includes("ETag") && manifestRoute.includes("ifNoneMatch"),
    detail: "If-None-Match",
  });
  checks.push({
    id: "item_route_uses_narrow_dto",
    ok: itemRoute.includes("buildOfflineItem") && !itemRoute.includes('select("*")'),
    detail: "no select star",
  });
  checks.push({
    id: "migration_offline_available_default_false",
    ok:
      migration.includes("offline_available boolean not null default false") &&
      migration.includes("content_packs") &&
      !migration.includes("review_status"),
    detail: "0022",
  });
  checks.push({
    id: "calculator_lazy_engine",
    ok: registry.includes("import(") && registry.includes("engineCache"),
    detail: "dynamic import + memory cache",
  });
  checks.push({
    id: "calculator_compute_is_local",
    ok:
      formula.includes("engine.calculate") &&
      !formula.includes("fetch(") &&
      formula.includes("measureSync"),
    detail: "no fetch during input changes",
  });

  const t0 = performance.now();
  interpretGlasgow(GLASGOW_DEFAULT_SELECTION);
  const glasgowMs = performance.now() - t0;
  const t1 = performance.now();
  computeCockcroft({
    ...COCKCROFT_EMPTY_VALUES,
    sex: "male",
    age: "40",
    weight: "70",
    creatinine: "80",
  });
  const cockcroftMs = performance.now() - t1;
  checks.push({
    id: "calculator_compute_under_50ms",
    ok: glasgowMs < 50 && cockcroftMs < 50,
    detail: `glasgow=${glasgowMs.toFixed(2)}ms cockcroft=${cockcroftMs.toFixed(2)}ms`,
  });

  const detailPage = read("components/calculators/CalculatorDetailPage.tsx");
  const glasgowUi = read("components/calculators/glasgow/GlasgowCalculator.tsx");
  const cockcroftUi = read("components/calculators/cockcroft/CockcroftCalculator.tsx");
  const searchPage = read("components/search/SearchPage.tsx");

  checks.push({
    id: "calculator_page_lazy_engines",
    ok:
      detailPage.includes("next/dynamic") &&
      !detailPage.includes('from "@/lib/calculators/glasgow"') &&
      !detailPage.includes('from "@/lib/calculators/cockcroft-gault"') &&
      !detailPage.includes('from "./glasgow/GlasgowCalculator"'),
    detail: "CalculatorDetailPage dynamic-imports engines",
  });
  checks.push({
    id: "calculator_compute_instrumented",
    ok:
      glasgowUi.includes("measureSync") &&
      cockcroftUi.includes("measureSync") &&
      formula.includes("measureSync"),
    detail: "calculator_compute_ms",
  });
  checks.push({
    id: "interrupted_pack_can_restart",
    ok: repo.includes("download_interrupted") && repo.includes("for (const item of pack.items)"),
    detail: "persist loop checks abort flag",
  });
  checks.push({
    id: "repeated_open_uses_local",
    ok: repo.includes("getLocalPayload") && /if \(local\) return local/.test(repo),
    detail: "getContent reads IndexedDB first",
  });
  checks.push({
    id: "offline_does_not_retry_downloads",
    ok:
      repo.includes('throw new Error("offline")') &&
      searchPage.includes("!navigator.onLine"),
    detail: "no download fetch while offline",
  });
  checks.push({
    id: "manifest_etag_persisted",
    ok: repo.includes("manifestEtag") && repo.includes("If-None-Match"),
    detail: "conditional manifest requests",
  });
  checks.push({
    id: "stale_version_marked",
    ok: repo.includes("markStaleFromManifest"),
    detail: "local version vs manifest",
  });
  checks.push({
    id: "pack_items_store_used",
    ok: repo.includes('idbPut("pack_items"'),
    detail: "explicit pack membership locally",
  });
  checks.push({
    id: "shell_precache_before_activate",
    ok: sw.includes("cache.addAll(PRECACHE)") && sw.includes("caches.delete"),
    detail: "old cache removed only after new shell is cached",
  });

  const clientFiles = [
    ...walk(path.join(ROOT, "lib", "offline")),
    ...walk(path.join(ROOT, "components", "offline")),
    ...walk(path.join(ROOT, "components", "pwa")),
    path.join(ROOT, "public", "sw.js"),
  ];
  const secretHits = clientFiles.filter((file) => {
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return false;
    const text = fs.readFileSync(file, "utf8");
    return /SERVICE_ROLE|serviceRoleKey/.test(text);
  });
  checks.push({
    id: "no_service_role_in_offline_client",
    ok: secretHits.length === 0,
    detail: secretHits.length ? secretHits.join(",") : "clean",
  });
  checks.push({
    id: "no_eval_in_offline_or_calculators",
    ok: !formula.includes("eval(") && !registry.includes("new Function"),
    detail: "typed engines",
  });
  checks.push({
    id: "offline_pages_exist",
    ok: exists("app/offline/page.tsx") && exists("app/offline/view/[type]/[slug]/page.tsx"),
    detail: "management + local reader",
  });

  const failed = checks.filter((check) => !check.ok);
  const report = {
    generated_at: new Date().toISOString(),
    ok: failed.length === 0,
    checked: checks.length,
    failed,
    calculator_ms: { glasgowMs, cockcroftMs },
    checks,
    notes: [
      "Browser installation and a fully offline shell were not exercised in this process.",
      "Live entitlement still requires configured test users and applied migration 0022.",
    ],
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`PWA ${report.ok ? "PASS" : "FAIL"} (${checks.length} checks)`);
  if (!report.ok) {
    for (const check of failed) {
      console.error(`- ${check.id}: ${check.detail}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
