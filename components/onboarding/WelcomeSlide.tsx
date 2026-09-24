import type { ReactNode } from "react";
import type { WelcomeSlideData } from "@/types/onboarding";

type WelcomeSlideProps = {
  slide: WelcomeSlideData;
  visual: ReactNode;
};

export function WelcomeSlide({ slide, visual }: WelcomeSlideProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-2">
      <div className="flex w-full max-w-[320px] max-h-[340px] aspect-[3/4] items-center justify-center">
        {visual}
      </div>
      <h2 className="mt-5 text-center text-[22px] font-semibold leading-tight tracking-tight text-on-surface">
        {slide.title}
      </h2>
      <p className="mt-2 max-w-[300px] text-center text-[14px] leading-snug text-on-surface-variant">
        {slide.subtitle}
      </p>
    </div>
  );
}
