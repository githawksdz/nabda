/**
 * Canonical checksums for offline payloads.
 * Server and client use the same JSON canonicalization.
 */

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const out: Record<string, unknown> = {};
    for (const [key, child] of entries) {
      out[key] = sortValue(child);
    }
    return out;
  }
  return value;
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checksumPayload(payload: unknown): Promise<string> {
  return sha256Hex(canonicalJson(payload));
}

export async function verifyChecksum(payload: unknown, expected: string): Promise<boolean> {
  if (!expected) return false;
  const actual = await checksumPayload(payload);
  return actual === expected;
}
