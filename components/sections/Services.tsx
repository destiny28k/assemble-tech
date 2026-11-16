"use client";

import { useEffect, useRef, useState } from "react";
import type { Service } from "@/lib/types";
import SectionHead from "@/components/ui/SectionHead";
import ServiceDrawings from "./ServiceDrawings";
import styles from "./Services.module.css";

/** The parts list: six services, with a technical drawing that redraws itself for the one in view. */
export default function Services({ services }: { services: Service[] }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = Array.from(listRef.current?.children ?? []);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.part))),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = services[active];

  return (
    <section className="section" id="services">
      <div className="wrap">
        <SectionHead
          sheet={2}
          label="Parts list"
          title={<>Six parts.<br />One working system.</>}
          text="Take one part or the whole set. Every part we build is made to connect to the others, so your ERP, website and apps share the same data."
        />
        <div className={styles.grid}>
          <div className={`grid-bg ${styles.drawing}`} aria-hidden="true">
            <ServiceDrawings active={active} />
            <div className={`mono ${styles.tb}`}>
              <span>{current.no} &middot; {current.title}</span>
              <span>Scale 1:1</span>
              <span>Rev A</span>
            </div>
          </div>
          <ol ref={listRef} className={styles.parts}>
            {services.map((s, i) => (
              <li key={s.no} data-part={i} className={`${styles.part} ${i === active ? styles.active : ""}`}>
                <span className={`mono ${styles.no}`}>{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className={styles.tags}>
                  {s.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
