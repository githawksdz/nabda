import { useState } from "react";
import { X } from "lucide-react";
import { Drawer } from "vaul";
import type { AuthMode } from "@/types/onboarding";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

const SNAP_POINTS = [0.6, 0.86];

type AuthDrawerProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthDrawer({ mode, onModeChange }: AuthDrawerProps) {
  const open = mode !== null;
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const [wasOpen, setWasOpen] = useState(open);
  const [displayedMode, setDisplayedMode] = useState<"login" | "register">(
    mode ?? "login",
  );

  if (mode && mode !== displayedMode) {
    setDisplayedMode(mode);
  }

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setSnap(SNAP_POINTS[0]);
    }
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onModeChange(null);
        }
      }}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
      setBackgroundColorOnScale={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[var(--z-backdrop)] bg-black/35 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed right-0 bottom-0 left-0 z-[var(--z-sheet)] mx-auto flex h-full max-h-[97%] max-w-[430px] flex-col rounded-t-[24px] bg-surface-container-lowest outline-none">
          <div className="relative flex shrink-0 items-center justify-center pt-3 pb-1">
            <Drawer.Handle className="!mx-0 !h-1 !w-9 !bg-surface-container-highest" />
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => onModeChange(null)}
              className="absolute top-2 right-3 flex size-9 items-center justify-center rounded-full text-on-surface-variant"
            >
              <X className="size-4" strokeWidth={1.75} />
            </button>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pt-2 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
            {displayedMode === "login" ? (
              <LoginForm onSwitchToRegister={() => onModeChange("register")} />
            ) : null}
            {displayedMode === "register" ? (
              <RegisterForm onSwitchToLogin={() => onModeChange("login")} />
            ) : null}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
