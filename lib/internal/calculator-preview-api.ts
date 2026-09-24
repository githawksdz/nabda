/**
 * Server-only loader for the internal calculator catalog preview.
 * Shared disk cache lives in lib/internal/calculator-local.
 */

export {
  getCalculatorPreviewBySlug,
  getCalculatorPreviewIndex,
} from "@/lib/internal/calculator-local";
