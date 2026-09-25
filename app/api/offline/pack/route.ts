import { NextResponse } from "next/server";
import { buildPackDownload, requireOfflineViewer } from "@/lib/offline/server-download";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireOfflineViewer();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ error: "unknown" }, { status: 404 });
  }

  const result = await buildPackDownload(slug, session.viewer);
  if ("error" in result) {
    return NextResponse.json({ error: result.reason }, { status: result.error });
  }

  return NextResponse.json(result.pack, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
