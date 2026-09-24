import type { NabdaCalculatorRisk } from "@/types/nabda-calculator-analysis";

type CalculatorLockedNoticeProps = {
  /** @deprecated Lock UX removed; kept for call-site compatibility. */
  locked?: boolean;
  risk?: NabdaCalculatorRisk;
  /** Soft note that a specialty formula engine is still pending. */
  enginePending?: boolean;
};

/**
 * Product decision: do not show “locked / non activé / unavailable” for verified calculators.
 * Risk remains informational only. Pending specialty engines get a soft status, not a lock.
 */
export function CalculatorLockedNotice({
  risk,
  enginePending = false,
}: CalculatorLockedNoticeProps) {
  if (!enginePending) return null;

  return (
    <aside
      role="status"
      className="rounded-xl bg-surface-container-low px-3.5 py-3 text-on-surface"
    >
      <p className="text-label-md">Moteur formule en cours d&apos;intégration</p>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {risk === "high"
          ? "Références et schéma disponibles. Le calcul interactif sera branché via un moteur TypeScript dédié (aucun script source exécuté)."
          : "Références et schéma disponibles. Calcul interactif dès qu’un moteur typé est branché (aucun script source exécuté)."}
      </p>
    </aside>
  );
}
