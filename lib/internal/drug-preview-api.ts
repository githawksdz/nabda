/**
 * Server-only loader for internal drug monograph preview.
 * Shared disk cache lives in lib/internal/drug-local.
 */

export {
  getDrugPreviewBySlug,
  getDrugPreviewIndex,
  isAllowedDrugPreviewMedia,
  resolveDrugPreviewMediaPath,
} from "@/lib/internal/drug-local";
