import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "vaul";
import { signInWithGoogle, signUpWithEmail } from "@/features/auth/api";
import { registerSchema } from "@/lib/auth/schemas";
import { PasswordField } from "./PasswordField";
import { SoftMessage } from "./SoftMessage";
import { SocialAuthRow } from "./SocialAuthRow";

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ text: string; tone: "info" | "success" } | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = registerSchema.safeParse({
      fullName: name,
      email,
      password,
    });
    if (!parsed.success) {
      setInfo(null);
      setError(parsed.error.issues[0]?.message ?? "Adresse email invalide.");
      return;
    }

    setPending(true);
    setError(null);
    setInfo(null);
    const result = await signUpWithEmail(parsed.data);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (result.info) {
      setInfo({ text: result.info, tone: "success" });
      return;
    }

    router.replace(result.redirectTo ?? "/onboarding/personalisation");
    router.refresh();
  }

  async function onGoogle() {
    setGooglePending(true);
    setError(null);
    setInfo(null);
    const result = await signInWithGoogle();
    if (!result.ok) {
      setGooglePending(false);
      setError(result.message);
    }
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Drawer.Title className="text-[22px] font-semibold tracking-tight text-on-surface">
          Créer un compte
        </Drawer.Title>
        <Drawer.Description className="text-[14px] text-on-surface-variant">
          Créez votre espace Nabda.
        </Drawer.Description>
      </div>

      {error ? <SoftMessage type="error">{error}</SoftMessage> : null}
      {info ? <SoftMessage type={info.tone}>{info.text}</SoftMessage> : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={nameId}
          className="text-[13px] font-medium text-on-surface-variant"
        >
          Nom complet
        </label>
        <input
          id={nameId}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-[15px] text-on-surface outline-none placeholder:text-on-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="text-[13px] font-medium text-on-surface-variant"
        >
          Adresse email
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-[15px] text-on-surface outline-none placeholder:text-on-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <PasswordField
        label="Mot de passe"
        autoComplete="new-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError(null);
        }}
      />

      <button
        type="submit"
        disabled={pending}
        className="h-[50px] w-full rounded-lg bg-primary text-[15px] font-medium text-on-primary disabled:opacity-60"
      >
        {pending ? "Création du compte..." : "Créer mon compte"}
      </button>

      <SocialAuthRow
        prompt="ou s’inscrire avec"
        googlePending={googlePending}
        onGoogle={onGoogle}
      />

      <p className="text-center text-[13px] text-on-surface-variant">
        Déjà membre ?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-on-surface"
        >
          Connexion
        </button>
      </p>
    </form>
  );
}
