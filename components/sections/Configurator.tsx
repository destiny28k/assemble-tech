"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { BuildPart } from "@/lib/types";
import { sendBuild } from "@/lib/events";
import { prefersReducedMotion } from "@/lib/motion";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import styles from "./Configurator.module.css";

type Props = { parts: BuildPart[]; initial: string[] };
type Fly = { id: string; from: DOMRect; out: boolean };

/** Rough timeline: work overlaps, so each part adds a little over half its own weeks. */
function estimate(list: BuildPart[]) {
  if (!list.length) return { time: "—", team: "—" };
  const base = 3 + list.reduce((s, p) => s + p.weeks, 0) * 0.55;
  return { time: `${Math.round(base)}–${Math.round(base * 1.3)} wk`, team: `${Math.min(8, 2 + Math.ceil(list.length / 2))} people` };
}

/**
 * Pick parts from the tray: each one flies onto the blueprint board, snaps into its slot around
 * the core and connects to it. The summary updates a rough timeline and team size.
 */
export default function Configurator({ parts, initial }: Props) {
  const [chosen, setChosen] = useState<string[]>(initial);
  const [leaving, setLeaving] = useState<string[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const fly = useRef<Fly | null>(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const ro = new ResizeObserver(() => setSize({ w: board.clientWidth, h: board.clientHeight }));
    ro.observe(board);
    return () => ro.disconnect();
  }, []);

  const slot = (id: string) => {
    const i = parts.findIndex((p) => p.id === id);
    const a = ((-90 + (i * 360) / parts.length) * Math.PI) / 180;
    return { x: size.w * (0.5 + 0.39 * Math.cos(a)), y: size.h * (0.5 + 0.39 * Math.sin(a)) };
  };

  // Fly a node in from (or back out to) the tray button that was clicked.
  useLayoutEffect(() => {
    const f = fly.current;
    if (!f) return;
    fly.current = null;
    const node = boardRef.current?.querySelector<HTMLDivElement>(`[data-node="${f.id}"]`);
    const done = () => {
      if (f.out) setLeaving((l) => l.filter((x) => x !== f.id));
    };
    if (!node || prefersReducedMotion() || !node.animate) {
      done();
      return;
    }
    const b = node.getBoundingClientRect();
    const dx = f.from.left + f.from.width / 2 - (b.left + b.width / 2);
    const dy = f.from.top + f.from.height / 2 - (b.top + b.height / 2);
    const base = node.style.transform;
    const away = { transform: `${base} translate(${dx}px, ${dy}px) scale(${f.out ? 0.8 : 1.15}) rotate(${f.out ? 0 : -6}deg)`, opacity: f.out ? 0 : 0.4 };
    const home = { transform: base, opacity: 1 };
    const anim = node.animate(f.out ? [home, away] : [away, home], {
      duration: f.out ? 450 : 650,
      easing: f.out ? "cubic-bezier(.4,0,.6,1)" : "cubic-bezier(.2,.8,.2,1)",
      // Only the exit holds its last frame; an entry must release so resizing can move the node.
      fill: f.out ? "forwards" : "none",
    });
    anim.onfinish = done;
  });

  const toggle = (id: string, button: HTMLElement) => {
    const on = !chosen.includes(id);
    fly.current = { id, from: button.getBoundingClientRect(), out: !on };
    if (on) {
      setLeaving((l) => l.filter((x) => x !== id));
      setChosen((c) => [...c, id]);
    } else {
      setChosen((c) => c.filter((x) => x !== id));
      setLeaving((l) => [...l, id]);
    }
  };

  const selected = parts.filter((p) => chosen.includes(p.id));
  const { time, team } = estimate(selected);
  const groups = Array.from(new Set(parts.map((p) => p.group)));
  const onBoard = [...chosen, ...leaving.filter((id) => !chosen.includes(id))];
  const cx = size.w / 2;
  const cy = size.h / 2;

  const send = () => {
    sendBuild({
      services: Array.from(new Set(selected.map((p) => p.service))),
      message: selected.length ? `Build: ${selected.map((p) => p.name).join(", ")}. Estimated ${time}.` : "",
    });
    document.getElementById("contact")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section className="section" id="work">
      <div className="wrap">
        <SectionHead
          sheet={5}
          label="Configurator"
          title="Assemble your own system."
          text="Pick the parts your business needs. Watch them connect to one core, and get a rough timeline before we even talk."
        />
        <div className={styles.grid}>
          <div className={styles.tray}>
            {groups.map((g) => (
              <div key={g} className={styles.group}>
                <p className="mono">{g}</p>
                <div className={styles.list}>
                  {parts
                    .filter((p) => p.group === g)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={styles.part}
                        aria-pressed={chosen.includes(p.id)}
                        onClick={(e) => toggle(p.id, e.currentTarget)}
                      >
                        <span className={styles.pn}>{p.no}</span>
                        <b>{p.name}</b>
                        <span className={styles.wk}>{p.weeks} wk</span>
                        <span className={styles.box} aria-hidden="true" />
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.boardWrap}>
            <div ref={boardRef} className={`grid-bg ${styles.board}`}>
              {size.w > 0 && (
                <svg viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
                  <ellipse className={styles.ring} cx={cx} cy={cy} rx={size.w * 0.39} ry={size.h * 0.39} />
                  {chosen.map((id) => {
                    const s = slot(id);
                    return (
                      <g key={id}>
                        <line className={styles.line} x1={cx} y1={cy} x2={s.x} y2={s.y} pathLength={1} />
                        <circle className={styles.packet} r={3}>
                          <animateMotion dur={`${(1.6 + (s.x % 7) / 10).toFixed(2)}s`} repeatCount="indefinite" path={`M${s.x} ${s.y} L${cx} ${cy}`} />
                        </circle>
                      </g>
                    );
                  })}
                </svg>
              )}
              <div className={styles.core}>
                <span>Core</span>
                <b>One database</b>
              </div>
              {size.w > 0 &&
                onBoard.map((id) => {
                  const p = parts.find((x) => x.id === id)!;
                  const s = slot(id);
                  return (
                    <div
                      key={id}
                      data-node={id}
                      className={styles.node}
                      style={{ transform: `translate(${s.x}px, ${s.y}px)` }}
                    >
                      <span>{p.no}</span>
                      <b>{p.name}</b>
                    </div>
                  );
                })}
              <p className={`mono ${styles.hint}`}>
                {selected.length ? `${selected.length} part${selected.length > 1 ? "s" : ""} connected` : "Pick parts from the list"}
              </p>
            </div>
            <div className={styles.summary}>
              <div><span className="mono">Parts</span><b>{selected.length}</b></div>
              <div><span className="mono">Timeline</span><b>{time}</b></div>
              <div><span className="mono">Team</span><b>{team}</b></div>
              <Button arrow onClick={send} className={styles.send}>Send this build</Button>
            </div>
            <p className={`mono ${styles.note}`}>Rough estimates for illustration. Your real plan comes after a discovery workshop.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
