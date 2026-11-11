import { useEffect, useRef } from "react";
import { engine } from "@/game/engine";
import styles from "./GameCanvas.module.css";

/** Hands a canvas to the engine while mounted. */
export function GameCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    engine.attach(ref.current!);
    return () => engine.detach();
  }, []);
  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
