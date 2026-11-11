import { Link } from "react-router";
import { projects } from "@/content/projects";
import styles from "./sections.module.css";

const TILTS = [-1.2, 0.8, -0.5, 1.1];

export function QuestBoard() {
  return (
    <ul className={styles.notices}>
      {projects.map((p, i) => (
        <li key={p.slug} style={{ "--tilt": `${TILTS[i % TILTS.length]}deg` } as React.CSSProperties}>
          <em className={styles[`rarity${p.rarity}`]}>{p.rarity}</em>
          <h3>{p.name}</h3>
          <p>{p.summary}</p>
          <Link to={`/projects/${p.slug}`}>Read the contract</Link>
        </li>
      ))}
    </ul>
  );
}
