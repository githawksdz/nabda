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
    id: "viewport_allows_pinch_zoom",
    ok:
      !layout.includes("userScalable: false") &&
      !layout.includes("maximumScale: 1") &&
      !layout.includes("user-scalable=no"),
    detail: "app/layout.tsx viewport",
  });
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
    ok:
      fallback.includes("hors-ligne") &&
      fallback.includes("data-bottom-nav") &&
      fallback.includes("data-app-header") &&
      sw.includes("/offline-fallback.html"),
    detail: "public/offline-fallback.html includes app chrome",
  });
  checks.push({
    id: "sw_versioned_cache",
    ok: sw.includes("nabda-shell-") && sw.includes('params.get("v")'),
    detail: "cache name tied to registration version",
  });
  checks.push({
    id: "sw_does_not_cache_api",
    ok:
      sw.includes("isApi") &&
      sw.includes("isRsc") &&
      sw.includes("return;") &&
      !/cache\.(add|put).*\/api\/offline/.test(sw),
    detail: "API, RSC, and catalog HTML are not cached",
  });
  checks.push({
    id: "sw_caches_shell_assets_on_visit",
    ok:
      sw.includes("CACHE_SHELL_ASSETS") &&
      provider.includes("CACHE_SHELL_ASSETS") &&
      provider.includes("collectShellAssetUrls"),
    detail: "hashed JS/CSS/fonts captured on first controlled visit",
  });
  checks.push({
    id: "sw_first_install_takes_control",
    ok: sw.includes("if (!self.registration.active)") && sw.includes("skipWaiting"),
    detail: "first install claims the open tab",
  });
  checks.push({
    id: "sw_local_library_html_only",
    ok:
      sw.includes("function isLocalContentPath") &&
      sw.includes("networkFirstLocalDocument") &&
      /async function networkFirstNavigate\(request\) \{\s*try \{\s*return await fetch\(request\);/.test(
        sw,
      ) &&
      sw.includes('url.pathname === "/offline"'),
    detail: "only /offline documents are stored; other routes fall back to chrome",
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
    ok: exists("app/(doctor)/offline/page.tsx") && exists("app/(doctor)/offline/view/[type]/[slug]/page.tsx"),
    detail: "management + local reader",
  });

  const loginForm = read("components/onboarding/LoginForm.tsx");
  const registerForm = read("components/onboarding/RegisterForm.tsx");
  const passwordField = read("components/onboarding/PasswordField.tsx");
  const csp = read("lib/security/csp.ts");
  const proxy = read("proxy.ts");
  const icon192 = read("app/icon-192/route.ts");
  const icon512 = read("app/icon-512/route.ts");
  const beforeRegister = provider.slice(0, provider.indexOf("serviceWorker.register"));

  checks.push({
    id: "static_pwa_icons",
    ok:
      exists("public/icons/icon-192.png") &&
      exists("public/icons/icon-512.png") &&
      exists("public/icons/icon-512-maskable.png") &&
      exists("public/icons/apple-touch-icon.png") &&
      manifest.includes("/icons/icon-192.png") &&
      manifest.includes('purpose: "any"') &&
      manifest.includes('purpose: "maskable"') &&
      icon192.includes("/icons/icon-192.png") &&
      icon512.includes("/icons/icon-512.png"),
    detail: "public/icons + manifest + redirects",
  });
  checks.push({
    id: "apple_touch_icon_and_capable_meta",
    ok:
      layout.includes("/icons/apple-touch-icon.png") &&
      layout.includes("appleWebApp") &&
      layout.includes("capable: true") &&
      layout.includes('"apple-mobile-web-app-capable"') &&
      layout.includes("Hub de publication clinique Nabda"),
    detail: "app/layout.tsx apple icons + both capable tags",
  });
  checks.push({
    id: "apple_startup_images",
    ok:
      exists("public/icons/splash-750x1334.png") &&
      exists("public/icons/splash-1170x2532.png") &&
      exists("public/icons/splash-1284x2778.png") &&
      exists("public/icons/splash-1179x2556.png") &&
      exists("public/icons/splash-1290x2796.png") &&
      layout.includes("startupImage") &&
      layout.includes("/icons/splash-750x1334.png"),
    detail: "startup images + layout media queries",
  });
  checks.push({
    id: "auth_inputs_are_16px",
    ok:
      !loginForm.includes("text-[15px]") &&
      !registerForm.includes("text-[15px]") &&
      !passwordField.includes("text-[15px]") &&
      loginForm.includes("text-base") &&
      registerForm.includes("text-base") &&
      passwordField.includes("text-base") &&
      (passwordField.includes("size-11") || passwordField.includes("min-h-11")),
    detail: "LoginForm/RegisterForm/PasswordField",
  });
  checks.push({
    id: "sw_registers_before_version_await",
    ok:
      provider.includes("serviceWorker.register") &&
      !provider.includes("/api/pwa/version") &&
      !beforeRegister.includes("await fetch") &&
      provider.includes("NEXT_PUBLIC_BUILD_ID"),
    detail: "PwaProvider registers immediately",
  });
  checks.push({
    id: "sw_static_cache_capped",
    ok:
      sw.includes("STATIC_CACHE_MAX_ENTRIES") &&
      sw.includes("trimStaticCache") &&
      /STATIC_CACHE_MAX_ENTRIES = 80/.test(sw),
    detail: "nabda-static-* eviction",
  });
  checks.push({
    id: "offline_banner_listener",
    ok:
      provider.includes('addEventListener("offline"') &&
      provider.includes('addEventListener("online"') &&
      provider.includes("Hors-ligne") &&
      provider.includes("layout-nav-height"),
    detail: "PwaProvider online/offline bar",
  });
  checks.push({
    id: "csp_nonce_in_proxy",
    ok:
      proxy.includes("buildCsp") &&
      proxy.includes("cspHeaderName") &&
      proxy.includes('request.headers.set("Content-Security-Policy"') &&
      csp.includes("default-src 'self'") &&
      csp.includes("'strict-dynamic'") &&
      csp.includes("worker-src 'self'") &&
      csp.includes("frame-ancestors 'none'"),
    detail: "proxy.ts + lib/security/csp.ts",
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
      "Shell chrome and hashed static assets are cached on first controlled visit.",
      "Catalog HTML, RSC, and API responses stay network-only. Downloaded clinical payloads stay in IndexedDB.",
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
