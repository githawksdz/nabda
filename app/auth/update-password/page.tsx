"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updatePassword } from "@/features/auth/api";
import { updatePasswordSchema } from "@/lib/auth/schemas";
import { MobileShell } from "@/components/layout/MobileShell";
import { PasswordField } from "@/components/onboarding/PasswordField";
import { SoftMessage } from "@/components/onboarding/SoftMessage";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const parsed = updatePasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ajoutez votre mot de passe.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await updatePassword(parsed.data.password);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/home");
    router.refresh();
  }

  return (
    <MobileShell>
      <header className="flex h-12 items-center">
        <span className="text-[15px] font-semibold tracking-tight">Nabda</span>
      </header>
      <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-4 pt-6">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Nouveau mot de passe</h1>
          <p className="mt-1 text-[14px] text-on-surface-variant">
            Choisissez un mot de passe d’au moins 8 caractères.
          </p>
        </div>
        {error ? <SoftMessage type="error">{error}</SoftMessage> : null}
        <PasswordField
          label="Mot de passe"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError(null);
          }}
        />
        <PasswordField
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError(null);
          }}
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-[54px] w-full rounded-lg bg-primary text-[16px] font-medium text-on-primary disabled:opacity-60"
        >
          {pending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </MobileShell>
  );
}
