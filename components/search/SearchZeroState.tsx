import Link from "next/link";
import { HomeIcon } from "@/components/home/home-icons";
import { ZeroResultCanvas } from "./ZeroResultCanvas";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import { getSearchDemoFixturesSync } from "@/lib/demo-fixtures/load";
import { ZERO_PIVOTS } from "@/lib/search/search-ui-constants";

type SearchZeroStateProps = {
  query: string;
  suggested: boolean;
  onClear: () => void;
  onSuggest: () => void;
};

export function SearchZeroState({
  query,
  suggested,
  onClear,
  onSuggest,
}: SearchZeroStateProps) {
  const demoMode = isDemoContentModeClient();
  const zeroFallbackProtocols = demoMode
    ? (getSearchDemoFixturesSync()?.ZERO_FALLBACK_PROTOCOLS ?? [])
    : [];

  return (
    <div className="flex flex-col gap-5">
      <ZeroResultCanvas
        query={query}
        suggested={suggested}
        onClear={onClear}
        onSuggest={onSuggest}
      />

      <section>
        <div className="mb-2">
          <h2 className="text-headline-sm">Suggestions alternatives</h2>
          <p className="text-label-sm text-on-surface-variant">
            Aide à la décision
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ZERO_PIVOTS.map((pivot) => (
            <Link
              key={pivot.id}
              href={pivot.href}
              className="rounded-xl bg-surface-container-lowest p-4 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low">
                <HomeIcon name={pivot.icon} className="size-4" />
              </span>
              <span className="mt-3 block text-body-md font-medium">
                {pivot.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {demoMode && zeroFallbackProtocols.length > 0 ? (
        <section className="overflow-hidden rounded-xl bg-surface-container">
          <div className="px-4 py-3">
            <h2 className="text-headline-sm">Protocoles les plus consultés</h2>
          </div>
          {zeroFallbackProtocols.map((item, index) => (
            <div key={item.id}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-body-md font-medium">{item.title}</span>
                  {item.footer ? (
                    <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                      {item.footer}
                    </span>
                  ) : null}
                </span>
              </Link>
              {index < zeroFallbackProtocols.length - 1 ? (
                <div className="ml-4 h-px bg-surface-variant" />
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
