import type { Profession, UsageMode } from "@/types/database";
import type { Plan } from "@/types/home";

/**
 * Editable home campaigns. UI components render the resolved message only.
 * Add a window, then a message that points at it, to change copy by date or event.
 */

export type HomeCampaignSlot = "pro-upsell" | "profile-offer";

export type HomeCampaignWindow = {
  id: string;
  kind: "period" | "event";
  /** MM-DD when recurring, otherwise YYYY-MM-DD. Inclusive. */
  start: string;
  end: string;
  recurring?: boolean;
};

export type HomeCampaignMessage = {
  id: string;
  slot: HomeCampaignSlot;
  /** Higher wins among messages that match the same moment. */
  priority: number;
  plans?: Plan[];
  professions?: Profession[];
  usageModes?: UsageMode[];
  windowId?: string;
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  offerLabel?: string;
  illustrationSrc?: string | null;
  illustrationAlt?: string;
};

export type ResolvedHomeCampaign = {
  id: string;
  slot: HomeCampaignSlot;
  eyebrow?: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  offerLabel?: string;
  illustrationSrc: string | null;
  illustrationAlt: string;
};

export type HomeCampaignContext = {
  now: Date;
  plan: Plan;
  profession?: Profession | null;
  usageMode?: UsageMode | null;
  tokens?: Record<string, string>;
};

/** 1:1 portrait. Set src when the file is in public/. */
export const HOME_PROFILE_ILLUSTRATION: {
  src: string | null;
  alt: string;
} = {
  src: null,
  alt: "Portrait d’un médecin",
};

export const HOME_CAMPAIGN_WINDOWS: HomeCampaignWindow[] = [
  {
    id: "rentree",
    kind: "period",
    recurring: true,
    start: "09-01",
    end: "10-31",
  },
  {
    id: "hiver",
    kind: "period",
    recurring: true,
    start: "12-01",
    end: "02-28",
  },
  {
    id: "ete",
    kind: "period",
    recurring: true,
    start: "06-15",
    end: "09-15",
  },
  {
    id: "journee-urgence",
    kind: "event",
    start: "2026-05-27",
    end: "2026-05-27",
  },
];

