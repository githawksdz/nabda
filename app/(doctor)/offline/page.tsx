import { Suspense } from "react";
import { OfflineManagerPage } from "@/components/offline/OfflineManagerPage";
import { InstantIndexChrome } from "@/components/app/instant-chromes";

export const dynamic = "force-dynamic";

export default function OfflinePage() {
  return (
    <Suspense fallback={<InstantIndexChrome href="/offline" />}>
      <OfflineManagerPage />
    </Suspense>
  );
}
