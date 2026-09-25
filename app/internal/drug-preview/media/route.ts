import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { canAccessInternalPreview } from "@/lib/internal/preview-gate";
import { resolveDrugPreviewMediaPath } from "@/lib/internal/drug-preview-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(request: NextRequest) {
  const allowed = await canAccessInternalPreview();
  if (!allowed) {
    return new NextResponse(null, { status: 404 });
  }

  const file = request.nextUrl.searchParams.get("file") ?? "";
  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext];
  if (!mime) {
    return new NextResponse(null, { status: 404 });
  }

  const absolute = resolveDrugPreviewMediaPath(file);
  if (!absolute || !fs.existsSync(absolute)) {
    return new NextResponse(null, { status: 404 });
  }

  const bytes = fs.readFileSync(absolute);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