export const HOME_CAMPAIGN_MESSAGES: HomeCampaignMessage[] = [
  {
    id: "pro-default",
    slot: "pro-upsell",
    priority: 0,
    plans: ["freemium"],
    eyebrow: "Pro",
    title: "Emportez Nabda en garde",
    body: "Protocoles hors-ligne, sans dépendre du réseau du service.",
    ctaLabel: "Passer Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-student",
    slot: "pro-upsell",
    priority: 10,
    plans: ["freemium"],
    professions: ["student"],
    eyebrow: "Pro",
    title: "Les mêmes protocoles qu’en stage",
    body: "Préparez le terrain avec les protocoles que vous retrouverez au service.",
    ctaLabel: "Activer Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-intern-shift",
    slot: "pro-upsell",
    priority: 15,
    plans: ["freemium"],
    professions: ["intern", "resident"],
    usageModes: ["shift"],
    eyebrow: "Garde",
    title: "Votre prochaine garde, déjà prête",
    body: "Les protocoles critiques restent ouverts même quand le réseau lâche.",
    ctaLabel: "Préparer ma garde",
    ctaHref: "/profile",
  },
  {
    id: "pro-generalist",
    slot: "pro-upsell",
    priority: 10,
    plans: ["freemium"],
    professions: ["generalist"],
    eyebrow: "Pro",
    title: "La consultation continue, le protocole aussi",
    body: "Retrouvez la conduite à tenir sans quitter le patient des yeux.",
    ctaLabel: "Voir Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-specialist",
    slot: "pro-upsell",
    priority: 10,
    plans: ["freemium"],
    professions: ["specialist"],
    eyebrow: "Pro",
    title: "Le détail clinique, sans le bruit",
    body: "Protocoles à jour pour votre pratique, pas une bibliothèque générique.",
    ctaLabel: "Passer Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-pharmacist",
    slot: "pro-upsell",
    priority: 10,
    plans: ["freemium"],
    professions: ["pharmacist", "dentist"],
    eyebrow: "Pro",
    title: "Le protocole juste à côté de l’ordonnance",
    body: "Gardez le contexte clinique à portée de main pendant la dispensation.",
    ctaLabel: "Découvrir Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-rentree-student",
    slot: "pro-upsell",
    priority: 30,
    plans: ["freemium"],
    professions: ["student", "intern"],
    windowId: "rentree",
    eyebrow: "Rentrée",
    title: "Le stage commence. Les protocoles aussi.",
    body: "Préparez vos premières gardes avec les protocoles du service, en ligne et hors-ligne.",
    ctaLabel: "Commencer avec Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-hiver-shift",
    slot: "pro-upsell",
    priority: 30,
    plans: ["freemium"],
    usageModes: ["shift"],
    windowId: "hiver",
    eyebrow: "Saison des gardes",
    title: "L’hiver charge les urgences",
    body: "Gardez les protocoles respiratoires et cardio disponibles pendant la garde.",
    ctaLabel: "Sécuriser mes gardes",
    ctaHref: "/profile",
  },
  {
    id: "pro-ete",
    slot: "pro-upsell",
    priority: 25,
    plans: ["freemium"],
    windowId: "ete",
    eyebrow: "Été",
    title: "Les renforts changent. Les protocoles restent.",
    body: "Un repère commun pour les gardes d’été, même loin de votre service habituel.",
    ctaLabel: "Passer Pro",
    ctaHref: "/profile",
  },
  {
    id: "pro-journee-urgence",
    slot: "pro-upsell",
    priority: 40,
    plans: ["freemium"],
    windowId: "journee-urgence",
    eyebrow: "Journée de l’urgence",
    title: "Aujourd’hui, la décision se joue en minutes",
    body: "Ouvrez les protocoles d’urgence sans attendre le réseau.",
    ctaLabel: "Débloquer Pro",
    ctaHref: "/profile",
  },
  {
    id: "profile-default",
    slot: "profile-offer",
    priority: 0,
    plans: ["freemium"],
    offerLabel: "−15 %",
    title: "Débloquez votre tarif Pro",
    body: "Il vous reste {remainingLabel} pour activer l’offre.",
    ctaLabel: "Compléter mon profil",
    ctaHref: "/onboarding/personalisation",
  },
  {
    id: "profile-student",
    slot: "profile-offer",
    priority: 10,
    plans: ["freemium"],
    professions: ["student"],
    offerLabel: "−15 %",
    title: "Votre profil de stage ouvre Pro",
    body: "Plus que {remainingLabel} pour garder l’offre sur Pro.",
    ctaLabel: "Terminer mon profil",
    ctaHref: "/onboarding/personalisation",
  },
  {
    id: "profile-shift",
    slot: "profile-offer",
    priority: 12,
    plans: ["freemium"],
    usageModes: ["shift"],
    offerLabel: "−15 %",
    title: "La garde est plus simple avec un profil complet",
    body: "Encore {remainingLabel} pour débloquer {offer} sur Pro.",
    ctaLabel: "Compléter maintenant",
    ctaHref: "/onboarding/personalisation",
  },
  {
    id: "profile-rentree",
    slot: "profile-offer",
    priority: 30,
    plans: ["freemium"],
    professions: ["student", "intern"],
    windowId: "rentree",
    eyebrow: "Offre rentrée",
    offerLabel: "−15 %",
    title: "Terminez le profil pendant la rentrée",
    body: "Encore {remainingLabel} avant l’offre Pro.",
    ctaLabel: "Débloquer l’offre",
    ctaHref: "/onboarding/personalisation",
  },
];

const windowsById = new Map(HOME_CAMPAIGN_WINDOWS.map((window) => [window.id, window]));

export function remainingStepsLabel(remaining: number): string {
  const count = Math.max(0, remaining);
  return count === 1 ? "1 étape" : `${count} étapes`;
}

