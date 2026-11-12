import { profile } from "@/content/profile";
import { useGame } from "@/game/store";
import { mainPlaces } from "@/game/places";
import styles from "./Badge.module.css";

export function Badge() {
  const discovered = useGame((s) => s.discovered);
  const found = mainPlaces.filter((p) => discovered.includes(p.landmark.id)).length;
  return (
    <div className={styles.badge}>
      <div className={styles.emblem} aria-hidden="true" />
      <div className={styles.text}>
        <strong>{profile.name}</strong>
        <span>{profile.title}</span>
        <div className={styles.progress} title={`${found} of ${mainPlaces.length} places visited`}>
          <i style={{ width: `${(found / mainPlaces.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
