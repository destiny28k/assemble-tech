"use client";

import { useEffect, useRef } from "react";
import type { ToolCard } from "@/lib/types";
import { clamp, easeInOut, lerp } from "@/lib/motion";
import { useFrame } from "@/hooks/useFrame";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useInViewRef } from "@/hooks/useInView";
import { SheetLabel } from "@/components/ui/SectionHead";
import styles from "./Untangle.module.css";

type Props = { tools: ToolCard[]; tangle: [number, number][] };

/**
 * The tools a growing business usually runs on, tilted and tied together with red lines.
 * Scrolling straightens them into a grid of modules around one core database.
 */
export default function Untangle({ tools, tangle }: Props) {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beforeRef = useRef<HTMLHeadingElement>(null);
  const afterRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const toolsRef = useRef<HTMLElement>(null);
  const typedRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const onScreen = useInViewRef(sectionRef, "100px 0px");
  const pos = useRef(tools.map(() => ({ x: 0, y: 0 })));
  const coreIndex = Math.max(0, tools.findIndex((t) => t.core));

  const render = (time: number) => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    const p = reduced ? 1 : span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    const t = easeInOut(clamp((p - 0.12) / 0.6, 0, 1));
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const f = clamp((t - 0.4) / 0.25, 0, 1);

    tools.forEach((c, i) => {
      const wob = 1 - t;
      const x = (lerp(c.chaos[0], c.order[0], t) / 100) * W + wob * Math.sin(time / 900 + i * 1.7) * 7;
      const y = (lerp(c.chaos[1], c.order[1], t) / 100) * H + wob * Math.cos(time / 1100 + i) * 6;
      const rot = lerp(c.chaos[2], 0, t) + wob * Math.sin(time / 1300 + i) * 1.5;
      pos.current[i] = { x, y };
      const el = cardRefs.current[i];
      if (!el) return;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      (el.children[0] as HTMLElement).style.opacity = String(1 - f);
      (el.children[1] as HTMLElement).style.opacity = String(f);
    });
    if (beforeRef.current) beforeRef.current.style.opacity = String(1 - f);
    if (afterRef.current) afterRef.current.style.opacity = String(f);
    if (hintRef.current) hintRef.current.textContent = t >= 1 ? "Assembled" : "Scroll to untangle ↓";
    if (toolsRef.current) toolsRef.current.textContent = String(Math.round(lerp(9, 1, t)));
    if (typedRef.current) typedRef.current.textContent = `${Math.round(lerp(4, 1, t))}×`;
    if (reportRef.current) reportRef.current.textContent = t > 0.75 ? "Live" : `${Math.max(1, Math.round(lerp(3, 1, t / 0.75)))} days`;
    [toolsRef, typedRef, reportRef].forEach((ref) => ref.current?.classList.toggle(styles.done, t >= 1));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * d) || canvas.height !== Math.round(H * d)) {
      canvas.width = Math.round(W * d);
      canvas.height = Math.round(H * d);
    }
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const P = pos.current;

    // The tangle: red curves between tools that keep copying data between each other.
    const red = clamp(1 - t * 1.7, 0, 1);
    if (red > 0) {
      ctx.strokeStyle = `rgba(255, 90, 31, ${0.75 * red})`;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = -time / 40;
      tangle.forEach(([a, b], k) => {
        const A = P[a], B = P[b];
        const nx = -(B.y - A.y), ny = B.x - A.x, nl = Math.hypot(nx, ny) || 1;
        const s = (k % 2 ? 1 : -1) * (90 + (k % 3) * 40 + Math.sin(time / 700 + k) * 20);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo((A.x + B.x) / 2 + (nx / nl) * s, (A.y + B.y) / 2 + (ny / nl) * s, B.x, B.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // The system: clean links from every module to the core, with data moving along them.
    const sys = clamp((t - 0.6) / 0.3, 0, 1);
    if (sys > 0) {
      const C = P[coreIndex];
      ctx.strokeStyle = `rgba(111, 134, 255, ${0.8 * sys})`;
      ctx.lineWidth = 1.6;
      P.forEach((A, i) => {
        if (i === coreIndex) return;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(C.x, C.y);
        ctx.stroke();
      });
      if (!reduced) {
        ctx.fillStyle = `rgba(255, 90, 31, ${sys})`;
        P.forEach((A, i) => {
          if (i === coreIndex) return;
          let k = (time / 1500 + i * 0.137) % 1;
          if (i % 2) k = 1 - k;
          ctx.beginPath();
          ctx.arc(lerp(A.x, C.x, k), lerp(A.y, C.y, k), 3.2, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  };

  useFrame((time) => {
    if (onScreen.current) render(time);
  }, !reduced);

  // Without motion, draw the assembled state once and on resize.
  useEffect(() => {
    if (!reduced) return;
    render(0);
    const onResize = () => render(0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // render only reads refs and props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className={`dark ${styles.untangle} ${reduced ? styles.static : ""}`}
      style={reduced ? undefined : { height: "330vh" }}
      id="platform"
      aria-label="From scattered tools to one system"
    >
      <div className={`wrap ${styles.pin}`}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <SheetLabel sheet={3} label="Untangle" dark />
            <div className={styles.titles}>
              <h2 ref={beforeRef} className="display">Nine tools that don&rsquo;t talk to each other.</h2>
              <h2 ref={afterRef} className={`display ${styles.after}`} aria-hidden="true">
                One system that <em>runs the business.</em>
              </h2>
            </div>
          </div>
          <div className={styles.side}>
            <p>Most growing companies run on spreadsheets, chat groups and paper. We replace the tangle with one connected system, without stopping the business.</p>
            <p ref={hintRef} className={`mono ${styles.hint}`}>Scroll to untangle &darr;</p>
          </div>
        </div>
        <div ref={stageRef} className={styles.stage}>
          <canvas ref={canvasRef} aria-hidden="true" />
          {tools.map((c, i) => (
            <div
              key={c.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`${styles.card} ${c.core ? styles.core : ""}`}
              style={{ "--tone": c.tone } as React.CSSProperties}
            >
              <div className={`${styles.face} ${styles.old}`}>
                <span className={c.warn ? styles.warn : undefined}>{c.type}</span>
                <b>{c.title}</b>
              </div>
              <div className={`${styles.face} ${styles.new}`}>
                <span>{c.core ? "All modules share it" : "Synced"}</span>
                <b>{c.module}</b>
              </div>
            </div>
          ))}
        </div>
        <div className={`mono ${styles.meters}`}>
          <div><span>Tools in use</span><b ref={toolsRef}>9</b></div>
          <div><span>Same data typed</span><b ref={typedRef}>4&times;</b></div>
          <div><span>Month-end report</span><b ref={reportRef}>3 days</b></div>
        </div>
      </div>
    </section>
  );
}
