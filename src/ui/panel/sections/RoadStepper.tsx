/* The numbered steps along the top of every road stop, and the
   Previous / Next buttons along the bottom. Works for every road. */
import { useNavigate } from "react-router";
import { roads } from "@/content/roads";
import { sectionById } from "@/content/sections";
import type { RoadKey } from "@/content/types";
import { useGame } from "@/game/store";
import { travelTo } from "@/game/travel";
import styles from "./sections.module.css";

interface Props { road: RoadKey; index: number }

export function RoadSteps({ road, index }: Props) {
  const navigate = useNavigate();
  const discovered = useGame((s) => s.discovered);
  const ids = roads[road].ids;
  return (
    <ol className={`${styles.stepper} ${roads[road].side === "personal" ? styles.rustic : ""}`} aria-label={`${roads[road].label} stops`}>
      {ids.map((id, i) => (
        <li key={id} className={`${i === index ? styles.current : ""} ${discovered.includes(id) ? styles.seen : ""}`}>
          <button onClick={() => travelTo(id, navigate)} aria-label={`${i + 1}: ${sectionById(id)?.title}`} aria-current={i === index ? "step" : undefined}>
            <span>{i + 1}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export function RoadNav({ road, index }: Props) {
  const navigate = useNavigate();
  const ids = roads[road].ids;
  const go = (i: number) => travelTo(ids[i], navigate);
  return (
    <nav className={`${styles.stepNav} ${roads[road].side === "personal" ? styles.rustic : ""}`}>
      {index > 0 ? <button onClick={() => go(index - 1)}>&larr; Previous</button> : <span />}
      <span className={styles.count}>{index + 1} of {ids.length}</span>
      {index < ids.length - 1 ? <button className={styles.next} onClick={() => go(index + 1)}>Next stop &rarr;</button> : <span />}
    </nav>
  );
}
