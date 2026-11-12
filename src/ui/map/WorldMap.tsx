import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { profile } from "@/content/profile";
import { engine } from "@/game/engine";
import { useGame } from "@/game/store";
import { journey, placeById, places, type Place } from "@/game/places";
import { travelTo } from "@/game/travel";
import { Overlay } from "@/ui/common/Overlay";
import styles from "./WorldMap.module.css";

/** /map: the whole world at a glance. Every place is a button that travels there. */
export function WorldMap() {
  const navigate = useNavigate();
  const ready = useGame((s) => s.ready);
  const discovered = useGame((s) => s.discovered);
  const art = useRef<HTMLCanvasElement>(null);
  const [fading, setFading] = useState(false);
  const { W, H } = engine.plan;
  const you = engine.player;
  const visible = places.filter((p) => !p.landmark.secret || discovered.includes(p.landmark.id));

  useEffect(() => {
    const c = art.current, g = c?.getContext("2d"), mini = engine.world?.mini;
    if (!c || !g || !mini) return;
    g.drawImage(mini, 0, 0, c.width, c.height);
  }, [ready]);

  const travel = (id: string) => {
    setFading(true);
    setTimeout(() => travelTo(id, navigate), 260);
  };

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  /* Stops on a road show their number; the road name is on the list beside the map. */
  const pinLabel = ({ section }: Place) => ("road" in section ? String(section.index + 1) : section.type === "letter" ? "Start" : section.title);

  return (
    <Overlay label="World map" onClose={() => navigate("/")} sheetClassName={styles.sheet}>
      <title>{`World map · ${profile.name}`}</title>
      <header className={styles.header}>
        <small className="kicker">World map</small>
        <h2>{profile.name}</h2>
      </header>
      <div className={styles.body}>
        <div className={styles.art}>
          <canvas ref={art} width={960} height={512} aria-hidden="true" />
          {visible.map((p) => (
            <button
              key={p.landmark.id}
              className={`${styles.pin} ${discovered.includes(p.landmark.id) ? styles.found : ""} ${p.section.side === "pro" ? styles.proPin : ""} ${"road" in p.section ? styles.stop : ""}`}
              style={{ left: pct(p.landmark.door.x, W), top: pct(p.landmark.door.y, H) }}
              onClick={() => travel(p.landmark.id)}
              aria-label={`Travel to ${p.section.title}`}
            >
              <i />
              <span>{pinLabel(p)}</span>
            </button>
          ))}
          <b className={styles.you} style={{ left: pct(you.x, W), top: pct(you.y, H) }} aria-hidden="true" />
        </div>
        <nav className={styles.list} aria-label="Places">
          {journey.map((g) => (
            <div key={g.side}>
              <h3>{g.title}</h3>
              {g.rows.map((r) => (
                <div key={r.key} className={styles.road}>
                  <h4>{r.label}</h4>
                  {r.ids.map((id, i) => (
                    <button key={id} onClick={() => travel(id)} className={discovered.includes(id) ? styles.seen : undefined}>
                      <b>{i + 1}. {placeById(id)!.section.title}</b>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <div>
            <h3>Start</h3>
            <button onClick={() => travel("letter")}><b>The starting letter</b></button>
          </div>
        </nav>
      </div>
      <div className={`${styles.fade} ${fading ? styles.on : ""}`} aria-hidden="true" />
    </Overlay>
  );
}
