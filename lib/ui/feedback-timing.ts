import { prefersReducedMotion } from "@/lib/ui/scroll-behavior";

export const TOAST_DWELL_MS = 2800;
export const COPY_LABEL_MS = 2000;
export const TOAST_EXIT_FALLBACK_MS = 120;

export const FAVORITE_SIGN_IN_MESSAGE =
  "Connectez-vous pour gérer vos favoris.";
export const FAVORITE_WRITE_FAILED_MESSAGE =
  "Impossible de modifier les favoris. Réessayez.";
export const FAVORITE_ADDED_MESSAGE = "Ajouté aux favoris";
export const FAVORITE_REMOVED_MESSAGE = "Retiré des favoris";

export function toastExitMs(): number {
  if (typeof window === "undefined" || prefersReducedMotion()) {
    return 0;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--duration-fast")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : TOAST_EXIT_FALLBACK_MS;
}
