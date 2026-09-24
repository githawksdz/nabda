import { FrequentSearchChips } from "./FrequentSearchChips";
import { RecentConsultations } from "./RecentConsultations";
import { ExploreModulesGrid } from "./ExploreModulesGrid";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import { getSearchDemoFixturesSync } from "@/lib/demo-fixtures/load";
import {
  EXPLORE_MODULES,
  FREQUENT_SEARCHES,
} from "@/lib/search/search-ui-constants";
import type { FrequentSearchChip } from "@/types/search";

type SearchInitialStateProps = {
  recentsCleared: boolean;
  onClearRecents: () => void;
  onFrequent: (chip: FrequentSearchChip) => void;
};

export function SearchInitialState({
  recentsCleared,
  onClearRecents,
  onFrequent,
}: SearchInitialStateProps) {
  const demoMode = isDemoContentModeClient();
  const recentConsultations = demoMode
    ? (getSearchDemoFixturesSync()?.RECENT_CONSULTATIONS ?? [])
    : [];

  return (
    <div className="flex flex-col gap-5">
      <FrequentSearchChips chips={FREQUENT_SEARCHES} onSelect={onFrequent} />
      {demoMode ? (
        <RecentConsultations
          items={recentConsultations}
          cleared={recentsCleared}
          onClear={onClearRecents}
        />
      ) : null}
      <ExploreModulesGrid modules={EXPLORE_MODULES} />
    </div>
  );
}
