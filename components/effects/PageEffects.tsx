"use client";

import { useEffect, useRef } from "react";
import { clamp, lerp } from "@/lib/motion";
import { useFrame } from "@/hooks/useFrame";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import styles from "./PageEffects.module.css";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/";

/** Re-types a label from random characters to the real text, left to right. */
function scramble(el: Element) {
  const nodes: [Text, string][] = [];
  const walk = (n: Node) => n.childNodes.forEach((c) => (c.nodeType === 3 ? nodes.push([c as Text, c.textContent ?? ""]) : walk(c)));
  walk(el);
  const t0 = performance.now();
  const tick = (t: number) => {
    const k = clamp((t - t0) / 700, 0, 1);
    nodes.forEach(([n, txt]) => {
      const keep = Math.floor(txt.length * k);
      n.textContent = txt.slice(0, keep) + txt.slice(keep).replace(/[^\s·/]/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]);
    });
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Page-wide effects, all switched off for visitors who ask for less motion:
 * reveal on scroll ([data-reveal]), decoding labels ([data-scramble]),
 * a custom cursor and buttons that pull toward it ([data-magnetic]).
 */
export default function PageEffects() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const cursorOn = fine && !reduced;
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: -100, y: -100, rx: -100, ry: -100 });

  // Reveal and scramble.
  useEffect(() => {
    if (reduced || !("IntersectionObserver" in window)) return;
    document.documentElement.setAttribute("data-motion", "");
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          reveal.unobserve(e.target);
        }
      }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 3) * 90}ms`;
      reveal.observe(el);
    });
    const safety = window.setTimeout(() => els.forEach((el) => el.classList.add("in")), 8000);
    const scr = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          scramble(e.target);
          scr.unobserve(e.target);
        }
      }),
      { threshold: 1 }
    );
    document.querySelectorAll("[data-scramble]").forEach((el) => scr.observe(el));
    return () => {
      reveal.disconnect();
      scr.disconnect();
      window.clearTimeout(safety);
    };
  }, [reduced]);

  // Cursor and magnetic buttons.
  useEffect(() => {
    if (!cursorOn) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const onMove = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      const target = e.target as Element;
      cursorRef.current?.classList.toggle(styles.big, !!target.closest?.("a, button, label, [data-cursor-big]"));
      const mag = target.closest?.<HTMLElement>("[data-magnetic]");
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((b) => {
        if (b !== mag) b.style.transform = "";
      });
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 12}px, ${((e.clientY - r.top) / r.height - 0.5) * 10}px)`;
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.classList.remove("has-cursor");
    };
  }, [cursorOn]);

  useFrame(() => {
    const p = pos.current;
    p.rx = lerp(p.rx, p.x, 0.2);
    p.ry = lerp(p.ry, p.y, 0.2);
    if (ringRef.current) ringRef.current.style.transform = `translate(${p.rx}px, ${p.ry}px)`;
    if (dotRef.current) dotRef.current.style.transform = `translate(${p.x}px, ${p.y}px)`;
  }, cursorOn);

  if (!cursorOn) return null;
  return (
    <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
      <span ref={ringRef} className={styles.ring} />
      <span ref={dotRef} className={styles.dot} />
    </div>
  );
}
