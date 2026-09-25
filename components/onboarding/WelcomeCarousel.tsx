"use client";

import { useState, type ReactNode } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type PanInfo,
} from "framer-motion";
import { WELCOME_SLIDES, type WelcomeSlideId } from "@/types/onboarding";
import { SlideProgress } from "./SlideProgress";
import { WelcomeSlide } from "./WelcomeSlide";
import { SlideOneVisual } from "./visuals/SlideOneVisual";
import { SlideTwoVisual } from "./visuals/SlideTwoVisual";
import { SlideThreeVisual } from "./visuals/SlideThreeVisual";

const LAST_INDEX = WELCOME_SLIDES.length - 1;
const DRAG_OFFSET = 56;
const DRAG_VELOCITY = 420;
const SLIDE_EASE = [0.2, 0, 0, 1] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const visuals: Record<WelcomeSlideId, ReactNode> = {
  reflex: <SlideOneVisual />,
  find: <SlideTwoVisual />,
  control: <SlideThreeVisual />,
};

type WelcomeCarouselProps = {
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

export function WelcomeCarousel({
  activeIndex,
  onIndexChange,
}: WelcomeCarouselProps) {
  const [prevIndex, setPrevIndex] = useState(activeIndex);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const spatial = reduceMotion !== true;

  if (activeIndex !== prevIndex) {
    setDirection(activeIndex > prevIndex ? 1 : -1);
    setPrevIndex(activeIndex);
  }

  function goTo(index: number) {
    const next = Math.max(0, Math.min(LAST_INDEX, index));
    if (next !== activeIndex) {
      onIndexChange(next);
    }
  }

  function paginate(delta: 1 | -1) {
    goTo(activeIndex + delta);
  }

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const { offset, velocity } = info;
    const goNext = offset.x < -DRAG_OFFSET || velocity.x < -DRAG_VELOCITY;
    const goPrev = offset.x > DRAG_OFFSET || velocity.x > DRAG_VELOCITY;

    if (goNext) {
      paginate(1);
      return;
    }
    if (goPrev) {
      paginate(-1);
    }
  }

  const slide = WELCOME_SLIDES[activeIndex];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              className="absolute inset-0 touch-pan-y"
              custom={direction}
              variants={spatial ? slideVariants : reducedVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: spatial ? 0.26 : 0,
                ease: SLIDE_EASE,
              }}
              drag={spatial ? "x" : false}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0}
              onDragEnd={spatial ? onDragEnd : undefined}
            >
              <WelcomeSlide slide={slide} visual={visuals[slide.id]} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="shrink-0 py-4">
          <SlideProgress
            total={WELCOME_SLIDES.length}
            activeIndex={activeIndex}
            onChange={goTo}
          />
        </div>
      </div>
    </MotionConfig>
  );
}
