"use client";

import { useRef } from "react";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import styles from "./Ticker.module.css";

/** Two rows of technology names moving in opposite directions, faster while the page scrolls. */
export default function Ticker({ items }: { items: string[] }) {
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const x = useRef([0, 0]);
  const reduced = useReducedMotion();
  const reversed = [...items].reverse();

  useFrame((_t, dt, { vel }) => {
    [rowA.current, rowB.current].forEach((el, i) => {
      if (!el) return;
      const half = el.scrollWidth / 2 || 1;
      const dir = i ? 1 : -1;
      let v = x.current[i] + dir * (40 + Math.abs(vel) * 0.35) * dt;
      v = ((v % half) - half) % half;
      x.current[i] = v;
      el.style.transform = `translate3d(${v.toFixed(1)}px,0,0)`;
    });
  }, !reduced);

  return (
    <div className={styles.ticker} aria-label="Technologies we build with">
      <div ref={rowA} className={styles.row}>
        {[...items, ...items].map((s, i) => (
          <span key={i} aria-hidden={i >= items.length || undefined}>{s}</span>
        ))}
      </div>
      <div ref={rowB} className={`${styles.row} ${styles.outline}`} aria-hidden="true">
        {[...reversed, ...reversed].map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  );
}
