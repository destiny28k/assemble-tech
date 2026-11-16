"use client";

import { useEffect, useRef } from "react";
import { SERVICE_DRAWINGS } from "@/lib/drawings";
import styles from "./ServiceDrawings.module.css";

const map = styles as Record<string, string>;

/** Swap the short class tokens in the stored SVG for this module's real class names. */
const withModuleClasses = (svg: string) =>
  svg.replace(/class="([^"]+)"/g, (_, names: string) => `class="${names.split(" ").map((n) => map[n] ?? n).join(" ")}"`);

const DRAWINGS = SERVICE_DRAWINGS.map(withModuleClasses);

/** Six technical drawings stacked on top of each other; only the active one is shown and drawn. */
export default function ServiceDrawings({ active }: { active: number }) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Stagger the line drawing so each drawing builds up piece by piece.
  useEffect(() => {
    rootRef.current?.querySelectorAll(`.${styles.vis}`).forEach((vis) => {
      vis.querySelectorAll<SVGElement>(`.${styles.d}`).forEach((el, i) => {
        el.style.transitionDelay = `${i * 70}ms`;
      });
    });
  }, []);

  return (
    <div ref={rootRef}>
      {DRAWINGS.map((svg, i) => (
        <div key={i} className={`${styles.vis} ${i === active ? styles.on : ""}`}>
          <svg viewBox="0 0 480 400" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      ))}
    </div>
  );
}
