import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { profile } from "@/content/profile";
import { engine } from "@/game/engine";
import { useGame } from "@/game/store";
import { places, type Place } from "@/game/places";
import { Overlay } from "@/ui/common/Overlay";
import styles from "./WorldMap.module.css";

/** /map: the whole vale on parchment. Every place is a button that travels there. */
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
    g.globalCompositeOperation = "color"; g.fillStyle = "#a57f45"; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "soft-light"; g.fillStyle = "#f3deb0"; g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
  }, [ready]);

  const travel = ({ landmark, section }: Place) => {
    setFading(true);
    setTimeout(() => {
      engine.teleport(landmark.id);
      engine.discover(landmark.id);
      navigate(`/${section.slug}`);
    }, 260);
  };

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <Overlay label="World map" onClose={() => navigate("/")} sheetClassName={styles.sheet}>
      <title>{`World map · ${profile.name}`}</title>
      <header className={styles.header}>
        <small className="kicker">World map</small>
        <h2>{profile.realm}</h2>
      </header>
      <div className={styles.body}>
        <div className={styles.art}>
          <canvas ref={art} width={800} height={560} aria-hidden="true" />
          {visible.map((p) => (
            <button
              key={p.landmark.id}
              className={`${styles.pin} ${discovered.includes(p.landmark.id) ? styles.found : ""}`}
              style={{ left: pct(p.landmark.door.x, W), top: pct(p.landmark.door.y, H) }}
              onClick={() => travel(p)}
              aria-label={`Travel to ${p.section.title}, ${p.section.label}`}
            >
              <i />
              <span>{p.section.title}</span>
            </button>
          ))}
          <b className={styles.you} style={{ left: pct(you.x, W), top: pct(you.y, H) }} aria-hidden="true" />
        </div>
        <nav className={styles.list} aria-label="Places">
          {visible.map((p) => (
            <button key={p.landmark.id} onClick={() => travel(p)}>
              <b>{p.section.label}</b>
              <span>{p.section.title}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className={`${styles.fade} ${fading ? styles.on : ""}`} aria-hidden="true" />
    </Overlay>
  );
}
