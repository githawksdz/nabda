import { AUTH_INFO, mapAuthError } from "@/lib/auth/error-messages";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
} from "@/lib/auth/schemas";
import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { resolvePostAuthPath } from "@/features/profile/client";

export type AuthResult =
  | { ok: true; redirectTo?: string; info?: string }
  | { ok: false; message: string };

function origin() {
  return getSiteUrl();
}

async function logAuthEvent(eventName: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    await supabase.from("onboarding_events").insert({
      user_id: user.id,
      event_name: eventName,
    });
  } catch {
    // Events are non-blocking.
  }
}

export async function signUpWithEmail(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Une erreur est survenue. Réessayez." };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.fullName },
        emailRedirectTo: `${origin()}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, message: mapAuthError(error.message) };
    }

    if (!data.session) {
      return { ok: true, info: AUTH_INFO.confirmEmail };
    }

    await logAuthEvent("registration_completed");
    return { ok: true, redirectTo: await resolvePostAuthPath() };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signInWithEmail(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Une erreur est survenue. Réessayez." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { ok: false, message: mapAuthError(error.message) };
    }

    await logAuthEvent("login_completed");
    return { ok: true, redirectTo: await resolvePostAuthPath() };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin()}/auth/callback`,
      },
    });

    if (error) {
      return { ok: false, message: AUTH_INFO.googleUnavailable };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: AUTH_INFO.googleUnavailable };
  }
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Adresse email invalide." };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin()}/auth/update-password`,
    });

    if (error) {
      return { ok: false, message: mapAuthError(error.message) };
    }

    return { ok: true, info: AUTH_INFO.resetSent };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      return { ok: false, message: mapAuthError(error.message) };
    }
    return { ok: true, redirectTo: await resolvePostAuthPath() };
  } catch (error) {
    return { ok: false, message: mapAuthError(error) };
  }
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
