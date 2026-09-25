import { NextResponse } from "next/server";
import { ifNoneMatch, weakEtag } from "@/lib/offline/etag";
import { buildCatalogManifest, requireOfflineViewer } from "@/lib/offline/server-download";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await requireOfflineViewer();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const manifest = await buildCatalogManifest(session.viewer);
  if (!manifest) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const body = JSON.stringify(manifest);
  const etag = weakEtag(body);
  if (ifNoneMatch(request, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      "Last-Modified": new Date(manifest.generatedAt).toUTCString(),
      "Cache-Control": "private, no-cache",
    },
  });
}
