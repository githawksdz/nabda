export type OfferCountdownState =
  | { kind: "expired" }
  | { kind: "date"; label: string }
  | { kind: "hours"; label: string }
  | { kind: "minutes"; label: string };

const MINUTE_MS = 60_000;

export function msUntilOfferEnd(endsAt: string, nowMs: number): number {
  const end = Date.parse(endsAt);
  if (Number.isNaN(end)) {
    return 0;
  }
  return end - nowMs;
}

export function isOfferExpired(endsAt: string, nowMs = Date.now()): boolean {
  return msUntilOfferEnd(endsAt, nowMs) <= 0;
}

function formatFrenchDate(date: Date, timeZone?: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone,
  }).format(date);
}

export function formatOfferCountdown(
  endsAt: string,
  nowMs: number,
  timeZone?: string,
): OfferCountdownState {
  const remaining = msUntilOfferEnd(endsAt, nowMs);
  if (remaining <= 0) {
    return { kind: "expired" };
  }

  const endDate = new Date(Date.parse(endsAt));
  const hours = remaining / (60 * 60 * 1000);

  if (hours > 24) {
    return {
      kind: "date",
      label: `Se termine le ${formatFrenchDate(endDate, timeZone)}`,
    };
  }

  if (hours >= 1) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / MINUTE_MS);
    const minutePart = minutes > 0 ? ` ${minutes} min` : "";
    return {
      kind: "hours",
      label: `Se termine dans ${wholeHours} h${minutePart}`,
    };
  }

  const minutesOnly = Math.max(1, Math.ceil(remaining / MINUTE_MS));
  return {
    kind: "minutes",
    label: `Se termine dans ${minutesOnly} min`,
  };
}

/** Align updates to wall-clock minutes without resetting the offer deadline. */
export function msUntilNextCountdownTick(nowMs: number): number {
  const nextMinute = Math.ceil(nowMs / MINUTE_MS) * MINUTE_MS;
  return Math.max(250, nextMinute - nowMs);
}
