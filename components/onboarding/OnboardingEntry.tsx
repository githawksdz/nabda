"use client";

import { useState } from "react";
import { WELCOME_SLIDES, type AuthMode } from "@/types/onboarding";
import { AuthDrawer } from "./AuthDrawer";
import { BottomActionDock } from "./BottomActionDock";
import { WelcomeCarousel } from "./WelcomeCarousel";

export function OnboardingEntry() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  return (
    <main className="min-h-dvh overflow-hidden bg-background text-on-surface">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 pt-safe pb-safe">
        <header className="flex h-12 shrink-0 items-center justify-between">
          <span className="text-[15px] font-semibold tracking-tight">
            Nabda
          </span>
          <button
            type="button"
            onClick={() => setActiveIndex(WELCOME_SLIDES.length - 1)}
            className="text-[14px] text-on-surface-variant"
          >
            Passer
          </button>
        </header>
        <WelcomeCarousel
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
        />
        <BottomActionDock
          onStart={() => setAuthMode("register")}
          onLogin={() => setAuthMode("login")}
        />
      </div>
      <AuthDrawer mode={authMode} onModeChange={setAuthMode} />
    </main>
  );
}
