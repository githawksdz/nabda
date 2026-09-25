import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { canRenderSourcePreservedContent } from "@/lib/content-source/readiness";
import { resolveCatSourceMediaPath } from "@/lib/content-data/source-media-paths";
import { viewerCanReadSlug } from "@/lib/authz/access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(request: NextRequest) {
  if (!canRenderSourcePreservedContent()) {
    return new NextResponse(null, { status: 404 });
  }

  const slug = request.nextUrl.searchParams.get("slug") ?? "";
  const file = request.nextUrl.searchParams.get("file") ?? "";
  if (!slug || !(await viewerCanReadSlug("cat", slug))) {
    return new NextResponse(null, { status: 404 });
  }

  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    return new NextResponse(null, { status: 404 });
  }

  const absolute = resolveCatSourceMediaPath(file);
  if (!absolute || !fs.existsSync(absolute)) {
    return new NextResponse(null, { status: 404 });
  }

  const bytes = fs.readFileSync(absolute);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
