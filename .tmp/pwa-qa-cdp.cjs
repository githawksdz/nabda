/**
 * PWA checklist live probe using installed Edge + CDP.
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const EDGE =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.env.R1_BASE_URL || "http://127.0.0.1:3000";
const PORT = 9224;
const OUT = path.join(process.cwd(), ".tmp", "pwa-qa");
const USER_DATA = path.join(OUT, "edge-profile");

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`${url} ${data}`));
          }
        });
      })
      .on("error", reject);
  });
}

class Cdp {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      const wait = this.pending.get(msg.id);
      if (wait) {
        this.pending.delete(msg.id);
        if (msg.error) wait.reject(new Error(JSON.stringify(msg.error)));
        else wait.resolve(msg.result);
      }
    });
  }

  ready() {
    if (this.ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => resolve());
      this.ws.addEventListener("error", reject);
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "eval failed");
    }
    return result.result?.value;
  }

  close() {
    this.ws.close();
  }
}

async function waitForTargets() {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const list = await getJson(`http://127.0.0.1:${PORT}/json/list`);
      const page = list.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Edge still starting
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Edge CDP target not found");
}

(async () => {
  fs.mkdirSync(USER_DATA, { recursive: true });
  const child = spawn(
    EDGE,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${USER_DATA}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--headless=new",
      "--disable-gpu",
      `${BASE}/`,
    ],
    { stdio: "ignore", detached: true, windowsHide: true },
  );
  child.unref();

  try {
    const target = await waitForTargets();
    const cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    const logs = [];
    cdp.ws.addEventListener("message", (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.method === "Runtime.consoleAPICalled") {
        logs.push({
          type: msg.params?.type,
          text: (msg.params?.args || []).map((a) => a.value ?? a.description).join(" "),
        });
      }
      if (msg.method === "Runtime.exceptionThrown") {
        logs.push({
          type: "exception",
          text: msg.params?.exceptionDetails?.text || "exception",
        });
      }
    });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.send("Page.navigate", { url: `${BASE}/` });
    await cdp.eval(`new Promise((resolve) => {
      if (document.readyState === "complete") resolve(true);
      else window.addEventListener("load", () => resolve(true), { once: true });
    })`);
    await new Promise((r) => setTimeout(r, 10000));

    const probe = await cdp.eval(`(async () => {
      const get = (sel) => document.querySelector(sel)?.getAttribute("content") || null;
      const href = (sel) => document.querySelector(sel)?.getAttribute("href") || null;
      const regs = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistrations() : [];
      const active = regs[0];
      let manifest = null;
      const manifestHref = href('link[rel="manifest"]');
      if (manifestHref) {
        const res = await fetch(manifestHref);
        manifest = { status: res.status, type: res.headers.get("content-type"), body: await res.json() };
      }
      const fallback = await fetch("/offline-fallback.html");
      const icon192 = await fetch("/icon-192");
      const icon512 = await fetch("/icon-512");
      const apple = { skipped: true };
      let versionFetch = null;
      try {
        const t0 = performance.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch("/api/pwa/version", { cache: "no-store", signal: controller.signal });
        clearTimeout(timer);
        versionFetch = { status: res.status, ms: Math.round(performance.now() - t0), body: await res.text() };
      } catch (error) {
        versionFetch = { error: String(error) };
      }
      let registerAttempt = null;
      try {
        const reg = await navigator.serviceWorker.register("/sw.js?v=probe", { scope: "/" });
        registerAttempt = { scope: reg.scope, active: reg.active?.state || null, installing: reg.installing?.state || null };
      } catch (error) {
        registerAttempt = { error: String(error) };
      }
      return {
        href: location.href,
        lang: document.documentElement.lang,
        viewport: get('meta[name="viewport"]'),
        themeColor: get('meta[name="theme-color"]'),
        description: get('meta[name="description"]'),
        appleCapable: get('meta[name="apple-mobile-web-app-capable"]'),
        mobileCapable: get('meta[name="mobile-web-app-capable"]'),
        appleTitle: get('meta[name="apple-mobile-web-app-title"]'),
        appleStatus: get('meta[name="apple-mobile-web-app-status-bar-style"]'),
        manifestHref,
        appleTouchIcon: href('link[rel="apple-touch-icon"]'),
        favicon: href('link[rel="icon"]'),
        startupImages: document.querySelectorAll('link[rel="apple-touch-startup-image"]').length,
        sw: {
          supported: "serviceWorker" in navigator,
          count: regs.length,
          scope: active?.scope || null,
          active: active?.active?.state || null,
          waiting: active?.waiting?.state || null,
          installing: active?.installing?.state || null,
          scriptURL: active?.active?.scriptURL || active?.installing?.scriptURL || null,
          controller: Boolean(navigator.serviceWorker.controller),
        },
        manifest,
        fallback: { status: fallback.status, ok: fallback.ok },
        icon192: { status: icon192.status, type: icon192.headers.get("content-type") },
        icon512: { status: icon512.status, type: icon512.headers.get("content-type") },
        apple,
        versionFetch,
        registerAttempt,
        displayStandalone: window.matchMedia("(display-mode: standalone)").matches,
        online: navigator.onLine,
      };
    })()`);
    probe.logs = logs.slice(0, 20);

    fs.writeFileSync(path.join(OUT, "live-probe.json"), JSON.stringify(probe, null, 2));
    console.log(JSON.stringify(probe, null, 2));
    cdp.close();
  } catch (error) {
    console.error(String(error));
    process.exitCode = 1;
  } finally {
    try {
      process.kill(child.pid);
    } catch {
      // already exited
    }
  }
})();
