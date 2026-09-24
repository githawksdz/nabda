/**
 * CAT content provider. Runtime: Supabase only.
 */

import { loadCatRenderSourceFromSupabase } from "@/lib/content-data/source-payload-supabase";
import {
  activationStateForLinkMode,
  isSourceRenderAllowed,
  keepInternalQueryFromOptions,
  payloadSourceLabel,
} from "@/lib/content-data/content-source";
import type { CatRenderData, ContentRenderOptions } from "@/types/content-rendering";

export async function getCatRenderData(
  slug: string,
  options: ContentRenderOptions,
): Promise<CatRenderData | null> {
  if (!isSourceRenderAllowed(options.linkMode)) {
    return null;
  }

  const keepInternalQuery = keepInternalQueryFromOptions(
    options.linkMode,
    options.keepInternalQuery,
  );

  const fromSupabase = await loadCatRenderSourceFromSupabase(
    slug,
    keepInternalQuery,
    options.linkMode,
  );
  if (
    !fromSupabase ||
    (!fromSupabase.hasExtractedLinearSteps && fromSupabase.images.length === 0)
  ) {
    return null;
  }

  return {
    ...fromSupabase,
    payloadSource: payloadSourceLabel("supabase"),
    activationState: activationStateForLinkMode(options.linkMode),
  };
}
