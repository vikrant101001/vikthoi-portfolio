import { useEffect } from "react";
import { engine } from "@/game/engine";
import { Badge } from "./Badge";
import { Compass } from "./Compass";
import { Minimap } from "./Minimap";
import { JourneyTracker } from "./JourneyTracker";
import { WorldLabels } from "./WorldLabels";
import { DiscoveryBanner } from "./DiscoveryBanner";
import { InteractPrompt } from "./InteractPrompt";
import { Hotbar } from "./Hotbar";
import styles from "./Hud.module.css";

/** Everything drawn over the world while playing. `inert` while an overlay is open. */
export function Hud({ inert }: { inert: boolean }) {
  /* Switch the HUD's look when the traveller crosses the seam (see tokens.css). */
  useEffect(() => {
    const root = document.documentElement;
    const off = engine.onFrame((e) => {
      const side = e.side;
      if (root.dataset.side !== side) root.dataset.side = side;
    });
    return () => { off(); delete root.dataset.side; };
  }, []);

  return (
    <div className={styles.hud} inert={inert}>
      <WorldLabels />
      <Badge />
      <Compass />
      <aside className={styles.side}>
        <Minimap />
        <JourneyTracker />
      </aside>
      <DiscoveryBanner />
      <InteractPrompt />
      <Hotbar />
    </div>
  );
}
