import { Search, ShieldCheck } from "lucide-react";

export function SlideThreeVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <article className="flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex h-10 items-center gap-2 rounded-lg bg-surface-container-low px-3">
          <Search
            className="size-4 text-on-surface-variant"
            strokeWidth={1.75}
          />
          <span className="h-2 w-28 rounded-full bg-surface-container-high" />
        </div>

        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="text-[11px] font-medium text-on-surface">Posologie</p>
          <p className="mt-1 text-[10px] text-on-surface-variant">
            Référence médicament
          </p>
          <div className="mt-2 flex gap-1.5">
            <span className="h-1.5 w-16 rounded-full bg-surface-container-high" />
            <span className="h-1.5 w-10 rounded-full bg-surface-container-highest" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2.5">
          <div>
            <p className="text-[11px] font-medium text-on-surface">
              Interaction
            </p>
            <p className="text-[10px] text-on-surface-variant">Vérification</p>
          </div>
          <span className="h-2 w-8 rounded-full bg-surface-container-highest" />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-2.5">
          <div>
            <p className="text-[11px] font-medium text-on-surface">Score</p>
            <p className="text-[10px] text-on-surface-variant">Métrique</p>
          </div>
          <span className="text-[13px] font-semibold text-on-surface">12</span>
        </div>

        <p className="mt-auto flex items-center justify-center gap-1 text-[10px] tracking-wide text-on-surface-variant">
          <ShieldCheck className="size-3" strokeWidth={1.75} />
          Référentiel validé
        </p>
      </article>
    </div>
  );
}
