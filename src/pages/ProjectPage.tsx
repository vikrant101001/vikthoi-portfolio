import { useParams } from "react-router";
import { projectBySlug, projects } from "@/content/projects";
import { roads } from "@/content/roads";
import { PageShell } from "./PageShell";
import { NotFound } from "./NotFound";
import { LiveScreen } from "./LiveScreen";
import styles from "./ProjectPage.module.css";

/** /projects/<slug>: one project's page. With `embed`, it's a single screen
    showing the live site; otherwise it's a normal scrolling write-up. */
export function ProjectPage() {
  const { slug = "" } = useParams();
  const project = projectBySlug(slug);
  if (!project) return <NotFound />;
  /* Back to this project's building on the projects road. */
  const stop = roads.projects.ids[projects.indexOf(project)];
  const back = { to: `/${stop}`, label: "Back to the projects road" };
  const heading = (
    <>
      <small className={styles.kicker}>{project.rarity}{project.year ? ` · ${project.year}` : ""}</small>
      <h1>{project.name}</h1>
      <p className={styles.summary}>{project.summary}</p>
    </>
  );

  if (project.embed) {
    return (
      <PageShell title={project.name} theme="pro" fit back={back}>
        <LiveScreen name={project.name} url={project.embed.url}>
          <div className={styles.compact}>{heading}</div>
        </LiveScreen>
      </PageShell>
    );
  }

  return (
    <PageShell title={project.name} theme="pro" back={back}>
      {heading}
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