export function resolveHomeCampaign(
  slot: HomeCampaignSlot,
  context: HomeCampaignContext,
): ResolvedHomeCampaign | null {
  const activeWindows = activeWindowIds(context.now);
  let best: { message: HomeCampaignMessage; score: number } | null = null;

  for (const message of HOME_CAMPAIGN_MESSAGES) {
    if (message.slot !== slot) {
      continue;
    }
    const score = matchScore(message, context, activeWindows);
    if (score == null) {
      continue;
    }
    if (
      !best ||
      score > best.score ||
      (score === best.score && message.id.localeCompare(best.message.id) < 0)
    ) {
      best = { message, score };
    }
  }

  if (!best) {
    return null;
  }

  return materialize(best.message, context.tokens ?? {});
}

function materialize(
  message: HomeCampaignMessage,
  tokens: Record<string, string>,
): ResolvedHomeCampaign {
  const illustrationSrc = message.illustrationSrc ?? HOME_PROFILE_ILLUSTRATION.src;
  const filledTokens = {
    ...tokens,
    offer: message.offerLabel ?? tokens.offer ?? "",
  };

  return {
    id: message.id,
    slot: message.slot,
    eyebrow: message.eyebrow ? fill(message.eyebrow, filledTokens) : undefined,
    title: fill(message.title, filledTokens),
    body: fill(message.body, filledTokens),
    ctaLabel: fill(message.ctaLabel, filledTokens),
    ctaHref: message.ctaHref,
    offerLabel: message.offerLabel
      ? fill(message.offerLabel, filledTokens)
      : undefined,
    illustrationSrc,
    illustrationAlt: message.illustrationAlt ?? HOME_PROFILE_ILLUSTRATION.alt,
  };
}

function fill(template: string, tokens: Record<string, string>): string {
  return template
    .replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function matchScore(
  message: HomeCampaignMessage,
  context: HomeCampaignContext,
  activeWindows: Set<string>,
): number | null {
  if (message.windowId && !activeWindows.has(message.windowId)) {
    return null;
  }
  if (message.plans?.length && !message.plans.includes(context.plan)) {
    return null;
  }
  if (
    message.professions?.length &&
    (!context.profession || !message.professions.includes(context.profession))
  ) {
    return null;
  }
  if (
    message.usageModes?.length &&
    (!context.usageMode || !message.usageModes.includes(context.usageMode))
  ) {
    return null;
  }

  let score = message.priority;
  if (message.windowId) {
    score += 1000;
  }
  if (message.professions?.length) {
    score += 20;
  }
  if (message.usageModes?.length) {
    score += 10;
  }
  if (message.plans?.length) {
    score += 5;
  }
  return score;
}

function activeWindowIds(now: Date): Set<string> {
  const ids = new Set<string>();
  for (const window of HOME_CAMPAIGN_WINDOWS) {
    if (windowIsActive(window, now)) {
      ids.add(window.id);
    }
  }
  return ids;
}

function windowIsActive(window: HomeCampaignWindow, now: Date): boolean {
  if (window.recurring) {
    return inRecurringRange(now, window.start, window.end);
  }
  return inAbsoluteRange(now, window.start, window.end);
}

function inAbsoluteRange(now: Date, start: string, end: string): boolean {
  const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    return false;
  }
  return day >= startMs && day <= endMs;
}

function inRecurringRange(now: Date, start: string, end: string): boolean {
  const key = monthDayKey(now.getUTCMonth() + 1, now.getUTCDate());
  const startKey = parseMonthDay(start);
  const endKey = parseMonthDay(end);
  if (startKey == null || endKey == null) {
    return false;
  }
  if (startKey <= endKey) {
    return key >= startKey && key <= endKey;
  }
  return key >= startKey || key <= endKey;
}

function parseMonthDay(value: string): number | null {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return monthDayKey(Number(match[1]), Number(match[2]));
}

function monthDayKey(month: number, day: number): number {
  return month * 100 + day;
}
