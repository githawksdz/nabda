/**
 * User-initiated scrolling that follows prefers-reduced-motion.
 * Call from click and effect handlers. Do not call during server render.
 */

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") {
    return "auto";
  }
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function scrollElementIntoView(
  element: Element,
  options?: Omit<ScrollIntoViewOptions, "behavior">,
): void {
  element.scrollIntoView({
    ...options,
    behavior: preferredScrollBehavior(),
  });
}

export function preferredMotionDuration(normalDuration: number): number {
  if (typeof window === "undefined" || prefersReducedMotion()) {
    return 0;
  }
  return normalDuration;
}

export function scrollWindowTo(options: Omit<ScrollToOptions, "behavior">): void {
  if (typeof window === "undefined") {
    return;
  }
  window.scrollTo({
    ...options,
    behavior: preferredScrollBehavior(),
  });
}
