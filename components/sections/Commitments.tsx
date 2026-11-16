"use client";

import { useEffect, useRef } from "react";
import type { Commitment } from "@/lib/types";
import { clamp, easeOut, prefersReducedMotion } from "@/lib/motion";
import styles from "./Commitments.module.css";

/** Four promises with numbers that count up once when they scroll into view. */
export default function Commitments({ items }: { items: Commitment[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    const frames: number[] = [];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        root.querySelectorAll<HTMLElement>("b[data-count]").forEach((b) => {
          const end = Number(b.dataset.count);
          const dec = Number(b.dataset.dec ?? 0);
          const suffix = b.dataset.suffix ?? "";
          const t0 = performance.now();
          const step = (t: number) => {
            const k = clamp((t - t0) / 1400, 0, 1);
            b.textContent = (end * easeOut(k)).toFixed(dec) + suffix;
            if (k < 1) frames.push(requestAnimationFrame(step));
          };
          frames.push(requestAnimationFrame(step));
        });
      },
      { threshold: 0.4 }
    );
    io.observe(root);
    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <section className={`wrap ${styles.section}`} aria-label="What you can count on">
      <div ref={ref} className={styles.grid} data-reveal="">
        {items.map((c) => (
          <div key={c.label} className={styles.item}>
            <b data-count={c.count} data-dec={c.decimals} data-suffix={c.suffix}>
              {c.value}
            </b>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
