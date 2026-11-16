"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/types";
import { clamp, prefersReducedMotion } from "@/lib/motion";
import { useFrame } from "@/hooks/useFrame";
import SectionHead from "@/components/ui/SectionHead";
import styles from "./Process.module.css";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Five numbered steps. As each one reaches the middle of the screen, the terminal types its command and result. */
export default function Process({ steps }: { steps: Step[] }) {
  const [reached, setReached] = useState(-1);
  const listRef = useRef<HTMLOListElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const typed = useRef(-1);
  const queue = useRef<Promise<void>>(Promise.resolve());

  // The terminal body is managed directly so lines can be typed character by character.
  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    const caret = () => {
      const p = document.createElement("p");
      const c = document.createElement("span");
      c.className = styles.caret;
      p.append(c);
      return p;
    };
    term.replaceChildren(caret());
    const still = prefersReducedMotion();

    const typeStep = async (i: number) => {
      const { command, result } = steps[i];
      term.lastElementChild?.remove();
      const cmd = document.createElement("p");
      cmd.className = styles.cmd;
      term.append(cmd);
      if (still) cmd.textContent = command;
      else for (let c = 0; c < command.length; c++) {
        cmd.textContent = command.slice(0, c + 1);
        await wait(18);
      }
      const dim = document.createElement("p");
      dim.className = styles.dim;
      dim.textContent = "  running…";
      term.append(dim);
      await wait(still ? 0 : 450);
      dim.remove();
      const ok = document.createElement("p");
      ok.className = styles.ok;
      ok.textContent = result;
      term.append(ok, caret());
      while (term.children.length > 14) term.firstElementChild?.remove();
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = Number((e.target as HTMLElement).dataset.step);
        setReached((r) => Math.max(r, i));
        while (typed.current < i) {
          typed.current++;
          const n = typed.current;
          queue.current = queue.current.then(() => typeStep(n));
        }
      }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    Array.from(listRef.current?.querySelectorAll("[data-step]") ?? []).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps]);

  useFrame(() => {
    const list = listRef.current;
    if (!list || !railRef.current) return;
    const r = list.getBoundingClientRect();
    railRef.current.style.height = `${clamp((window.innerHeight * 0.5 - r.top) / r.height, 0, 1) * 100}%`;
  });

  return (
    <section className="section" id="process">
      <div className="wrap">
        <SectionHead
          sheet={4}
          label="Assembly instructions"
          title="Five steps from idea to running system."
          text="Clear steps, fixed checkpoints and working software every two weeks, so you always know what is done and what is next."
        />
        <div className={styles.grid}>
          <div className={styles.stepsWrap}>
          <span className={styles.rail} aria-hidden="true">
            <i ref={railRef} />
          </span>
          <ol ref={listRef} className={styles.steps}>
            {steps.map((s, i) => (
              <li key={s.title} data-step={i} className={`${styles.step} ${i <= reached ? styles.done : ""}`}>
                <span className={styles.num}>{i + 1}</span>
                <p className={`mono ${styles.time}`}>{s.time}</p>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          </div>
          <div className={styles.terminal} aria-hidden="true">
            <div className={`mono ${styles.bar}`}>
              <span className={styles.dots}>
                <i />
                <i />
                <i />
              </span>
              <span>assemble &mdash; project log</span>
            </div>
            <div ref={termRef} className={styles.body} />
          </div>
        </div>
      </div>
    </section>
  );
}
