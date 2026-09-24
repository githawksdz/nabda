import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { logError } from "@/lib/observability/logger";
import {
  checkRateLimit,
  clientIpFromHeaders,
} from "@/lib/security/rate-limit";

/**
 * Readiness — lightweight identity + search probes.
 * Uses anon/session client (not service role). Never returns payloads.
 */
export async function GET(request: Request) {
  const ip = clientIpFromHeaders(request.headers);
  const limit = checkRateLimit({
    key: `readiness:${ip}`,
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { status: "error", message: "Trop de requêtes" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { status: "error", database: "unavailable", search: "unavailable" },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from("protocols")
      .select("id")
      .limit(1);
    const { error: searchError } = await supabase
      .from("search_documents")
      .select("id")
      .limit(1);

    if (dbError || searchError) {
      logError({
        event: "readiness_failed",
        route: "/api/readiness",
        errorCode: dbError?.code || searchError?.code || "query_failed",
        detail: dbError?.message || searchError?.message,
      });
      return NextResponse.json(
        {
          status: "error",
          database: dbError ? "error" : "ok",
          search: searchError ? "error" : "ok",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: "ready",
      database: "ok",
      search: "ok",
    });
  } catch (error) {
    logError({
      event: "readiness_exception",
      route: "/api/readiness",
      errorCode: "exception",
      detail: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { status: "error", database: "error", search: "error" },
      { status: 503 },
    );
  }
}
