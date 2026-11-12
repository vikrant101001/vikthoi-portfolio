import type { SectionOf } from "@/content/types";
import { Paragraphs } from "./Paragraphs";
import { RoadNav, RoadSteps } from "./RoadStepper";
import styles from "./sections.module.css";

/** The Vikskull studio, or one of its games. */
export function GameStop({ section }: { section: SectionOf<"game"> }) {
  const { game } = section;
  return (
    <div>
      <RoadSteps road={section.road} index={section.index} />
      <div className={game.studio ? undefined : styles.poster}>
        <Paragraphs body={game.text} />
        {game.href && <a className={styles.play} href={game.href}>Play {game.name}</a>}
      </div>
      <RoadNav road={section.road} index={section.index} />
    </div>
  );
}
