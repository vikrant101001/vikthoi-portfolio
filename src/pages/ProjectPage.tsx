import { useParams } from "react-router";
import { projectBySlug, projects } from "@/content/projects";
import { roads } from "@/content/roads";
import { PageShell } from "./PageShell";
import { NotFound } from "./NotFound";
import styles from "./ProjectPage.module.css";

/** /projects/<slug>: the full write-up for one project. */
export function ProjectPage() {
  const { slug = "" } = useParams();
  const project = projectBySlug(slug);
  if (!project) return <NotFound />;
  /* Back to this project's building on the projects road. */
  const stop = roads.projects.ids[projects.indexOf(project)];
  return (
    <PageShell title={project.name} theme="pro" back={{ to: `/${stop}`, label: "Back to the projects road" }}>
      <small className={styles.kicker}>{project.rarity}{project.year ? ` · ${project.year}` : ""}</small>
      <h1>{project.name}</h1>
      <p className={styles.summary}>{project.summary}</p>
      {project.stack && (
        <ul className={styles.stack} aria-label="Built with">
          {project.stack.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      )}
      {project.body.map((p, i) => <p key={i}>{p}</p>)}
      {project.links && (
        <div className={styles.links}>
          {project.links.map((l) => <a key={l.label} href={l.href}>{l.label} &rarr;</a>)}
        </div>
      )}
    </PageShell>
  );
}
