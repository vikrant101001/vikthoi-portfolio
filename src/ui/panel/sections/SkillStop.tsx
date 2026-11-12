import type { SectionOf } from "@/content/types";
import { RoadNav, RoadSteps } from "./RoadStepper";
import styles from "./sections.module.css";

/** One skill area on the skills road, with a bar per skill. */
export function SkillStop({ section }: { section: SectionOf<"skills"> }) {
  return (
    <div>
      <RoadSteps road={section.road} index={section.index} />
      <ul className={styles.skills}>
        {section.area.items.map((s, i) => (
          <li key={i}>
            <span>{s.name}</span>
            <div className={styles.bar} role="meter" aria-label={s.name} aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100}>
              <i style={{ width: `${s.level}%` }} />
            </div>
            <span className={styles.level}>{s.level}</span>
          </li>
        ))}
      </ul>
      <RoadNav road={section.road} index={section.index} />
    </div>
  );
}
