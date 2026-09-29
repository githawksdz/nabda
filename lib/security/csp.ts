function supabaseConnectSrc(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return ` ${url.origin} ${url.origin.replace(/^https:/, "wss:").replace(/^http:/, "ws:")}`;
  } catch {
    return "";
  }
}

export function buildCsp(nonce: string): string {
  const connect = `'self'${supabaseConnectSrc()}`;
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    `connect-src ${connect}`,
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
}

export function cspHeaderName(): "Content-Security-Policy" | "Content-Security-Policy-Report-Only" {
  if (process.env.NABDA_CSP_REPORT_ONLY === "1") {
    return "Content-Security-Policy-Report-Only";
  }
  if (process.env.NABDA_CSP_ENFORCE === "1" || process.env.NODE_ENV === "production") {
    return "Content-Security-Policy";
  }
  return "Content-Security-Policy-Report-Only";
}
