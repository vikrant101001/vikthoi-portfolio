import { useParams } from "react-router";
import { projectBySlug } from "@/content/projects";
import { sections } from "@/content/sections";
import { PageShell } from "./PageShell";
import { NotFound } from "./NotFound";
import styles from "./ProjectPage.module.css";

/** /projects/<slug>: the full write-up for one project. */
export function ProjectPage() {
  const { slug = "" } = useParams();
  const project = projectBySlug(slug);
  if (!project) return <NotFound />;
  return (
    <PageShell title={project.name} back={{ to: `/${sections.guild.slug}`, label: `Back to ${sections.guild.title}` }}>
      <small className="kicker">{project.rarity} contract{project.year ? ` · ${project.year}` : ""}</small>
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
          {project.links.map((l) => <a key={l.label} className="btn" href={l.href}>{l.label}</a>)}
        </div>
      )}
    </PageShell>
  );
}
