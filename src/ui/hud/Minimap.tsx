import { useEffect, useRef } from "react";
import { engine } from "@/game/engine";
import styles from "./Minimap.module.css";

const SIZE = 176;
/** How many quarter-scale pixels of the world fit across the minimap. */
const SPAN = 110;

export function Minimap() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(
    () =>
      engine.onFrame((e) => {
        const c = ref.current?.getContext("2d"), w = e.world;
        if (!c || !w) return;
        const p = e.player, mx = p.x / 4, my = p.y / 4, k = SIZE / SPAN;
        c.clearRect(0, 0, SIZE, SIZE);
        c.imageSmoothingEnabled = false;
        c.drawImage(w.mini, mx - SPAN / 2, my - SPAN / 2, SPAN, SPAN, 0, 0, SIZE, SIZE);
        if (e.side === "personal") {
          c.globalCompositeOperation = "color";
          c.fillStyle = "#a57a3c";
          c.fillRect(0, 0, SIZE, SIZE);
          c.globalCompositeOperation = "source-over";
        }
        for (const l of e.plan.landmarks) {
          const found = e.discovered.has(l.id);
          if (l.secret && !found) continue;
          const x = (l.door.x / 4 - mx) * k + SIZE / 2, y = (l.door.y / 4 - my) * k + SIZE / 2;
          if (x < 0 || y < 0 || x > SIZE || y > SIZE) continue;
          c.save();
          c.translate(x, y);
          c.rotate(Math.PI / 4);
          c.fillStyle = "#1c130b"; c.fillRect(-5, -5, 10, 10);
          c.fillStyle = found ? "#ffcf70" : "#8c7350"; c.fillRect(-3, -3, 6, 6);
          c.restore();
        }
        c.save();
        c.translate(SIZE / 2, SIZE / 2);
        c.rotate(p.heading);
        c.fillStyle = "#1c130b";
        c.beginPath(); c.moveTo(0, -10); c.lineTo(7, 7); c.lineTo(0, 3); c.lineTo(-7, 7); c.fill();
        c.fillStyle = "#c33a2c";
        c.beginPath(); c.moveTo(0, -7); c.lineTo(4.5, 4.5); c.lineTo(0, 1.5); c.lineTo(-4.5, 4.5); c.fill();
        c.restore();
      }),
    [],
  );

  return (
    <div className={styles.frame}>
      <canvas ref={ref} width={SIZE} height={SIZE} aria-hidden="true" />
    </div>
  );
}
