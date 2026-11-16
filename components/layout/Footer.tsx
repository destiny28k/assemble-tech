"use client";

import { useRef } from "react";
import { COMPANY, TITLE_BLOCK } from "@/lib/content";
import { clamp, easeOut } from "@/lib/motion";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import styles from "./Footer.module.css";

const WORD = "ASSEMBLE".split("");
// Where each letter starts before it flies into place.
const OFFSETS = WORD.map((_, i) => ({ x: (i - 3.5) * 60 + (i % 2 ? 40 : -40), y: 120 + (i % 3) * 60, r: (i % 2 ? 1 : -1) * (20 + i * 4) }));

/** A giant ASSEMBLE whose letters fly into place as the footer scrolls in, over an engineering title block. */
export default function Footer() {
  const giantRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useFrame(() => {
    const giant = giantRef.current;
    if (!giant) return;
    const r = giant.getBoundingClientRect();
    const u = 1 - easeOut(clamp((window.innerHeight - r.top) / (window.innerHeight * 0.75), 0, 1));
    Array.from(giant.children).forEach((el, i) => {
      const o = OFFSETS[i];
      (el as HTMLElement).style.transform = `translate(${(o.x * u).toFixed(1)}px, ${(o.y * u).toFixed(1)}px) rotate(${(o.r * u).toFixed(1)}deg)`;
    });
  }, !reduced);

  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div ref={giantRef} className={`display ${styles.giant}`} aria-hidden="true">
          {WORD.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>
        <div className={styles.titleblock}>
          {TITLE_BLOCK.map((t) => (
            <div key={t.label}>
              <span className="mono">{t.label}</span>
              <b>{t.value}</b>
            </div>
          ))}
        </div>
        <p className={`mono ${styles.copy}`}>&copy; {COMPANY}. ERP, web, mobile, cloud and automation.</p>
      </div>
    </footer>
  );
}
