"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceOption } from "@/lib/types";
import { onBuild } from "@/lib/events";
import { lerp } from "@/lib/motion";
import { useFrame } from "@/hooks/useFrame";
import { useFinePointer, useReducedMotion } from "@/hooks/useMediaQuery";
import { SheetLabel } from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import styles from "./Contact.module.css";

const HEADLINE = "Let’s assemble something.";

/** The brief form. Letters of the headline lean away from the cursor; "Send this build" fills the form in. */
export default function Contact({ options }: { options: ServiceOption[] }) {
  const [services, setServices] = useState<string[]>(["erp"]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const offsets = useRef(HEADLINE.split("").map(() => ({ x: 0, y: 0 })));
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(
    () =>
      onBuild(({ services: s, message: m }) => {
        setServices(s);
        if (m) setMessage(m);
      }),
    []
  );

  useFrame(() => {
    const chars = headRef.current?.querySelectorAll<HTMLElement>("[data-ch]");
    if (!chars) return;
    const m = mouse.current;
    chars.forEach((c) => {
      const i = Number(c.dataset.ch);
      const r = c.getBoundingClientRect();
      const dx = r.left + r.width / 2 - m.x;
      const dy = r.top + r.height / 2 - m.y;
      const d = Math.hypot(dx, dy);
      const f = d < 160 ? 1 - d / 160 : 0;
      const o = offsets.current[i];
      o.x = lerp(o.x, d ? (dx / d) * f * 26 : 0, 0.18);
      o.y = lerp(o.y, d ? (dy / d) * f * 26 : 0, 0.18);
      c.style.transform = `translate(${o.x.toFixed(1)}px, ${o.y.toFixed(1)}px) rotate(${(o.x * 0.4).toFixed(1)}deg)`;
      c.classList.toggle(styles.hot, f > 0.35);
    });
  }, fine && !reduced);

  return (
    <section
      className={`section dark ${styles.section}`}
      id="contact"
      onPointerMove={(e) => (mouse.current = { x: e.clientX, y: e.clientY })}
      onPointerLeave={() => (mouse.current = { x: -9999, y: -9999 })}
    >
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.intro}>
          <SheetLabel sheet={6} label="Order form" dark />
          <h2 ref={headRef} className={`display ${styles.kinetic}`} aria-label={HEADLINE}>
            {/* Letters are grouped per word so the line can only break between words, never mid-word */}
            {HEADLINE.split(" ").map((word, w, words) => {
              const start = words.slice(0, w).reduce((n, x) => n + x.length + 1, 0);
              return (
                <span key={w}>
                  <span className={styles.word} aria-hidden="true">
                    {word.split("").map((ch, j) => (
                      <span key={j} data-ch={start + j} className={styles.ch}>
                        {ch}
                      </span>
                    ))}
                  </span>
                  {w < words.length - 1 && " "}
                </span>
              );
            })}
          </h2>
          <p className={styles.lead}>Tell us what you need and roughly when. A senior engineer replies within one working day with questions or a first plan.</p>
        </div>

        <form
          className={styles.form}
          data-reveal=""
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className={styles.field}>
            <span className="mono">What do you need?</span>
            <div className={styles.chips}>
              {options.map((o) => (
                <label key={o.id}>
                  <input
                    type="checkbox"
                    id={`need-${o.id}`}
                    checked={services.includes(o.id)}
                    onChange={(e) => setServices((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.two}>
            <label className={styles.field}>
              <span className="mono">Your name</span>
              <input id="f-name" type="text" required autoComplete="off" placeholder="Full name" />
            </label>
            <label className={styles.field}>
              <span className="mono">Company</span>
              <input id="f-company" type="text" autoComplete="off" placeholder="Company name" />
            </label>
          </div>
          <div className={styles.two}>
            <label className={styles.field}>
              <span className="mono">Email or phone</span>
              <input id="f-contact" type="text" required autoComplete="off" placeholder="How we reach you" />
            </label>
            <label className={styles.field}>
              <span className="mono">Timeline</span>
              <select id="f-when" defaultValue="In 1 to 3 months">
                {["As soon as possible", "In 1 to 3 months", "In 3 to 6 months", "Just exploring"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span className="mono">A line about the project</span>
            <textarea id="f-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="We run 3 warehouses and track stock in spreadsheets…" />
          </label>
          <div>
            <Button type="submit" onDark arrow>Send the brief</Button>
          </div>
          {sent && <p className={`mono ${styles.sent}`}>Brief received. On the live site this goes straight to the team.</p>}
        </form>
      </div>
    </section>
  );
}
