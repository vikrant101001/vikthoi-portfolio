/* A live website running inside a browser-window screen, shrunk to fit,
   with a big button to open the real thing.

   The site runs at a real screen size (desktop 1440×900, or a 390×844 phone
   when the space is portrait) and is scaled down to fit the space, so the
   visitor sees its whole screen at once, like a miniature monitor. It still
   works: clicks and typing land in the right place. */
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./LiveScreen.module.css";

const DESKTOP = { w: 1440, h: 900 };
const PHONE = { w: 390, h: 844 };
/** Height of the window's top bar, in CSS pixels. */
const BAR = 36;

interface Props {
  name: string;
  url: string;
  /** Shown on the left of the top row, beside the big button. */
  children?: ReactNode;
}

export function LiveScreen({ name, url, children }: Props) {
  const [loaded, setLoaded] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ ...DESKTOP, scale: 0 });
  const host = new URL(url).host;

  /* Re-fit whenever the space changes size (window resize, phone rotation). */
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const room = height - BAR;
      const size = room > width ? PHONE : DESKTOP;
      setFit({ ...size, scale: Math.max(0.1, Math.min(width / size.w, room / size.h)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shownW = Math.floor(fit.w * fit.scale), shownH = Math.floor(fit.h * fit.scale);

  return (
    <section className={styles.wrap} aria-label={`${name}, running live`}>
      <div className={styles.head}>
        <div className={styles.intro}>{children}</div>
        <a className={styles.go} href={url} target="_blank" rel="noopener noreferrer">
          <span>
            <small>For a better experience</small>
            Go to {name}
          </span>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </a>
      </div>

      <div ref={area} className={styles.area}>
        {fit.scale > 0 && (
          <div className={styles.window} style={{ width: shownW }}>
            <div className={styles.bar} style={{ height: BAR }} aria-hidden="true">
              <i /><i /><i />
              <span className={styles.address}>{host}</span>
            </div>
            <div className={styles.screen} style={{ height: shownH }}>
              {!loaded && <p className={styles.loading}>Loading {name}&hellip;</p>}
              <iframe
                src={url}
                title={`${name} (live)`}
                allow="clipboard-write; fullscreen"
                onLoad={() => setLoaded(true)}
                style={{ width: fit.w, height: fit.h, transform: `scale(${fit.scale})` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
