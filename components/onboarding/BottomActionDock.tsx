import { cn } from "@/lib/utils";

type BottomActionDockProps = {
  onStart: () => void;
  onLogin: () => void;
};

export function BottomActionDock({ onStart, onLogin }: BottomActionDockProps) {
  return (
    <div className="shrink-0 pb-safe">
      <div className="flex flex-col gap-2.5 pt-3 pb-2">
        <button
          type="button"
          onClick={onStart}
          className={cn(
            "motion-press h-[54px] w-full rounded-lg bg-primary text-[16px] font-medium text-on-primary",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          Commencer
        </button>
        <button
          type="button"
          onClick={onLogin}
          className={cn(
            "motion-press h-[50px] w-full rounded-lg bg-surface-container-low text-[16px] font-medium text-on-surface",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          Connexion
        </button>
      </div>
    </div>
  );
}
