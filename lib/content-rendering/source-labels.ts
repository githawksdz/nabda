import type { ContentPayloadSource } from "@/types/content-rendering";

export function payloadSourceDisplayLabel(source: ContentPayloadSource): string {
  if (source === "local_normalized") {
    return "Référentiel source";
  }
  if (source === "supabase") {
    return "Base Nabda";
  }
  return "Données de démonstration";
}
