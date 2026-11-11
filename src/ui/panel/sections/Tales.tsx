import type { SectionOf } from "@/content/types";
import styles from "./sections.module.css";

export function Tales({ section }: { section: SectionOf<"tales"> }) {
  return (
    <ul className={styles.tales}>
      {section.items.map((x, i) => (
        <li key={i}>
          <h3>{x.name}</h3>
          <p>{x.text}</p>
        </li>
      ))}
    </ul>
  );
}
