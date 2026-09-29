/**
 * One-off R1 visual QA. Not a project dependency.
 * Usage: npx --yes playwright@1.55.2 install --with-deps chromium
 *        is skipped; uses installed Edge via channel.
 */
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const BASE = process.env.R1_BASE_URL || "http://localhost:3000";
const OUT = path.join(process.cwd(), ".tmp", "r1-screenshots");

const ROUTES = {
  home: "/home",
  search: "/search",
  cat: "/cat",
  catDetail: "/cat/douleur-thoracique-cat",
  favorites: "/favorites",
  offline: "/offline",
  profile: "/profile",
  protocolDetail: "/protocols/douleur-thoracique",
  drugIndex: "/drugs",
  calcIndex: "/calculators",
};

async function shot(page, name) {
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: false,
  });
}

async function assertShell(page, label) {
  const shell = page.locator("[data-doctor-shell]");
  const header = page.locator("[data-app-header]");
  const nav = page.locator("[data-bottom-nav]");
  const counts = {
    shell: await shell.count(),
    header: await header.count(),
    nav: await nav.count(),
  };
  if (counts.shell !== 1) {
    throw new Error(`${label}: expected one [data-doctor-shell], got ${counts.shell}`);
  }
  if (counts.header !== 1) {
    throw new Error(`${label}: expected one [data-app-header], got ${counts.header}`);
  }
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 1024 && counts.nav !== 1) {
    throw new Error(`${label}: expected bottom nav on mobile, got ${counts.nav}`);
  }
  return counts;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const results = [];

  async function runViewport(width, height, prefix) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.setDefaultTimeout(20000);
    await page.goto(`${BASE}${ROUTES.home}`, { waitUntil: "domcontentloaded" });
    const url = page.url();
    results.push({ prefix, landed: url });
    if (!url.includes("/home") && !url.includes("/cat")) {
      await shot(page, `${prefix}-blocked`);
      await page.close();
      return { blocked: true, url };
    }

    const shellHandle = await page.evaluateHandle(() => {
      const el = document.querySelector("[data-doctor-shell]");
      if (el) el.__r1Persist = true;
      return el;
    });

    await assertShell(page, `${prefix} home`);
    await shot(page, `${prefix}-home`);

    await page.locator("[data-bottom-nav] a[href='/search']").click();
    await page.waitForURL("**/search");
    await assertShell(page, `${prefix} search`);
    await shot(page, `${prefix}-search`);

    const persisted = await page.evaluate(() => {
      const el = document.querySelector("[data-doctor-shell]");
      return Boolean(el && el.__r1Persist);
    });
    results.push({ prefix, persisted });
    if (!persisted) {
      throw new Error(`${prefix}: shell remounted after /search`);
    }

    await page.locator("[data-bottom-nav] a[href='/cat']").click();
    await page.waitForURL("**/cat");
    await assertShell(page, `${prefix} cat`);
    await shot(page, `${prefix}-cat`);

    await page.goto(`${BASE}${ROUTES.catDetail}`, { waitUntil: "domcontentloaded" });
    await assertShell(page, `${prefix} cat detail`);
    const dock = await page.locator("[data-reading-dock]").count();
    const navBox = await page.locator("[data-bottom-nav]").boundingBox();
    const dockBox =
      dock > 0 ? await page.locator("[data-reading-dock]").boundingBox() : null;
    results.push({ prefix, catDetailDock: dock, navBox, dockBox });
    await shot(page, `${prefix}-cat-detail`);

    await page.goto(`${BASE}${ROUTES.protocolDetail}`, {
      waitUntil: "domcontentloaded",
    });
    await assertShell(page, `${prefix} protocol`);
    await shot(page, `${prefix}-protocol-detail`);

    await page.goto(`${BASE}${ROUTES.favorites}`, { waitUntil: "domcontentloaded" });
    await assertShell(page, `${prefix} favorites`);
    await page.goto(`${BASE}${ROUTES.offline}`, { waitUntil: "domcontentloaded" });
    await assertShell(page, `${prefix} offline`);
    await page.goto(`${BASE}${ROUTES.profile}`, { waitUntil: "domcontentloaded" });
    await assertShell(page, `${prefix} profile`);
    await shot(page, `${prefix}-profile`);

    await page.close();
    return { blocked: false, persisted };
  }

  try {
    const mobile = await runViewport(390, 844, "390");
    if (!mobile.blocked) {
      await runViewport(430, 932, "430");
      const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      desktop.setDefaultTimeout(20000);
      await desktop.goto(`${BASE}${ROUTES.home}`, { waitUntil: "domcontentloaded" });
      await assertShell(desktop, "desktop home");
      const sidebar = await desktop.locator("[data-desktop-sidebar]").count();
      results.push({ desktopSidebar: sidebar });
      await shot(desktop, "1440-home");
      await desktop.goto(`${BASE}${ROUTES.cat}`, { waitUntil: "domcontentloaded" });
      await shot(desktop, "1440-cat");
      await desktop.goto(`${BASE}${ROUTES.catDetail}`, {
        waitUntil: "domcontentloaded",
      });
      await shot(desktop, "1440-cat-detail");
      await desktop.goto(`${BASE}${ROUTES.protocolDetail}`, {
        waitUntil: "domcontentloaded",
      });
      await shot(desktop, "1440-protocol-detail");
      await desktop.close();
    }
    fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } catch (error) {
    console.error(error);
    fs.writeFileSync(
      path.join(OUT, "results.json"),
      JSON.stringify({ ok: false, error: String(error), results }, null, 2),
    );
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
