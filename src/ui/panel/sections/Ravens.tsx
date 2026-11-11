import type { SectionOf } from "@/content/types";
import styles from "./sections.module.css";

export function Ravens({ section }: { section: SectionOf<"contact"> }) {
  return (
    <ul className={styles.ravens}>
      {section.links.map((x) => (
        <li key={x.label}>
          <a href={x.href}><b>{x.label}</b><span>{x.value}</span></a>
        </li>
      ))}
    </ul>
  );
}
