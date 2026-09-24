import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BottomActionDockProps = {
  onStart: () => void;
  onLogin: () => void;
};

export function BottomActionDock({ onStart, onLogin }: BottomActionDockProps) {
  return (
    <div className="shrink-0 pb-safe">
      <div className="flex flex-col gap-2.5 pt-3 pb-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          onClick={onStart}
          className={cn(
            "h-[54px] w-full rounded-lg bg-primary text-[16px] font-medium text-on-primary",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          Commencer
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          onClick={onLogin}
          className={cn(
            "h-[50px] w-full rounded-lg bg-surface-container-low text-[16px] font-medium text-on-surface",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          Connexion
        </motion.button>
      </div>
    </div>
  );
}
