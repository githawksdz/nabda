/**
 * Internal preview catalog / diagnostics types.
 * Shared/public renderers must not import this file.
 */

import type { CalculatorRenderIndexItem } from "@/types/content-rendering-calculator";

export type CalculatorPreviewFilter =
  | "tous"
  | "tap_score"
  | "urgence"
  | "numeric_formula"
  | "checklist"
  | "date"
  | "dosing_locked"
  | "a_adapter";

export type CalculatorPreviewGroupBy = "ux" | "risk" | "specialty" | "language";

export type CalculatorPreviewMetrics = {
  total: number;
  tapScore: number;
  emergency: number;
  numeric: number;
  locked: number;
  rawJs: number;
  demos: number;
  french: number;
};

export type { CalculatorRenderIndexItem };
