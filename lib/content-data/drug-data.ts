/**
 * Drug content provider. Runtime: Supabase only.
 */

import { loadDrugRenderSourceFromSupabase } from "@/lib/content-data/source-payload-supabase";
import {
  activationStateForLinkMode,
  isSourceRenderAllowed,
  payloadSourceLabel,
} from "@/lib/content-data/content-source";
import type { ContentRenderOptions, DrugRenderData } from "@/types/content-rendering";

export async function getDrugRenderData(
  slug: string,
  options: ContentRenderOptions,
): Promise<DrugRenderData | null> {
  if (!isSourceRenderAllowed(options.linkMode)) {
    return null;
  }

  const fromSupabase = await loadDrugRenderSourceFromSupabase(slug);
  if (!fromSupabase || fromSupabase.sections.length === 0) {
    return null;
  }

  return {
    ...fromSupabase,
    payloadSource: payloadSourceLabel("supabase"),
    activationState: activationStateForLinkMode(options.linkMode),
  };
}
