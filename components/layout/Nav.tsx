"use client";

import { useRef } from "react";
import { COMPANY, NAV } from "@/lib/content";
import { useFrame } from "@/hooks/useFrame";
import Button from "@/components/ui/Button";
import styles from "./Nav.module.css";

/** Fixed header: hides while scrolling down, comes back on scroll up, turns solid after the top. */
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useFrame((_t, _dt, { y, v }) => {
    const nav = navRef.current;
    if (nav) {
      nav.classList.toggle(styles.solid, y > 40);
      if (v > 40 && y > 300) nav.classList.add(styles.hide);
      else if (v < -40 || y < 300) nav.classList.remove(styles.hide);
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  });

  return (
    <>
      <div ref={barRef} className={styles.progress} aria-hidden="true" />
      <header ref={navRef} className={styles.nav}>
        <div className={styles.inner}>
          <a className={styles.brand} href="#top" aria-label={`${COMPANY}, back to top`}>
            <span className={styles.mark} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            {COMPANY}
          </a>
          <nav className={`mono ${styles.links}`} aria-label="Main">
            {NAV.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
          <Button href="#contact" arrow className={styles.cta}>
            Start a project
          </Button>
        </div>
      </header>
    </>
  );
}
