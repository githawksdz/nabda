import { HomeClinicalSection } from "@/components/home/HomeClinicalSection";
import { HomeIdentityBar } from "@/components/home/HomeIdentityBar";
import { HomeResumeSection } from "@/components/home/HomeResumeSection";
import { HomePromotionalSlotView } from "@/components/promotions/HomePromotionalSlotView";
import { Surface } from "@/components/ui/Surface";
import type { ClinicalFeedItem } from "@/lib/home/clinical-feed";
import { HOME_CHROME } from "@/lib/home/home-ui-config";
import type { HomePromotionalSlot } from "@/lib/promotions/resolve-home-promotion";
import type { HomeUser } from "@/types/home";
import type { HistoryItem } from "@/types/personal";

type HomeDashboardProps = {
  user: HomeUser;
  feedUnavailable?: boolean;
  resumeItem?: HistoryItem | null;
  clinicalItems?: ClinicalFeedItem[];
  promotionalSlot?: HomePromotionalSlot;
};

export function HomeDashboard({
  user,
  feedUnavailable = false,
  resumeItem = null,
  clinicalItems = [],
  promotionalSlot = null,
}: HomeDashboardProps) {
  return (
    <div className="layout-reading flex flex-col gap-6 pt-1 lg:gap-8">
      <HomeIdentityBar user={user} />

      {feedUnavailable ? (
        <Surface variant="muted" className="py-3" role="status">
          <p className="text-body-sm text-text-secondary">
            {HOME_CHROME.feedUnavailable}
          </p>
        </Surface>
      ) : null}

      <HomeResumeSection item={resumeItem} />

      <HomePromotionalSlotView slot={promotionalSlot} />

      <HomeClinicalSection items={clinicalItems} />
    </div>
  );
}
