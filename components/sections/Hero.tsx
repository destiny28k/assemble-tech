"use client";

import { useEffect, useRef } from "react";
import { clamp, prefersReducedMotion, subscribeFrame } from "@/lib/motion";
import { setPartCount } from "@/lib/events";
import Button from "@/components/ui/Button";
import styles from "./Hero.module.css";

type Part = { tx: number; ty: number; x: number; y: number; vx: number; vy: number; sx: number; sy: number; s: number; color: string };

const WORD = "ASSEMBLE";
const INK = "#13151B";
const COBALT = "#2B45F5";
const SIGNAL = "#FF5A1F";

/**
 * Builds the particle simulation on a canvas: one block per filled cell of the word.
 * Blocks spring to their place, are pushed away by the mouse and scatter as the page scrolls.
 * Returns a function that stops everything.
 */
function startParts(canvas: HTMLCanvasElement, hero: HTMLElement, mouse: { x: number; y: number }): () => void {
  const still = prefersReducedMotion();
  let parts: Part[] = [];
  let W = 0, H = 0, dpr = 1;
  let onScreen = true;

  const draw = (scatter: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1 - scatter * 0.6;
    for (const p of parts) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  };

  const build = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(W));
    off.height = Math.max(1, Math.round(H));
    const o = off.getContext("2d", { willReadFrequently: true });
    if (!o) return;
    const narrow = W < 860;
    const setFont = (px: number) => {
      o.font = `900 ${px}px Archivo`;
      try {
        (o as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = "expanded";
      } catch {}
    };
    setFont(100);
    setFont(Math.floor((100 * (W * (narrow ? 0.92 : 0.86))) / o.measureText(WORD).width));
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.fillStyle = "#000";
    o.fillText(WORD, W / 2, H * (narrow ? 0.52 : 0.4));
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(4, Math.round(W / (narrow ? 120 : 190)));
    const prev = parts;
    const next: Part[] = [];
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] <= 140) continue;
        const rnd = Math.random();
        const a = Math.random() * Math.PI * 2;
        const far = 300 + Math.random() * 700;
        const old = prev[next.length];
        next.push({
          tx: x, ty: y,
          x: still ? x : old ? old.x : Math.random() * W,
          y: still ? y : old ? old.y : Math.random() * H,
          vx: 0, vy: 0,
          sx: Math.cos(a) * far, sy: Math.sin(a) * far - 200,
          s: step * (Math.random() < 0.12 ? 0.45 : 0.72),
          color: rnd < 0.06 ? COBALT : rnd < 0.085 ? SIGNAL : INK,
        });
      }
    }
    parts = next;
    setPartCount(next.length);
    if (still) draw(0);
  };

  const tick = (_t: number, _dt: number, { y }: { y: number }) => {
    if (!onScreen || !parts.length) return;
    const e = clamp(y / (hero.offsetHeight * 0.75 || 1), 0, 1) ** 2;
    const R = 110;
    const R2 = R * R;
    for (const p of parts) {
      p.vx += (p.tx + p.sx * e - p.x) * 0.055;
      p.vy += (p.ty + p.sy * e - p.y) * 0.055;
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) * 9;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx *= 0.8;
      p.vy *= 0.8;
      p.x += p.vx;
      p.y += p.vy;
    }
    draw(e);
  };

  let timer = 0;
  const onResize = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(build, 200);
  };
  const fonts = document.fonts?.load ? Promise.race([document.fonts.load("900 100px Archivo"), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
  fonts.then(build);
  window.addEventListener("resize", onResize);
  const io = new IntersectionObserver((en) => {
    onScreen = en[0].isIntersecting;
  });
  io.observe(hero);
  const stop = still ? () => {} : subscribeFrame(tick);
  return () => {
    stop();
    io.disconnect();
    window.removeEventListener("resize", onResize);
    window.clearTimeout(timer);
  };
}

/** Thousands of small blocks fly in and build the name. The mouse pushes them away; scrolling scatters them. */
export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xRef = useRef<HTMLSpanElement>(null);
  const yRef = useRef<HTMLSpanElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => startParts(canvasRef.current!, heroRef.current!, mouse.current), []);

  const mm = (n: number) => (n * 0.2646).toFixed(1).padStart(5, "0");

  return (
    <section
      ref={heroRef}
      className={`grid-bg ${styles.hero}`}
      id="top"
      aria-label="Assemble Technologies"
      onPointerMove={(e) => {
        const r = canvasRef.current!.getBoundingClientRect();
        mouse.current.x = e.clientX - r.left;
        mouse.current.y = e.clientY - r.top;
        if (xRef.current) xRef.current.textContent = `X ${mm(mouse.current.x)} mm`;
        if (yRef.current) yRef.current.textContent = `Y ${mm(mouse.current.y)} mm`;
      }}
      onPointerLeave={() => {
        mouse.current.x = -9999;
        mouse.current.y = -9999;
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <p className={`mono ${styles.corner} ${styles.tl}`}>
        Sheet <b>01</b> / 07 &middot; General assembly
      </p>
      <p className={`mono ${styles.corner} ${styles.tr}`} aria-hidden="true">
        <span ref={xRef}>X 000.0 mm</span>
        <span ref={yRef}>Y 000.0 mm</span>
      </p>
      <div className={styles.foot}>
        <div className={styles.footInner}>
          <h1 className="display">
            Software for the whole business, <em>assembled</em> by one team.
          </h1>
          <div className={styles.side}>
            <p>ERP systems, web platforms and mobile apps, designed, built and kept running by the same engineers. <span className={styles.hintFine}>Move your mouse over the parts.</span><span className={styles.hintTouch}>Touch the parts.</span></p>
            <div className={styles.ctas}>
              <Button href="#contact" arrow>Start a project</Button>
              <Button href="#services" variant="ghost">See the parts list</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
