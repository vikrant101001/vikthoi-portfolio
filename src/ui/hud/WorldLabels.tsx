/* Text drawn over the world: each building's name above its roof, the road
   names written on the signboards, and the two halves' names in the square.
   Positions update every frame straight in the DOM (no React re-render),
   and text scales with the world through the --s variable. */
import { useEffect, useRef } from "react";
import { engine } from "@/game/engine";
import { useGame } from "@/game/store";
import { places } from "@/game/places";
import { sideAt } from "@/engine/seam";
import { BOARD_FACE_Y } from "@/engine/sprites";
import styles from "./WorldLabels.module.css";

const named = places.filter((p) => p.landmark.sprite);
/** Degrees to rotate a right-pointing arrow so it points that way. */
const TURN = { e: 0, se: 45, s: 90, sw: 135, w: 180, nw: -135, n: -90, ne: -45 } as const;

export function WorldLabels() {
  const layer = useRef<HTMLDivElement>(null);
  const discovered = useGame((s) => s.discovered);

  useEffect(
    () =>
      engine.onFrame((e) => {
        const el = layer.current, w = e.world;
        if (!el || !w) return;
        const s = String(e.pixelScale);
        if (el.style.getPropertyValue("--s") !== s) el.style.setProperty("--s", s);
        const vw = innerWidth, vh = innerHeight;
        for (const label of el.children as HTMLCollectionOf<HTMLElement>) {
          const id = label.dataset.place;
          const at = id ? w.anchors[id] : { x: Number(label.dataset.x), y: Number(label.dataset.y) };
          if (!at) continue;
          const p = e.worldToScreen(at.x, at.y);
          const on = p.x > -240 && p.x < vw + 240 && p.y > -80 && p.y < vh + 80;
          label.style.visibility = on ? "visible" : "hidden";
          if (on) label.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, ${label.dataset.center ? "-50%" : "-100%"})`;
        }
      }),
    [],
  );

  return (
    <div ref={layer} className={styles.layer} aria-hidden="true">
      {named.map(({ landmark, section }) => {
        const side = sideAt(engine.plan, landmark.x, landmark.y);
        const visited = discovered.includes(landmark.id);
        return (
          <div key={landmark.id} data-place={landmark.id} className={`${styles.label} ${styles[side]} ${visited ? styles.visited : ""}`}>
            {"road" in section && <small>{section.label}</small>}
            <span>{section.type === "letter" ? "Read me first" : section.title}</span>
          </div>
        );
      })}
      {engine.plan.signs.map((s) => (
        <div
          key={s.text}
          data-x={s.x}
          data-y={s.board ? s.y - BOARD_FACE_Y : s.y}
          data-center={s.board ? "1" : undefined}
          className={`${s.board ? styles.board : styles.sign} ${s.engraved ? styles.engraved : styles[s.side]} ${s.big ? styles.big : ""}`}
        >
          {s.arrow && /w/.test(s.arrow) && <Arrow turn={TURN[s.arrow]} />}
          {s.text}
          {s.arrow && !/w/.test(s.arrow) && <Arrow turn={TURN[s.arrow]} />}
        </div>
      ))}
    </div>
  );
}

/** A bold arrow, drawn so it reads clearly at small sizes in any font. */
function Arrow({ turn }: { turn: number }) {
  return (
    <svg className={styles.arrow} viewBox="0 0 16 16" style={{ rotate: `${turn}deg` }}>
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
