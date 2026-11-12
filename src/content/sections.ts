/* Every place in the world, keyed by landmark id (see src/world/plan.ts).
   The letter and the secret are written here; every stop on the five roads
   is generated from its own content file (career, projects, skills, games,
   fun). Text marked "placeholder" is waiting for your real details. */
import { career } from "./career";
import { projects } from "./projects";
import { skillAreas } from "./skills";
import { games } from "./games";
import { funStuff } from "./fun";
import { roads } from "./roads";
import type { RoadKey, Section } from "./types";

const fixed = {
  letter: {
    type: "letter",
    side: "personal",
    slug: "letter",
    label: "The letter",
    title: "The starting letter",
    kicker: "Read me first",
    lead: "Left on the lectern for whoever wanders in.",
    greeting: "Dear traveller,",
    body: [
      "You've found your way to my little corner of the map. I'm Vikrant, and this world is my portfolio: the work I've done, the things I've built, and the things I make just because they're fun, laid out as places you can walk to.",
      "The land is split down the middle. To your right, the map is still being drawn in ink. That's my professional life: one road walks through my career stop by stop, and two more lead to my projects and my skills.",
      "To your left, the land is warm and a little wild. That's my personal life: one road to Vikskull Games, and another to everything else I do for the joy of it.",
      "Every road starts at a signboard on the edge of this square. Walk with WASD or the arrow keys, or tap where you want to go. Press E at a door to step inside, and press M whenever you want the map. Short on time? The map will take you anywhere instantly.",
      "One more thing: somewhere out west there's a place I haven't put on any signboard. See if you can find it.",
    ],
    signoff: "Safe travels,",
    signature: "Vikrant",
    links: [
      { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
      { label: "GitHub", value: "github.com/vikrant101001", href: "https://github.com/vikrant101001" },
      { label: "LinkedIn", value: "linkedin.com/in/you", href: "#" },
      { label: "Résumé", value: "Download (PDF)", href: "#" },
    ],
  },

  stones: {
    type: "intro",
    side: "personal",
    slug: "old-stones",
    label: "A secret",
    title: "The Old Stones",
    kicker: "You found it",
    lead: "Most travellers walk right past this place.",
    body: ["Reserved for an easter egg. A hidden project, a joke, or a note to whoever looked this closely."],
  },
} satisfies Record<string, Section>;

/** Builds the sections for one road from its list of content entries. */
function road<T>(key: RoadKey, items: T[], make: (item: T, i: number) => Omit<Section, "slug" | "side" | "road" | "index" | "total">) {
  const info = roads[key];
  return info.ids.map((id, i) => [id, { ...make(items[i], i), slug: id, side: info.side, road: key, index: i, total: items.length } as Section] as const);
}

const generated: Record<string, Section> = Object.fromEntries([
  ...road("career", career, (stop, i) => ({
    type: "career", stop, label: `Stop ${i + 1}`,
    title: stop.upcoming ? "Coming soon" : stop.company, kicker: stop.period, lead: stop.role,
  })),
  ...road("projects", projects, (project, i) => ({
    type: "project", project, label: `Project ${i + 1}`,
    title: project.name, kicker: project.year ? `${project.rarity} · ${project.year}` : project.rarity, lead: project.summary,
  })),
  ...road("skills", skillAreas, (area, i) => ({
    type: "skills", area, label: `Area ${i + 1}`,
    title: area.name, kicker: "Skills", lead: area.blurb,
  })),
  ...road("games", games, (game, i) => ({
    type: "game", game, label: game.studio ? "The studio" : `Game ${i}`,
    title: game.name, kicker: game.status, lead: game.tagline,
  })),
  ...road("fun", funStuff, (item, i) => ({
    type: "fun", item, label: `Stop ${i + 1}`,
    title: item.name, kicker: "Fun stuff", lead: item.tagline,
  })),
] as (readonly [string, Section])[]);

/** All places. The fixed ones are typed by name, so a typo like sections.leter is an error. */
export const sections = { ...fixed, ...generated } as typeof fixed & Record<string, Section | undefined>;

export const sectionById = (id: string): Section | undefined => (sections as Record<string, Section>)[id];

export const sectionBySlug = (slug: string): { id: string; section: Section } | undefined => {
  for (const [id, section] of Object.entries(sections as Record<string, Section>)) if (section.slug === slug) return { id, section };
  return undefined;
};

/** Landmark ids of the career stops, in order. */
export const careerIds = roads.career.ids;
