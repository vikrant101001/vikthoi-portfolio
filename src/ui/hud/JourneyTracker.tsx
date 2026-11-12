/* The journey list in the corner: where you've been, grouped by half.
   Each row is a button that travels straight there. */
import { useNavigate } from "react-router";
import { useGame } from "@/game/store";
import { journey } from "@/game/places";
import { travelTo } from "@/game/travel";
import styles from "./JourneyTracker.module.css";

export function JourneyTracker() {
  const discovered = useGame((s) => s.discovered);
  const navigate = useNavigate();
  return (
    <section className={styles.journey} aria-label="Your journey">
      {journey.map((group) => (
        <div key={group.side} className={styles.group}>
          <h2>{group.title}</h2>
          <ul>
            {group.rows.map((row) => {
              const seen = row.ids.filter((id) => discovered.includes(id)).length;
              const done = seen === row.ids.length;
              /* Go to the first stop you haven't seen yet. */
              const next = row.ids.find((id) => !discovered.includes(id)) ?? row.ids[0];
              return (
                <li key={row.key} className={done ? styles.done : undefined}>
                  <button onClick={() => travelTo(next, navigate)}>
                    <i />
                    {row.label}
                    {row.ids.length > 1 && <small>{seen} of {row.ids.length}</small>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
