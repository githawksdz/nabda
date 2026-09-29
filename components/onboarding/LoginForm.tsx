import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { DrawerDescription, DrawerTitle } from "@/components/ui/AppDrawer";
import { Button } from "@/components/ui/Button";
import { sendPasswordReset, signInWithEmail, signInWithGoogle } from "@/features/auth/api";
import { loginSchema, resetPasswordSchema } from "@/lib/auth/schemas";
import { PasswordField } from "./PasswordField";
import { SoftMessage } from "./SoftMessage";
import { SocialAuthRow } from "./SocialAuthRow";

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

type LoginView = "login" | "forgot";

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const emailId = useId();
  const resetEmailId = useId();
  const [view, setView] = useState<LoginView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<{ text: string; tone: "info" | "success" } | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setInfo(null);
      setError(parsed.error.issues[0]?.message ?? "Adresse email invalide.");
      return;
    }

    setPending(true);
    setError(null);
    setInfo(null);
    const result = await signInWithEmail(parsed.data);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace(result.redirectTo ?? "/home");
    router.refresh();
  }

  async function onResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ email: resetEmail });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Adresse email invalide.");
      return;
    }

    setPending(true);
    setError(null);
    const result = await sendPasswordReset(parsed.data.email);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setInfo({ text: result.info ?? "Si un compte existe, un lien sera envoyé.", tone: "success" });
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

  if (view === "forgot") {
    return (
      <form noValidate onSubmit={onResetSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <DrawerTitle>Réinitialiser</DrawerTitle>
          <DrawerDescription>
            Entrez votre email pour recevoir un lien.
          </DrawerDescription>
        </div>

        {error ? <SoftMessage type="error">{error}</SoftMessage> : null}
        {info ? <SoftMessage type={info.tone}>{info.text}</SoftMessage> : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={resetEmailId}
            className="text-label-sm font-medium text-on-surface-variant"
          >
            Adresse email
          </label>
          <input
            id={resetEmailId}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={resetEmail}
            onChange={(event) => {
              setResetEmail(event.target.value);
              setError(null);
            }}
            className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-base text-on-surface outline-none placeholder:text-on-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <Button type="submit" loading={pending} className="w-full">
          {pending ? "Envoi du lien..." : "Envoyer le lien"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setView("login");
            setError(null);
            setInfo(null);
          }}
          className="text-center text-label-sm text-on-surface-variant"
        >
          Retour à la connexion
        </button>
      </form>
    );
  }

  return (
    <form noValidate onSubmit={onLoginSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <DrawerTitle>Connexion</DrawerTitle>
        <DrawerDescription>Retrouvez votre espace Nabda.</DrawerDescription>
      </div>

      {error ? <SoftMessage type="error">{error}</SoftMessage> : null}
      {info ? <SoftMessage type={info.tone}>{info.text}</SoftMessage> : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={emailId}
          className="text-label-sm font-medium text-on-surface-variant"
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
          className="h-12 w-full rounded-lg bg-surface-container-low px-4 text-base text-on-surface outline-none placeholder:text-on-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <PasswordField
        label="Mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setError(null);
        }}
      />

      <button
        type="button"
        onClick={() => {
          setView("forgot");
          setResetEmail(email);
          setError(null);
          setInfo(null);
        }}
        className="self-start text-label-sm text-on-surface-variant"
      >
        Mot de passe oublié ?
      </button>

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Connexion..." : "Se connecter"}
      </Button>

      <SocialAuthRow
        prompt="ou continuer avec"
        googlePending={googlePending}
        onGoogle={onGoogle}
      />

      <p className="text-center text-label-sm text-on-surface-variant">
        Nouveau sur Nabda ?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-on-surface"
        >
          Créer un compte
        </button>
      </p>
    </form>
  );
}
