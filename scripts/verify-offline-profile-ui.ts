/**
 * Static checks for UI-7 offline and profile presentation.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

const checks: { id: string; ok: boolean; detail: string }[] = [];

function check(id: string, ok: boolean, detail: string) {
  checks.push({ id, ok, detail });
}

const manager = read("components/offline/OfflineManagerPage.tsx");
const view = read("components/offline/OfflineContentView.tsx");
const profile = read("components/personal/profile/ProfilePage.tsx");
const plan = read("components/personal/profile/PlanCard.tsx");
const connection = read("components/pwa/ConnectionIndicator.tsx");
const account = read("components/personal/profile/AccountSection.tsx");
const signOut = read("features/auth/api.ts");

check(
  "distinct_access_copy",
  manager.includes("Pro requis") &&
    manager.includes("Connectez-vous pour") &&
    manager.includes("uniquement en ligne") &&
    manager.includes("Connexion requise pour") &&
    manager.includes("échoué"),
  "OfflineManagerPage",
);

check(
  "downloaded_vs_stale",
  manager.includes("Disponible hors-ligne") &&
    manager.includes("Mise à jour disponible") &&
    manager.includes('"downloaded"') &&
    manager.includes('"stale"'),
  "status badges",
);

check(
  "real_pack_progress",
  read("components/ui/OfflineProgressStatus.tsx").includes("<progress") &&
    manager.includes("done}/${total}") &&
    manager.includes("OfflineProgressStatus"),
  "pack progress",
);

check(
  "no_retry_loop",
  !manager.includes("setInterval") && !manager.includes("setTimeout"),
  "OfflineManagerPage",
);

check(
  "profile_offline_entry",
  profile.includes('href: "/offline"') && !profile.includes("/premium"),
  "ProfilePage",
);

check(
  "no_bientot",
  !manager.includes("Bientôt disponible") &&
    !profile.includes("Bientôt disponible") &&
    !view.includes("Bientôt disponible"),
  "copy",
);

check(
  "logout_still_signs_out",
  account.includes("signOut()") && signOut.includes("clearOfflinePrivateData"),
  "auth wipe",
);

check(
  "connection_no_fake_sync",
  connection.includes("En ligne") &&
    connection.includes("Hors-ligne") &&
    !connection.toLowerCase().includes("synchron"),
  "ConnectionIndicator",
);

check(
  "plan_badges",
  plan.includes("Gratuit") && plan.includes("Pro") && !plan.includes("/premium"),
  "PlanCard",
);

check(
  "offline_summary_honest",
  view.includes("version résumée") && view.includes("Contenu local illisible"),
  "OfflineContentView",
);

const failed = checks.filter((item) => !item.ok);
console.log(
  `offline profile ui ${failed.length === 0 ? "PASS" : "FAIL"} (${checks.length} checks)`,
);
for (const item of failed) {
  console.error(`- ${item.id}: ${item.detail}`);
}
if (failed.length > 0) {
  process.exitCode = 1;
}
