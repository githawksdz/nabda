import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStagingAccessSecret } from "@/lib/env/server";

const STAGING_COOKIE = "nabda_staging_access";

async function unlock(formData: FormData) {
  "use server";
  const secret = getStagingAccessSecret();
  if (!secret) {
    redirect("/home");
  }
  const provided = String(formData.get("secret") ?? "");
  if (provided !== secret) {
    redirect("/staging-access?error=1");
  }
  const jar = await cookies();
  jar.set(STAGING_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/home");
}

export default async function StagingAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const secret = getStagingAccessSecret();
  if (!secret) {
    redirect("/");
  }
  const params = await searchParams;
  const errored = params.error === "1";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col justify-center gap-4 bg-background px-4 text-on-surface">
      <h1 className="text-headline-md">Accès staging Nabda</h1>
      <p className="text-body-md text-on-surface-variant">
        Espace de test privé. Saisissez le code fourni par l’équipe produit.
      </p>
      {errored ? (
        <p className="text-body-sm text-error" role="alert">
          Code incorrect.
        </p>
      ) : null}
      <form action={unlock} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-label-md">Code d’accès</span>
          <input
            name="secret"
            type="password"
            autoComplete="off"
            required
            className="min-h-11 rounded-xl bg-surface-container-low px-3.5 text-body-md"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-label-md text-on-primary"
        >
          Continuer
        </button>
      </form>
    </main>
  );
}
