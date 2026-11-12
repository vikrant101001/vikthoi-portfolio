import { useEffect, useRef } from "react";
import { engine } from "@/game/engine";
import { journey } from "@/game/places";
import styles from "./Compass.module.css";

/** How far either side of your heading the compass can see, in radians. */
const FOV = 2.2;
const LETTERS: [string, number][] = [["N", 0], ["E", Math.PI / 2], ["S", Math.PI], ["W", -Math.PI / 2]];
const TICKS = Array.from({ length: 16 }, (_, i) => i).filter((i) => i % 4 !== 0);
/** One pin per destination; for the career road it points at the next unseen stop. */
const ROWS = journey.flatMap((g) => g.rows);

/** Moves every frame, so it updates the DOM directly instead of re-rendering. */
export function Compass() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      engine.onFrame((e) => {
        const el = track.current;
        if (!el) return;
        const half = el.clientWidth / 2, p = e.player;
        for (const m of el.children as HTMLCollectionOf<HTMLElement>) {
          let angle = Number(m.dataset.angle);
          const row = m.dataset.row ? ROWS.find((r) => r.key === m.dataset.row) : undefined;
          if (row) {
            const id = row.ids.find((i) => !e.discovered.has(i)) ?? row.ids[row.ids.length - 1];
            const l = e.landmark(id);
            if (!l) continue;
            angle = Math.atan2(l.door.x - p.x, -(l.door.y - p.y));
            m.classList.toggle(styles.found, row.ids.every((i) => e.discovered.has(i)));
          }
          const rel = Math.atan2(Math.sin(angle - p.heading), Math.cos(angle - p.heading));
          m.style.opacity = Math.abs(rel) < FOV ? String(1 - Math.pow(Math.abs(rel) / FOV, 3)) : "0";
          m.style.transform = `translateX(${(rel / FOV) * half}px)`;
        }
      }),
    [],
  );

  return (
    <div className={styles.compass} aria-hidden="true">
      <div ref={track} className={styles.track}>
        {LETTERS.map(([t, a]) => <span key={t} className={styles.letter} data-angle={a}>{t}</span>)}
        {TICKS.map((i) => <span key={i} className={i % 2 ? styles.tick : `${styles.tick} ${styles.major}`} data-angle={(i / 16) * Math.PI * 2} />)}
        {ROWS.map((r) => <span key={r.key} className={styles.pin} data-row={r.key} title={r.label} />)}
      </div>
      <b className={styles.needle} />
    </div>
  );
}
