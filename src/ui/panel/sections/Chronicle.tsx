import type { SectionOf } from "@/content/types";
import styles from "./sections.module.css";

export function Chronicle({ section }: { section: SectionOf<"timeline"> }) {
  return (
    <ol className={styles.chronicle}>
      {section.items.map((x, i) => (
        <li key={i}>
          <time>{x.when}</time>
          <h3>{x.name}</h3>
          <p>{x.text}</p>
        </li>
      ))}
    </ol>
  );
}
