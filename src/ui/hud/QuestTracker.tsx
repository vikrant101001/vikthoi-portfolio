import { useGame } from "@/game/store";
import { mainPlaces } from "@/game/places";
import styles from "./QuestTracker.module.css";

export function QuestTracker() {
  const discovered = useGame((s) => s.discovered);
  const found = mainPlaces.filter((p) => discovered.includes(p.landmark.id)).length;
  return (
    <section className={styles.quest}>
      <header>
        <h2>Walk the Vale</h2>
        <span>{found} of {mainPlaces.length}</span>
      </header>
      <ul>
        {mainPlaces.map(({ landmark, section }) => (
          <li key={landmark.id} className={discovered.includes(landmark.id) ? styles.done : undefined}>
            <i />
            {section.title}
            <small>{section.label}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}
