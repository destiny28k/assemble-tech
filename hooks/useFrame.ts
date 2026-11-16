"use client";

import { useEffect, useRef } from "react";
import { subscribeFrame, type FrameCallback } from "@/lib/motion";

/** Runs the callback on every frame of the shared animation loop while enabled. */
export function useFrame(callback: FrameCallback, enabled = true) {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  useEffect(() => {
    if (!enabled) return;
    return subscribeFrame((t, dt, s) => ref.current(t, dt, s));
  }, [enabled]);
}
