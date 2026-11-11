/* The shape of everything a visitor reads. Adding a new kind of section:
   add a member to `Section`, then a case in src/ui/panel/SectionBody.tsx.
   TypeScript will point at every place that still needs handling. */

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  realm: string;
}

interface SectionBase {
  /** URL path for this section, e.g. "about" serves /about. */
  slug: string;
  /** Short label for the quest list and the map, e.g. "About". */
  label: string;
  /** Building name shown in the world, e.g. "The Keep". */
  title: string;
  kicker: string;
  lead: string;
}

export type Section = SectionBase &
  (
    | { type: "intro"; body: string[] }
    | { type: "character"; stats: { label: string; value: string }[]; body: string[] }
    | { type: "skills"; groups: { name: string; items: { name: string; level: number }[] }[] }
    | { type: "projects" }
    | { type: "timeline"; items: { when: string; name: string; text: string }[] }
    | { type: "tales"; items: { name: string; text: string }[] }
    | { type: "contact"; links: { label: string; value: string; href: string }[] }
  );

export type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;

export type Rarity = "Legendary" | "Rare" | "Common";

export interface Project {
  /** URL path: /projects/<slug> */
  slug: string;
  name: string;
  rarity: Rarity;
  summary: string;
  year?: string;
  stack?: string[];
  /** Paragraphs for the project's own page. */
  body: string[];
  links?: { label: string; href: string }[];
}
