/**
 * Calculator content provider. Runtime: Supabase only.
 */

import { loadCalculatorRenderSourceFromSupabase } from "@/lib/content-data/source-payload-supabase";
import {
  activationStateForLinkMode,
  isSourceRenderAllowed,
  payloadSourceLabel,
} from "@/lib/content-data/content-source";
import type {
  CalculatorRenderData,
  ContentRenderOptions,
} from "@/types/content-rendering";

export async function getCalculatorRenderData(
  slug: string,
  options: ContentRenderOptions,
): Promise<CalculatorRenderData | null> {
  if (!isSourceRenderAllowed(options.linkMode)) {
    return null;
  }

  const fromSupabase = await loadCalculatorRenderSourceFromSupabase(slug);
  if (!fromSupabase) {
    return null;
  }

  return {
    ...fromSupabase,
    payloadSource: payloadSourceLabel("supabase"),
    activationState: activationStateForLinkMode(options.linkMode),
  };
}
