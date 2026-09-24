/**
 * Minimal structured server logger (Sentry-ready later).
 * Never log secrets, tokens, clinical payloads, or patient calculator inputs.
 */

export type LogEvent = {
  event: string;
  route?: string;
  contentType?: string;
  slug?: string;
  status?: number | string;
  durationMs?: number;
  errorCode?: string;
  timestamp?: string;
};

function safeSerialize(meta: LogEvent): string {
  const payload: LogEvent = {
    ...meta,
    timestamp: meta.timestamp ?? new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

export function logInfo(meta: LogEvent): void {
  console.info(safeSerialize(meta));
}

export function logWarn(meta: LogEvent): void {
  console.warn(safeSerialize(meta));
}

export function logError(meta: LogEvent & { detail?: string }): void {
  const { detail, ...rest } = meta;
  // detail is server-only; strip anything that looks like a key
  const scrubbed =
    detail && !/service.?role|apikey|password|token|bearer/i.test(detail)
      ? detail.slice(0, 300)
      : undefined;
  console.error(safeSerialize({ ...rest, errorCode: rest.errorCode ?? "error" }), scrubbed ?? "");
}
