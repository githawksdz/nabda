import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let destination = "/onboarding/personalisation";
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          const metadata = user.user_metadata ?? {};
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email ?? null,
            full_name:
              (typeof metadata.full_name === "string" && metadata.full_name) ||
              (typeof metadata.name === "string" && metadata.name) ||
              null,
            avatar_url:
              (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
              (typeof metadata.picture === "string" && metadata.picture) ||
              null,
          });
        }

        await supabase.from("onboarding_events").insert({
          user_id: user.id,
          event_name: profile ? "login_completed" : "registration_completed",
        });

        destination = profile?.onboarding_completed
          ? "/home"
          : "/onboarding/personalisation";
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      const redirectOrigin =
        !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

      return NextResponse.redirect(
        `${redirectOrigin}${next ?? destination}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`);
}
