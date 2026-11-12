import { Link } from "react-router";
import type { SectionOf } from "@/content/types";
import { RoadNav, RoadSteps } from "./RoadStepper";
import styles from "./sections.module.css";

/** One project on the projects road: a preview, with the full write-up a click away. */
export function ProjectStop({ section }: { section: SectionOf<"project"> }) {
  const { project } = section;
  return (
    <div>
      <RoadSteps road={section.road} index={section.index} />
      {project.body[0] && <p>{project.body[0]}</p>}
      {project.stack && <ul className={styles.chips} aria-label="Built with">{project.stack.map((s, i) => <li key={i}>{s}</li>)}</ul>}
      <div className={styles.actions}>
        <Link className={styles.primary} to={`/projects/${project.slug}`}>Read the full story &rarr;</Link>
        {project.links?.map((l) => <a key={l.label} href={l.href}>{l.label}</a>)}
      </div>
      <RoadNav road={section.road} index={section.index} />
    </div>
  );
}
