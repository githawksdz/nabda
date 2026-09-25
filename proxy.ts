import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getStagingAccessSecret } from "@/lib/env/server";

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
    pathname.startsWith("/api/pwa/") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$/i.test(pathname)
  );
}

function stagingGate(request: NextRequest): NextResponse | null {
  const secret = getStagingAccessSecret();
  if (!secret) return null; // gate disabled

  if (isAssetOrExempt(request.nextUrl.pathname)) return null;

  const cookie = request.cookies.get(STAGING_COOKIE)?.value;
  if (cookie === secret) return null;

  // Allow POST unlock via query on staging-access page only
  const url = request.nextUrl.clone();
  url.pathname = "/staging-access";
  url.search = "";
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const gated = stagingGate(request);
  if (gated) return gated;
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
