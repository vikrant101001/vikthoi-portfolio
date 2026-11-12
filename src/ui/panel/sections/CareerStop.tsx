import type { SectionOf } from "@/content/types";
import { RoadNav, RoadSteps } from "./RoadStepper";
import styles from "./sections.module.css";

/** One stop on the career road. */
export function CareerStop({ section }: { section: SectionOf<"career"> }) {
  const { stop } = section;
  return (
    <div className={stop.upcoming ? styles.upcoming : undefined}>
      <RoadSteps road={section.road} index={section.index} />
      {stop.location && <p className={styles.meta}>{stop.location}</p>}
      <p>{stop.summary}</p>
      {stop.highlights.length > 0 && (
        <>
          <h3>Highlights</h3>
          <ul className={styles.highlights}>{stop.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul>
        </>
      )}
      {stop.stack && <ul className={styles.chips} aria-label="Tools used">{stop.stack.map((s, i) => <li key={i}>{s}</li>)}</ul>}
      <RoadNav road={section.road} index={section.index} />
    </div>
  );
}
