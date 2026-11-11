import { Badge } from "./Badge";
import { Compass } from "./Compass";
import { Minimap } from "./Minimap";
import { QuestTracker } from "./QuestTracker";
import { DiscoveryBanner } from "./DiscoveryBanner";
import { InteractPrompt } from "./InteractPrompt";
import { Hotbar } from "./Hotbar";
import styles from "./Hud.module.css";

/** Everything drawn over the world while playing. `inert` while an overlay is open. */
export function Hud({ inert }: { inert: boolean }) {
  return (
    <div className={styles.hud} inert={inert}>
      <Badge />
      <Compass />
      <aside className={styles.side}>
        <Minimap />
        <QuestTracker />
      </aside>
      <DiscoveryBanner />
      <InteractPrompt />
      <Hotbar />
    </div>
  );
}
