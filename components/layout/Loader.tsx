"use client";

import { useEffect, useRef, useState } from "react";
import { clamp, pad, prefersReducedMotion } from "@/lib/motion";
import { getPartCount } from "@/lib/events";
import styles from "./Loader.module.css";

/** "Assembling 2,400 parts" counter that slides away after about a second. */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let raf = 0;
    let timer = 0;
    if (prefersReducedMotion()) {
      timer = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(timer);
    }
    const start = performance.now();
    const tick = (t: number) => {
      const k = clamp((t - start) / 1100, 0, 1);
      const total = getPartCount() || 2400;
      if (textRef.current) textRef.current.textContent = `Assembling ${pad(Math.round(total * k), 4)} / ${total} parts`;
      if (barRef.current) barRef.current.style.width = `${k * 100}%`;
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        ref.current?.classList.add(styles.done);
        timer = window.setTimeout(() => setGone(true), 1200);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={ref} className={styles.loader} aria-hidden="true">
      <div className={`mono ${styles.inner}`}>
        <span ref={textRef}>Assembling 0000 parts</span>
        <div className={styles.bar}>
          <i ref={barRef} />
        </div>
      </div>
    </div>
  );
}
