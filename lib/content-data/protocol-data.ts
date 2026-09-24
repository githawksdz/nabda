/**
 * Protocol content provider. Runtime: Supabase only.
 */

import { loadProtocolRenderSourceFromSupabase } from "@/lib/content-data/source-payload-supabase";
import {
  activationStateForLinkMode,
  isSourceRenderAllowed,
  payloadSourceLabel,
} from "@/lib/content-data/content-source";
import type { ContentRenderOptions, ProtocolRenderData } from "@/types/content-rendering";

export async function getProtocolRenderData(
  slug: string,
  options: ContentRenderOptions,
): Promise<ProtocolRenderData | null> {
  if (!isSourceRenderAllowed(options.linkMode)) {
    return null;
  }

  const fromSupabase = await loadProtocolRenderSourceFromSupabase(slug);
  if (!fromSupabase || fromSupabase.sections.length === 0) {
    return null;
  }

  return {
    ...fromSupabase,
    payloadSource: payloadSourceLabel("supabase"),
    activationState: activationStateForLinkMode(options.linkMode),
  };
}
