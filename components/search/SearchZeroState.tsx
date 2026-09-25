import Link from "next/link";
import { HomeIcon } from "@/components/home/home-icons";
import { Surface } from "@/components/ui/Surface";
import { ZeroResultCanvas } from "./ZeroResultCanvas";
import { isDemoContentModeClient } from "@/lib/content-data/content-source-mode";
import { getSearchDemoFixturesSync } from "@/lib/demo-fixtures/load";
import { ZERO_PIVOTS } from "@/lib/search/search-ui-constants";

type SearchZeroStateProps = {
  query: string;
  onClear: () => void;
};

export function SearchZeroState({ query, onClear }: SearchZeroStateProps) {
  const demoMode = isDemoContentModeClient();
  const zeroFallbackProtocols = demoMode
    ? (getSearchDemoFixturesSync()?.ZERO_FALLBACK_PROTOCOLS ?? [])
    : [];

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <ZeroResultCanvas query={query} onClear={onClear} />

      <section aria-labelledby="search-zero-pivots">
        <div className="mb-3">
          <h2 id="search-zero-pivots" className="text-headline-sm">
            Explorer les modules
          </h2>
          <p className="text-label-sm text-text-secondary">
            Accès direct aux référentiels cliniques
          </p>
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2">
          {ZERO_PIVOTS.map((pivot) => (
            <Link key={pivot.id} href={pivot.href} className="min-w-0">
              <Surface
                variant="muted"
                className="flex h-full flex-col gap-2 p-3 hover:bg-surface-container"
              >
                <span className="flex size-9 items-center justify-center rounded-[var(--radius-control)] bg-surface-elevated">
                  <HomeIcon name={pivot.icon} className="size-4" />
                </span>
                <span className="text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
                  {pivot.title}
                </span>
              </Surface>
            </Link>
          ))}
        </div>
      </section>

      {demoMode && zeroFallbackProtocols.length > 0 ? (
        <section aria-labelledby="search-zero-demo-protocols">
          <h2
            id="search-zero-demo-protocols"
            className="mb-2 text-headline-sm"
          >
            Protocoles les plus consultés
          </h2>
          <Surface variant="muted" className="overflow-hidden p-0">
            {zeroFallbackProtocols.map((item, index) => (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 px-4 py-3 hover:bg-surface-container"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-md font-medium text-text-primary [overflow-wrap:anywhere]">
                      {item.title}
                    </span>
                    {item.footer ? (
                      <span className="mt-0.5 block text-body-sm text-text-secondary">
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
          </Surface>
        </section>
      ) : null}
    </div>
  );
}
