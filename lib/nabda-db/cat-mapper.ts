import type { CatIdentity, NabdaDbGuideline } from "@/lib/nabda-db/source-types";
import {
  mapGuidelineToCatIdentity,
  shouldMapGuidelineToCat,
} from "@/lib/nabda-db/protocol-mapper";

/** Identity only. Does not create cat_blocks or cat_edges. */
export function mapCatIdentity(source: NabdaDbGuideline): CatIdentity | null {
  return mapGuidelineToCatIdentity(source);
}

export { shouldMapGuidelineToCat };
