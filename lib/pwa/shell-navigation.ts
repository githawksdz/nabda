"use client";

import { useEffect } from "react";

/** Hub + local reader. HTML chrome may be cached; payloads stay in IndexedDB. */
export function isLocalContentPath(pathname: string) {
  return pathname === "/offline" || pathname.startsWith("/offline/view/");
}

export function collectShellAssetUrls(origin = window.location.origin) {
  const urls = new Set<string>();

  document.querySelectorAll("script[src]").forEach((node) => {
    const src = node.getAttribute("src");
    if (src) urls.add(src);
  });
  document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]').forEach((node) => {
    const href = node.getAttribute("href");
    if (href) urls.add(href);
  });

  return [...urls]
    .map((value) => {
      try {
        return new URL(value, origin);
      } catch {
        return null;
      }
    })
    .filter((url): url is URL => url !== null && url.origin === origin)
    .filter((url) => {
      const path = url.pathname;
      return (
        path.startsWith("/_next/static/") ||
        path === "/manifest.webmanifest" ||
        path.startsWith("/icon-") ||
        path.startsWith("/icons/") ||
        path === "/favicon.ico"
      );
    })
    .map((url) => url.href);
}

export function useOfflineDocumentNavigation() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (navigator.onLine) return;
      const target = event.target;
      const candidate =
        target instanceof Element ? target.closest("a[href]") : null;
      if (!(candidate instanceof HTMLAnchorElement)) return;
      const anchor = candidate;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
        return;
      }
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(url.href);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
