/**
 * Configure staging test user profile flags (no passwords in source).
 *
 * Usage:
 *   CONFIRM_STAGING_TEST_USERS=1 npx tsx scripts/configure-staging-test-users.ts --email=tester@example.com --complete=1
 */
import { createImportClient, getImportSupabaseEnv } from "@/lib/nabda-db/import-client";
import { loadLocalEnvFiles } from "@/lib/nabda-db/load-env";

const CONFIRM = "CONFIRM_STAGING_TEST_USERS";

function arg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : null;
}

async function main() {
  if (process.env[CONFIRM] !== "1") {
    throw new Error(`Refusing. Set ${CONFIRM}=1`);
  }
  loadLocalEnvFiles(process.cwd());
  const { url, serviceRoleKey } = getImportSupabaseEnv();
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase env");

  const email = arg("email") || process.env.STAGING_TEST_USER_EMAIL;
  if (!email) throw new Error("Provide --email= or STAGING_TEST_USER_EMAIL");
  const complete = arg("complete") === "1";

  const client = createImportClient();
  const { data: users, error } = await client.auth.admin.listUsers({ perPage: 200 });
  if (error) throw new Error(error.message);
  const user = users.users.find((u) => u.email === email);
  if (!user) {
    throw new Error("User not found — create via Auth UI first (password never logged).");
  }

  const { error: upErr } = await client
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      onboarding_completed: complete,
      updated_at: new Date().toISOString(),
    });
  if (upErr) throw new Error(upErr.message);

  console.log(`OK staging test user profile updated complete=${complete}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
