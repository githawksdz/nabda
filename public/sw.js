/* Nabda PWA service worker.
 * Caches the app chrome (shell HTML, hashed JS/CSS/fonts, icons).
 * Never caches API routes, RSC payloads, or catalog HTML.
 * Downloaded clinical payloads live in IndexedDB, not here.
 * Cache name is versioned from the registration URL (?v=).
 */
const params = new URL(self.location.href).searchParams;
const VERSION = params.get("v") || "dev";
const SHELL_CACHE = "nabda-shell-" + VERSION;
const STATIC_CACHE = "nabda-static-" + VERSION;
const PRECACHE = [
  "/offline-fallback.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon.png",
];
const STATIC_CACHE_MAX_ENTRIES = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE);
      if (!self.registration.active) {
        await self.skipWaiting();
      }
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (data.type === "CACHE_SHELL_ASSETS" && Array.isArray(data.urls)) {
    event.waitUntil(cacheShellAssetUrls(data.urls));
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

function isShellIcon(url) {
  return (
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/offline-fallback.html" ||
    url.pathname.startsWith("/icon-") ||
    url.pathname.startsWith("/icons/")
  );
}

async function trimStaticCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= STATIC_CACHE_MAX_ENTRIES) return;
  const extra = keys.length - STATIC_CACHE_MAX_ENTRIES;
  for (let i = 0; i < extra; i++) {
    await cache.delete(keys[i]);
  }
}

function isLocalContentPath(url) {
  return url.pathname === "/offline" || url.pathname.startsWith("/offline/view/");
}

function isContentMedia(url) {
  return url.pathname.startsWith("/content-media");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isApi(url) || isRsc(url) || isContentMedia(url)) return;

  if (isHashedStatic(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (isShellIcon(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (isLocalContentPath(url)) {
    event.respondWith(networkFirstLocalDocument(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
  }
});

async function cacheShellAssetUrls(urls) {
  const staticCache = await caches.open(STATIC_CACHE);
  const shellCache = await caches.open(SHELL_CACHE);
  await Promise.all(
    urls.map(async (href) => {
      try {
        const url = new URL(href, self.location.origin);
        if (url.origin !== self.location.origin) return;
        if (isApi(url) || isRsc(url) || isContentMedia(url)) return;
        const request = new Request(url.href, { credentials: "same-origin" });
        const cache = isHashedStatic(url) ? staticCache : isShellIcon(url) ? shellCache : null;
        if (!cache) return;
        const cached = await cache.match(request);
        if (cached) return;
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
          if (cache === staticCache) {
            await trimStaticCache(cache);
          }
        }
      } catch {
        /* first-visit capture is best-effort */
      }
    }),
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    if (cacheName === STATIC_CACHE) {
      await trimStaticCache(cache);
    }
  }
  return response;
}

async function networkFirstLocalDocument(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && isHtml(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return shellFallback(cache);
  }
}

async function networkFirstNavigate(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    return shellFallback(cache);
  }
}

function isHtml(response) {
  const type = response.headers.get("content-type") || "";
  return type.includes("text/html");
}

async function shellFallback(cache) {
  const fallback = await cache.match("/offline-fallback.html");
  return (
    fallback ||
    new Response("Hors-ligne", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}
