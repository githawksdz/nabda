import { createHash } from "node:crypto";

export function weakEtag(body: string): string {
  const digest = createHash("sha256").update(body).digest("base64url");
  return `"${digest}"`;
}

export function ifNoneMatch(request: Request, etag: string): boolean {
  const incoming = request.headers.get("if-none-match");
  if (!incoming) return false;
  return incoming
    .split(",")
    .map((part) => part.trim())
    .includes(etag);
}

export function ifModifiedSince(request: Request, updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  const incoming = request.headers.get("if-modified-since");
  if (!incoming) return false;
  const since = Date.parse(incoming);
  const updated = Date.parse(updatedAt);
  if (Number.isNaN(since) || Number.isNaN(updated)) return false;
  return updated <= since;
}
