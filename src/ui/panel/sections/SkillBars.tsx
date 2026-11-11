import type { SectionOf } from "@/content/types";
import styles from "./sections.module.css";

export function SkillBars({ section }: { section: SectionOf<"skills"> }) {
  return (
    <>
      {section.groups.map((g) => (
        <div key={g.name}>
          <h3>{g.name}</h3>
          <ul className={styles.skills}>
            {g.items.map((s) => (
              <li key={s.name}>
                <span>{s.name}</span>
                <div className={styles.bar} role="meter" aria-label={s.name} aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100}>
                  <i style={{ width: `${s.level}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
