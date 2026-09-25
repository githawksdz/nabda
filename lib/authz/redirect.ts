/**
 * Same-origin relative path allowlist for post-auth redirects.
 * Rejects absolute, protocol-relative, backslash, and encoded tricks.
 */

const DEFAULT_AUTH_REDIRECT = "/home";

function decodeUntilStable(value: string, max = 3): string | null {
  let current = value;
  for (let i = 0; i < max; i += 1) {
    let next: string;
    try {
      next = decodeURIComponent(current.replace(/\+/g, "%20"));
    } catch {
      return null;
    }
    if (next === current) {
      return current;
    }
    current = next;
  }
  return null;
}

function containsRedirectTrick(value: string): boolean {
  if (!value) {
    return true;
  }
  if (value.includes("\\") || value.includes("\0") || value.includes("\r") || value.includes("\n")) {
    return true;
  }
  if (value.includes("://")) {
    return true;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    return true;
  }
  if (value.startsWith("//") || value.startsWith("/\\") || value.startsWith("/\t")) {
    return true;
  }
  if (value.includes("..")) {
    return true;
  }
  return false;
}

/**
 * Returns a safe same-origin relative path, or `/home` when `next` is missing or unsafe.
 */
export function safeAuthRedirectPath(
  next: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (next == null || next === "") {
    return fallback;
  }

  const decoded = decodeUntilStable(next);
  if (!decoded || containsRedirectTrick(decoded)) {
    return fallback;
  }

  if (!decoded.startsWith("/")) {
    return fallback;
  }

  if (!/^\/[A-Za-z0-9/_#?&=.\-~]*$/.test(decoded)) {
    return fallback;
  }

  return decoded;
}

export const DEFAULT_SAFE_AUTH_REDIRECT = DEFAULT_AUTH_REDIRECT;
