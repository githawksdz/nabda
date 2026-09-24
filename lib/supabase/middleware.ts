import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

function withSessionCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
  return to;
}

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/update-password") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/readiness") ||
    pathname === "/staging-access"
  );
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withSessionCookies(supabaseResponse, NextResponse.redirect(url));
  }

  if (user && pathname === "/") {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!error) {
      const url = request.nextUrl.clone();
      url.pathname = profile?.onboarding_completed
        ? "/home"
        : "/onboarding/personalisation";
      return withSessionCookies(supabaseResponse, NextResponse.redirect(url));
    }
  }

  if (user && pathname.startsWith("/onboarding")) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return withSessionCookies(supabaseResponse, NextResponse.redirect(url));
    }
  }

  return supabaseResponse;
}
