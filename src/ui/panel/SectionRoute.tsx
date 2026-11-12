import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { profile } from "@/content/profile";
import { sectionBySlug } from "@/content/sections";
import { engine } from "@/game/engine";
import { useGame } from "@/game/store";
import { Overlay } from "@/ui/common/Overlay";
import { NotFound } from "@/pages/NotFound";
import { SectionBody } from "./SectionBody";
import styles from "./Panel.module.css";

/** /<slug>: one place in the world, open over the map. */
export function SectionRoute() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const found = sectionBySlug(slug);

  /* Arriving straight from a link: put the traveller at that place. */
  useEffect(() => {
    if (!found || useGame.getState().started) return;
    engine.teleport(found.id);
    engine.discover(found.id);
  }, [found]);

  if (!found) return <NotFound />;
  const { section } = found;
  const pro = section.side === "pro";
  return (
    <Overlay label={section.title} onClose={() => navigate("/")} theme={section.side} sheetClassName={`${styles.sheet} ${pro ? styles.pro : ""}`}>
      <title>{`${section.title} · ${profile.name}`}</title>
      <div className={styles.scroll}>
        {section.type !== "letter" && (
          <header className={styles.header}>
            <small className={pro ? styles.proKicker : "kicker"}>{section.kicker}</small>
            <h2 className={styles.title}>{section.title}</h2>
            {!pro && <i className={styles.flourish} aria-hidden="true" />}
            <p className={styles.lead}>{section.lead}</p>
          </header>
        )}
        <div className={styles.body}>
          <SectionBody section={section} />
        </div>
      </div>
    </Overlay>
  );
}
