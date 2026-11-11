import { useGame } from "@/game/store";
import { placeById } from "@/game/places";
import styles from "./DiscoveryBanner.module.css";

export function DiscoveryBanner() {
  const banner = useGame((s) => s.banner);
  const place = banner && placeById(banner.id);
  return (
    <div className={styles.slot} role="status">
      {place && (
        /* A new key restarts the animation for each discovery. */
        <div key={banner.key} className={styles.banner}>
          <small>{place.landmark.secret ? "Secret found" : "Location discovered"}</small>
          <strong>{place.section.title}</strong>
          <i className="flourish" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
