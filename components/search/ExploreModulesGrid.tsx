import Link from "next/link";
import { Compass } from "lucide-react";
import { HomeIcon } from "@/components/home/home-icons";
import type { ExploreModule } from "@/types/search";

type ExploreModulesGridProps = {
  modules: ExploreModule[];
};

export function ExploreModulesGrid({ modules }: ExploreModulesGridProps) {
  const featured = modules.find((module) => module.featured);
  const rest = modules.filter((module) => !module.featured);
  const halves = rest.slice(0, 2);
  const compact = rest.slice(2);

  return (
    <section>
      <div className="mb-2 flex items-center gap-1.5">
        <Compass className="size-4 text-on-surface-variant" strokeWidth={1.75} />
        <h2 className="text-headline-sm">Explorer par module</h2>
      </div>
      <div className="flex flex-col gap-2">
        {featured ? (
          <Link
            href={featured.href}
            className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-sm"
          >
            <span className="text-label-sm text-on-surface-variant">
              {featured.label}
            </span>
            <span className="mt-1 block text-headline-sm">{featured.title}</span>
            <span className="mt-1 block text-body-sm text-on-surface-variant">
              {featured.subtitle}
            </span>
            <span className="mt-3 flex size-10 items-center justify-center rounded-lg bg-surface-container-low">
              <HomeIcon name={featured.icon} className="size-5" />
            </span>
            <span className="pointer-events-none absolute -right-6 -bottom-8 size-28 rounded-full bg-surface-container-high/70" />
          </Link>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {halves.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              className="rounded-xl bg-surface-container-lowest p-4 shadow-sm"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-container-low">
                <HomeIcon name={module.icon} className="size-4" />
              </span>
              <span className="mt-3 block text-body-md font-medium">{module.title}</span>
              <span className="mt-1 block text-body-sm text-on-surface-variant">
                {module.subtitle}
              </span>
            </Link>
          ))}
        </div>
        {compact.map((module) => (
          <Link
            key={module.id}
            href={module.href}
            className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-surface-container-low">
              <HomeIcon name={module.icon} className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-body-md font-medium">{module.title}</span>
              <span className="mt-0.5 block text-body-sm text-on-surface-variant">
                {module.subtitle}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
