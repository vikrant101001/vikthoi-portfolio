/* The shape of everything a visitor reads. Adding a new kind of section:
   add a member to `Section`, then a case in src/ui/panel/SectionBody.tsx.
   TypeScript will point at every place that still needs handling. */

export type Side = "personal" | "pro";

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  realm: string;
}

export interface LinkItem { label: string; value: string; href: string }

export interface CareerStop {
  company: string;
  role: string;
  /** e.g. "2021 to 2023" */
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  stack?: string[];
  /** The last stop: what's next. Drawn as a building under construction. */
  upcoming?: boolean;
}

export type Rarity = "Featured" | "Notable" | "Side project";

export interface Project {
  /** URL path of the full write-up: /projects/<slug> */
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

export interface SkillArea {
  name: string;
  blurb: string;
  items: { name: string; level: number }[];
}

export interface Game {
  name: string;
  /** e.g. "Playable", "In the forge", "Just an idea". */
  status: string;
  tagline: string;
  text: string[];
  href?: string;
  /** The studio itself (the skull hall), rather than a single game. */
  studio?: boolean;
}

/** Which building a fun-stuff stop is drawn as. */
export type FunLook = "tent" | "stall" | "gazebo" | "campfire";

export interface FunItem {
  name: string;
  look: FunLook;
  tagline: string;
  text: string[];
  links?: { label: string; href: string }[];
}

interface SectionBase {
  /** URL path for this section, e.g. "career-2" serves /career-2. */
  slug: string;
  /** Short label, e.g. "Stop 2". */
  label: string;
  /** Name shown in the world and as the panel heading. */
  title: string;
  kicker: string;
  lead: string;
  /** Which half of the world it's in. Sets the panel's style. */
  side: Side;
}

/** Shared by every stop on a road: where it sits in the line. */
interface StopInfo { road: RoadKey; index: number; total: number }

export type RoadKey = "career" | "projects" | "skills" | "games" | "fun";

export type Section = SectionBase &
  (
    | { type: "letter"; greeting: string; body: string[]; signoff: string; signature: string; links: LinkItem[] }
    | ({ type: "career"; stop: CareerStop } & StopInfo)
    | ({ type: "project"; project: Project } & StopInfo)
    | ({ type: "skills"; area: SkillArea } & StopInfo)
    | ({ type: "game"; game: Game } & StopInfo)
    | ({ type: "fun"; item: FunItem } & StopInfo)
    | { type: "intro"; body: string[] }
  );

export type SectionOf<T extends Section["type"]> = Extract<Section, { type: T }>;
