import { useGame } from "@/game/store";
import { placeById } from "@/game/places";
import styles from "./DiscoveryBanner.module.css";

export function DiscoveryBanner() {
  const banner = useGame((s) => s.banner);
  const place = banner && placeById(banner.id);
  if (place?.section.type === "letter") return null;
  return (
    <div className={styles.slot} role="status">
      {place && (
        /* A new key restarts the animation for each discovery. */
        <div key={banner.key} className={styles.banner}>
          <small>{place.landmark.secret ? "Secret found" : place.section.type === "career" ? place.section.label : "Arrived"}</small>
          <strong>{place.section.title}</strong>
        </div>
      )}
    </div>
  );
}
