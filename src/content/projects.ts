/* Each project appears as a notice in the Guild Hall and gets its own page at
   /projects/<slug>. All text is placeholder. */
import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "project-one",
    name: "Project one",
    rarity: "Legendary",
    summary: "What it is, what you did, and what changed because of it.",
    year: "20XX",
    stack: ["Tool", "Tool", "Tool"],
    body: [
      "The problem: who had it, and why it mattered.",
      "What you built and the decisions that shaped it.",
      "The result, with a number if you have one.",
    ],
    links: [{ label: "Live", href: "#" }, { label: "Source", href: "#" }],
  },
  {
    slug: "project-two",
    name: "Project two",
    rarity: "Rare",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
  {
    slug: "project-three",
    name: "Project three",
    rarity: "Rare",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
  {
    slug: "project-four",
    name: "Project four",
    rarity: "Common",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
