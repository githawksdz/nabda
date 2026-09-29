import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getStagingAccessSecret } from "@/lib/env/server";
import { buildCsp, cspHeaderName } from "@/lib/security/csp";

const STAGING_COOKIE = "nabda_staging_access";

function isAssetOrExempt(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/readiness") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/update-password") ||
    pathname === "/staging-access" ||
    pathname === "/favicon.ico" ||
    pathname === "/sw.js" ||
    pathname === "/offline-fallback.html" ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icon-") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/api/pwa/") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$/i.test(pathname)
  );
}

function stagingGate(request: NextRequest): NextResponse | null {
  const secret = getStagingAccessSecret();
  if (!secret) return null;

  if (isAssetOrExempt(request.nextUrl.pathname)) return null;

  const cookie = request.cookies.get(STAGING_COOKIE)?.value;
  if (cookie === secret) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/staging-access";
  url.search = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);

  const gated = stagingGate(request);
  const response = gated ?? (await updateSession(request));
  response.headers.set(cspHeaderName(), csp);
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
