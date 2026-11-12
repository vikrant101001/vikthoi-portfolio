import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { profile } from "@/content/profile";
import { useGame } from "@/game/store";
import styles from "./TitleScreen.module.css";

/** Shown over the drifting world until the visitor starts. Fades out, then unmounts. */
export function TitleScreen({ skip }: { skip: boolean }) {
  const ready = useGame((s) => s.ready);
  const started = useGame((s) => s.started);
  const navigate = useNavigate();
  const [gone, setGone] = useState(started || skip);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [started]);

  if (gone) return null;
  const begin = () => useGame.setState({ started: true });
  /* The journey starts by reading the letter on the lectern. */
  const start = () => { begin(); navigate("/letter"); };

  return (
    <section className={`${styles.title} ${started ? styles.leaving : ""}`}>
      <title>{profile.siteTitle}</title>
      <div className={styles.inner}>
        <div className={styles.crest} aria-hidden="true" />
        <p className={styles.eyebrow}>{profile.realm}</p>
        <h1>{profile.siteTitle}</h1>
        <p className={styles.tagline}>{profile.tagline}</p>
        {ready ? (
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={start} autoFocus>Begin the journey</button>
            <button className="btn" onClick={() => { begin(); navigate("/map"); }}>Skip to the map</button>
          </div>
        ) : (
          <p className={styles.loading}>Drawing the map&hellip;</p>
        )}
        <p className={styles.controls}>WASD or arrows to walk. E to enter. M for the map. Tap to walk on a phone.</p>
      </div>
    </section>
  );
}
