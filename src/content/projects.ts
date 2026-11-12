/* Each project is a building on the projects road and gets its own page at
   /projects/<slug>. Add `embed` to run the live site in a screen on that page.
   Text marked "placeholder" is waiting for your real details. */
import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "rawbify",
    name: "Rawbify",
    rarity: "Featured",
    summary: "Raw data in, BI-ready out. Rawbify turns messy business data into clean, analysis-ready datasets for Power BI and Tableau in minutes, not hours.",
    body: [
      "Placeholder: the problem Rawbify solves, who has it, and why it matters.",
      "Placeholder: how you built it and the decisions that shaped it.",
    ],
    embed: { url: "https://rawbify.vercel.app/" },
  },
  {
    slug: "project-two",
    name: "Project two",
    rarity: "Notable",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
  {
    slug: "project-three",
    name: "Project three",
    rarity: "Notable",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
  {
    slug: "project-four",
    name: "Project four",
    rarity: "Side project",
    summary: "What it is, what you did, and what changed because of it.",
    body: ["The story of this project."],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
