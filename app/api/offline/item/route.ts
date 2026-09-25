import { NextResponse } from "next/server";
import { buildOfflineItem, requireOfflineViewer } from "@/lib/offline/server-download";
import type { OfflineContentType } from "@/lib/offline/types";

export const dynamic = "force-dynamic";

const TYPES = new Set<OfflineContentType>(["protocol", "cat", "drug", "calculator"]);

export async function GET(request: Request) {
  const session = await requireOfflineViewer();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") as OfflineContentType | null;
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  if (!type || !TYPES.has(type) || !slug) {
    return NextResponse.json({ error: "unknown" }, { status: 404 });
  }

  const result = await buildOfflineItem(type, slug, session.viewer);
  if ("error" in result) {
    return NextResponse.json({ error: result.reason }, { status: result.error });
  }

  return NextResponse.json(result.item, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
