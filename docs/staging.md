# Staging

Private staging for Nabda (Vercel + Supabase). No secrets in git.

## Deploy

1. Import the repo in Vercel. Node **20.x**. Build: `npm run build`.
2. Use a `staging` branch or Preview with Staging env vars from `.env.staging.example`.
3. Set `NABDA_CONTENT_MODE=production` (or leave unset). Do **not** set `NEXT_PUBLIC_NABDA_CONTENT_MODE=demo`.
4. Enable Vercel Deployment Protection and/or `STAGING_ACCESS_SECRET`.
5. Smoke: `GET /api/health` → `{ "status": "ok" }`; `GET /api/readiness` → `{ "status": "ready", ... }`.
6. Rollback: promote the previous Vercel deployment, or redeploy a known-good SHA.

`nabda_db` is excluded from route tracing. Production loaders use Supabase only. Browser source maps are off (`productionBrowserSourceMaps: false`).

## Access gate

When `STAGING_ACCESS_SECRET` is set, `proxy.ts` redirects to `/staging-access` until the tester enters the shared code (httpOnly cookie, 14 days). Never prefix with `NEXT_PUBLIC_`.

Excluded: `/_next/*`, static assets, `/api/health`, `/api/readiness`, `/auth/callback`, `/auth/update-password`, `/staging-access`.

Disable before public launch: remove the secret and Deployment Protection, then redeploy. Changing the secret invalidates existing cookies.

## Supabase Auth

Site URL = staging HTTPS origin. Redirect allow list:

- `https://<staging-host>/auth/callback`
- `https://<staging-host>/auth/update-password`
- Optional local: `http://localhost:3000/auth/callback` and `/auth/update-password`

`NEXT_PUBLIC_SITE_URL` must match that origin (`lib/supabase/env.ts` → `getSiteUrl()`). Enable Email provider. Password reset → `/auth/update-password`. Google OAuth is optional (secrets stay in Supabase / Google console).

Incomplete profiles go to `/onboarding/personalisation`; complete → `/home`.

## Test personas

Do not commit passwords. Create users in the Auth dashboard or:

`CONFIRM_STAGING_TEST_USERS=1 npx tsx scripts/configure-staging-test-users.ts`

Requires `SUPABASE_SERVICE_ROLE_KEY`. Emails via CLI args / env — no default passwords in source. Staging-only project or clearly labeled test users.

| Persona | Intent |
|---------|--------|
| New incomplete / Freemium | Onboarding not completed |
| Complete / Freemium | `onboarding_completed=true`, free plan |
| Pro profile | Premium/plan flag if used |
| Empty workspace | No favorites/history |
| Populated workspace | Favorites + history rows |

## Backup and rollback

- Prefer Supabase dashboard backups / PITR for the staging project.
- Content kill-switches: `NABDA_SOURCE_RENDER=0` for bad source HTML; `engine_implemented=false` for a broken calculator slug.
- Do not run untested DROP/TRUNCATE on staging without a restore point.
- Rotate the service role if leaked. Never commit it.
