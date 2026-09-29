/**
 * R1 browser QA using installed Edge + Chrome DevTools Protocol.
 * No new npm dependency.
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const EDGE =
  process.env.EDGE_PATH ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = process.env.R1_BASE_URL || "http://localhost:3000";
const PORT = 9223;
const OUT = path.join(process.cwd(), ".tmp", "r1-screenshots");
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

  async screenshot(name) {
    const shot = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(shot.data, "base64"));
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

async function setViewport(cdp, width, height) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 1024,
  });
}

async function goto(cdp, pathname) {
  await cdp.send("Page.navigate", { url: `${BASE}${pathname}` });
  await cdp.eval(`new Promise((resolve) => {
    if (document.readyState === "complete") resolve(true);
    else window.addEventListener("load", () => resolve(true), { once: true });
  })`);
  await new Promise((r) => setTimeout(r, 800));
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
      `${BASE}/home`,
    ],
    { stdio: "ignore", detached: true, windowsHide: true },
  );
  child.unref();

  const log = [];
  try {
    const target = await waitForTargets();
    const cdp = new Cdp(target.webSocketDebuggerUrl);
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    async function inspect(label) {
      const info = await cdp.eval(`({
        href: location.href,
        shell: document.querySelectorAll('[data-doctor-shell]').length,
        header: document.querySelectorAll('[data-app-header]').length,
        nav: document.querySelectorAll('[data-bottom-nav]').length,
        sidebar: document.querySelectorAll('[data-desktop-sidebar]').length,
        dock: document.querySelectorAll('[data-reading-dock]').length,
        persist: Boolean(document.querySelector('[data-doctor-shell]') && document.querySelector('[data-doctor-shell]').__r1Persist)
      })`);
      log.push({ label, ...info });
      return info;
    }

    await setViewport(cdp, 390, 844);
    await goto(cdp, "/home");
    const home = await inspect("390-home");
    await cdp.screenshot("390-home");

    if (home.shell !== 1) {
      throw new Error(`Auth or shell missing at ${home.href}`);
    }

    await cdp.eval(`document.querySelector('[data-doctor-shell]').__r1Persist = true`);

    await cdp.eval(`document.querySelector('[data-bottom-nav] a[href="/search"]').click()`);
    await new Promise((r) => setTimeout(r, 1500));
    const search = await inspect("390-search");
    await cdp.screenshot("390-search");
    if (!search.persist) {
      throw new Error("Shell remounted after search navigation");
    }

    await cdp.eval(`document.querySelector('[data-bottom-nav] a[href="/cat"]').click()`);
    await new Promise((r) => setTimeout(r, 1500));
    await inspect("390-cat");
    await cdp.screenshot("390-cat");

    for (const [name, route] of [
      ["390-cat-detail", "/cat/douleur-thoracique-cat"],
      ["390-protocol-detail", "/protocols/douleur-thoracique"],
      ["390-favorites", "/favorites"],
      ["390-offline", "/offline"],
      ["390-profile", "/profile"],
    ]) {
      await goto(cdp, route);
      await inspect(name);
      await cdp.screenshot(name);
    }

    await setViewport(cdp, 430, 932);
    await goto(cdp, "/home");
    await inspect("430-home");
    await cdp.screenshot("430-home");
    await goto(cdp, "/cat/douleur-thoracique-cat");
    await inspect("430-cat-detail");
    await cdp.screenshot("430-cat-detail");

    await setViewport(cdp, 1440, 900);
    await goto(cdp, "/home");
    await inspect("1440-home");
    await cdp.screenshot("1440-home");
    await goto(cdp, "/cat");
    await inspect("1440-cat");
    await cdp.screenshot("1440-cat");
    await goto(cdp, "/cat/douleur-thoracique-cat");
    await inspect("1440-cat-detail");
    await cdp.screenshot("1440-cat-detail");
    await goto(cdp, "/protocols/douleur-thoracique");
    await inspect("1440-protocol-detail");
    await cdp.screenshot("1440-protocol-detail");

    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ ok: true, log }, null, 2));
    console.log(JSON.stringify({ ok: true, log }, null, 2));
    cdp.close();
  } catch (error) {
    fs.writeFileSync(
      path.join(OUT, "results.json"),
      JSON.stringify({ ok: false, error: String(error), log }, null, 2),
    );
    console.error(String(error));
    console.log(JSON.stringify({ ok: false, log }, null, 2));
    process.exitCode = 1;
  } finally {
    try {
      process.kill(child.pid);
    } catch {
      // already exited
    }
  }
})();
