import { useNavigate } from "react-router";
import type { SectionOf } from "@/content/types";
import { Paragraphs } from "./Paragraphs";
import styles from "./sections.module.css";

/** The starting letter: what this place is, and which way to go. */
export function Letter({ section }: { section: SectionOf<"letter"> }) {
  const navigate = useNavigate();
  return (
    <div className={styles.letter}>
      <p className={styles.greeting}>{section.greeting}</p>
      <Paragraphs body={section.body} />
      <div className={styles.signRow}>
        <p className={styles.signoff}>
          {section.signoff}
          <br />
          <span className={styles.signature}>{section.signature}</span>
        </p>
        <i className={styles.seal} aria-hidden="true" />
      </div>
      <ul className={styles.links}>
        {section.links.map((l) => (
          <li key={l.label}><a href={l.href}><b>{l.label}</b><span>{l.value}</span></a></li>
        ))}
      </ul>
      <div className={styles.ways}>
        <button className="btn" onClick={() => navigate("/")}>&larr; Personal</button>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Start walking</button>
        <button className={`btn ${styles.proBtn}`} onClick={() => navigate("/")}>Professional &rarr;</button>
      </div>
    </div>
  );
}
