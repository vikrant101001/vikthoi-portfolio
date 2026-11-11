import { useEffect, useRef } from "react";
import { engine } from "@/game/engine";
import { mainPlaces } from "@/game/places";
import styles from "./Compass.module.css";

/** How far either side of your heading the compass can see, in radians. */
const FOV = 2.2;
const LETTERS: [string, number][] = [["N", 0], ["E", Math.PI / 2], ["S", Math.PI], ["W", -Math.PI / 2]];
const TICKS = Array.from({ length: 16 }, (_, i) => i).filter((i) => i % 4 !== 0);

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
          const id = m.dataset.place;
          const place = id ? e.landmark(id) : undefined;
          const angle = place ? Math.atan2(place.door.x - p.x, -(place.door.y - p.y)) : Number(m.dataset.angle);
          const rel = Math.atan2(Math.sin(angle - p.heading), Math.cos(angle - p.heading));
          m.style.opacity = Math.abs(rel) < FOV ? String(1 - Math.pow(Math.abs(rel) / FOV, 3)) : "0";
          m.style.transform = `translateX(${(rel / FOV) * half}px)`;
          if (id) m.classList.toggle(styles.found, e.discovered.has(id));
        }
      }),
    [],
  );

  return (
    <div className={styles.compass} aria-hidden="true">
      <div ref={track} className={styles.track}>
        {LETTERS.map(([t, a]) => <span key={t} className={styles.letter} data-angle={a}>{t}</span>)}
        {TICKS.map((i) => <span key={i} className={i % 2 ? styles.tick : `${styles.tick} ${styles.major}`} data-angle={(i / 16) * Math.PI * 2} />)}
        {mainPlaces.map((p) => <span key={p.landmark.id} className={styles.pin} data-place={p.landmark.id} />)}
      </div>
      <b className={styles.needle} />
    </div>
  );
}
