import type { SectionOf } from "@/content/types";
import { Paragraphs } from "./Paragraphs";
import styles from "./sections.module.css";

export function CharacterSheet({ section }: { section: SectionOf<"character"> }) {
  return (
    <>
      <dl className={styles.stats}>
        {section.stats.map((s) => (
          <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
        ))}
      </dl>
      <Paragraphs body={section.body} />
    </>
  );
}
