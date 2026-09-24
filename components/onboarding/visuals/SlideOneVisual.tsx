import { Activity, Calculator, Pill } from "lucide-react";

export function SlideOneVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-x-8 top-7 h-[78%] rounded-xl bg-surface-container-high"
      />
      <div
        aria-hidden
        className="absolute inset-x-5 top-10 h-[78%] rounded-xl bg-surface-container"
      />
      <article className="relative flex h-[86%] w-[88%] flex-col rounded-xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-surface-container-low">
            <Activity className="size-4 text-on-surface" strokeWidth={1.75} />
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-wide text-on-surface">
              Nabda
            </span>
            <span className="text-[10px] text-on-surface-variant">
              Espace clinique
            </span>
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-2">
          <li className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-surface-container-lowest">
              <Activity
                className="size-3.5 text-on-surface-variant"
                strokeWidth={1.75}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-on-surface">
                Protocoles CAT
              </p>
              <p className="h-1.5 w-16 rounded-full bg-surface-container-high" />
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-surface-container-lowest">
              <Pill
                className="size-3.5 text-on-surface-variant"
                strokeWidth={1.75}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-on-surface">
                Médicaments
              </p>
              <p className="h-1.5 w-20 rounded-full bg-surface-container-high" />
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-lg bg-surface-container-low px-3 py-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-surface-container-lowest">
              <Calculator
                className="size-3.5 text-on-surface-variant"
                strokeWidth={1.75}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-on-surface">
                Scores
              </p>
              <p className="h-1.5 w-12 rounded-full bg-surface-container-high" />
            </div>
          </li>
        </ul>

        <p className="mt-3 text-center text-[10px] tracking-wide text-on-surface-variant">
          Référence validée
        </p>
      </article>
    </div>
  );
}
