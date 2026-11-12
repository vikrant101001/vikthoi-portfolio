import type { SectionOf } from "@/content/types";
import { Paragraphs } from "./Paragraphs";
import { RoadNav, RoadSteps } from "./RoadStepper";
import styles from "./sections.module.css";

/** One place on the fun-stuff road. */
export function FunStop({ section }: { section: SectionOf<"fun"> }) {
  const { item } = section;
  return (
    <div>
      <RoadSteps road={section.road} index={section.index} />
      <Paragraphs body={item.text} />
      {item.links && (
        <p className={styles.funLinks}>
          {item.links.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
        </p>
      )}
      <RoadNav road={section.road} index={section.index} />
    </div>
  );
}
