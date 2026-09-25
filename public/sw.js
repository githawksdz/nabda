/* Nabda PWA service worker.
 * Caches only the controlled static shell. Never caches API routes or RSC payloads.
 * Cache name is versioned from the registration URL (?v=).
 */
const params = new URL(self.location.href).searchParams;
const VERSION = params.get("v") || "dev";
const SHELL_CACHE = "nabda-shell-" + VERSION;
const STATIC_CACHE = "nabda-static-" + VERSION;
const PRECACHE = ["/offline-fallback.html", "/manifest.webmanifest", "/icon-192", "/icon-512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE);
      // New shell is fully cached before this worker can take over.
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => {
            if (key === SHELL_CACHE || key === STATIC_CACHE) return false;
            return key.startsWith("nabda-shell-") || key.startsWith("nabda-static-");
          })
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isRsc(url) {
  return url.searchParams.has("_rsc");
}

function isApi(url) {
  return url.pathname.startsWith("/api/");
}

function isHashedStatic(url) {
  return url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApi(url) || isRsc(url)) return;

  if (isHashedStatic(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const fallback = await cache.match("/offline-fallback.html");
    return fallback || new Response("Hors-ligne", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}
