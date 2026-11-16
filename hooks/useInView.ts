"use client";

import { useEffect, useRef, type RefObject } from "react";

/** A ref that is true while the element is on screen. A ref, not state, so animation loops can read it without re-rendering. */
export function useInViewRef(target: RefObject<Element | null>, rootMargin = "0px"): RefObject<boolean> {
  const visible = useRef(false);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      visible.current = entries[0].isIntersecting;
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [target, rootMargin]);
  return visible;
}
