const { chromium } = require("playwright");

const BASE = process.env.R1_BASE_URL || "http://127.0.0.1:3000";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "allow",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("pageerror", (err) => consoleErrors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 });

  const meta = await page.evaluate(() => {
    const get = (sel) => document.querySelector(sel)?.getAttribute("content") || null;
    const href = (sel) => document.querySelector(sel)?.getAttribute("href") || null;
    return {
      lang: document.documentElement.lang,
      viewport: get('meta[name="viewport"]'),
      themeColor: get('meta[name="theme-color"]'),
      description: get('meta[name="description"]'),
      appleCapable: get('meta[name="apple-mobile-web-app-capable"]'),
      mobileCapable: get('meta[name="mobile-web-app-capable"]'),
      appleTitle: get('meta[name="apple-mobile-web-app-title"]'),
      appleStatus: get('meta[name="apple-mobile-web-app-status-bar-style"]'),
      manifest: href('link[rel="manifest"]'),
      appleTouchIcon: href('link[rel="apple-touch-icon"]'),
      favicon: href('link[rel="icon"]'),
      startupImages: document.querySelectorAll('link[rel="apple-touch-startup-image"]').length,
    };
  });

  await page.waitForTimeout(2500);

  const sw = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return { supported: false };
    const regs = await navigator.serviceWorker.getRegistrations();
    const active = regs[0];
    return {
      supported: true,
      count: regs.length,
      scope: active?.scope || null,
      active: active?.active?.state || null,
      waiting: active?.waiting?.state || null,
      installing: active?.installing?.state || null,
      scriptURL: active?.active?.scriptURL || active?.installing?.scriptURL || null,
      controller: Boolean(navigator.serviceWorker.controller),
    };
  });

  const manifest = await page.evaluate(async () => {
    const href = document.querySelector('link[rel="manifest"]')?.getAttribute("href");
    if (!href) return null;
    const res = await fetch(href);
    return { status: res.status, type: res.headers.get("content-type"), body: await res.json() };
  });

  const offlineHtml = await page.evaluate(async () => {
    const res = await fetch("/offline-fallback.html");
    return { status: res.status, ok: res.ok, len: (await res.text()).length };
  });

  const displayMode = await page.evaluate(() =>
    window.matchMedia("(display-mode: standalone)").matches,
  );

  console.log(
    JSON.stringify(
      {
        url: page.url(),
        meta,
        sw,
        manifest,
        offlineHtml,
        displayMode,
        consoleErrors: consoleErrors.slice(0, 12),
      },
      null,
      2,
    ),
  );

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
