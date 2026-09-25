import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

type SessionCookie = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function applySessionCookies(target: NextResponse, cookies: SessionCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    target.cookies.set(name, value, options);
  });
  return target;
}

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/update-password") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/readiness") ||
    pathname.startsWith("/content-media") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/offline-fallback.html") ||
    pathname.startsWith("/manifest.webmanifest") ||
    pathname.startsWith("/icon-192") ||
    pathname.startsWith("/icon-512") ||
    pathname.startsWith("/api/pwa/") ||
    pathname === "/staging-access"
  );
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  let sessionCookies: SessionCookie[] = [];

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        sessionCookies = cookiesToSet;
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
    return applySessionCookies(NextResponse.redirect(url), sessionCookies);
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
      return applySessionCookies(NextResponse.redirect(url), sessionCookies);
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
      return applySessionCookies(NextResponse.redirect(url), sessionCookies);
    }
  }

  return supabaseResponse;
}
