/* One entry per place in the world. Keys match landmark ids in
   src/world/plan.ts. All text is placeholder. */
import type { Section } from "./types";

export const sections = {
  hearth: {
    type: "intro",
    slug: "welcome",
    label: "Welcome",
    title: "The Hearth",
    kicker: "Welcome, traveller",
    lead: "One or two sentences on who you are and what you make. This is the first thing a visitor reads.",
    body: [
      "A short paragraph on what you are looking for right now, and the kind of work you want to do next.",
      "Every building in the vale holds a chapter of the story. Walk to one, or open the map and travel there directly.",
    ],
  },
  keep: {
    type: "character",
    slug: "about",
    label: "About",
    title: "The Keep",
    kicker: "About",
    lead: "Your story in a few lines: where you started, what pulled you in, and what you care about.",
    stats: [
      { label: "Class", value: "Your role" },
      { label: "Homeland", value: "Your city" },
      { label: "Years of service", value: "0" },
      { label: "Languages", value: "Your languages" },
    ],
    body: ["A longer paragraph about you. Write it the way you would introduce yourself to someone you respect."],
  },
  forge: {
    type: "skills",
    slug: "skills",
    label: "Skills",
    title: "The Forge",
    kicker: "Skills",
    lead: "The tools you have hammered into shape.",
    groups: [
      { name: "Primary arms", items: [{ name: "Skill one", level: 90 }, { name: "Skill two", level: 80 }, { name: "Skill three", level: 70 }] },
      { name: "Secondary arms", items: [{ name: "Skill four", level: 65 }, { name: "Skill five", level: 55 }, { name: "Skill six", level: 45 }] },
    ],
  },
  guild: {
    type: "projects",
    slug: "projects",
    label: "Projects",
    title: "The Guild Hall",
    kicker: "Projects",
    lead: "Contracts taken and completed. Each notice on the board is one project.",
  },
  archive: {
    type: "timeline",
    slug: "experience",
    label: "Experience",
    title: "The Archive",
    kicker: "Experience",
    lead: "The chronicle so far, written down by the scribes.",
    items: [
      { when: "20XX to now", name: "Role at Company", text: "What you owned and what you shipped." },
      { when: "20XX to 20XX", name: "Role at Company", text: "What you owned and what you shipped." },
      { when: "20XX to 20XX", name: "Degree or first role", text: "Where it began." },
    ],
  },
  tavern: {
    type: "tales",
    slug: "beyond-work",
    label: "Beyond work",
    title: "The Gilded Tankard",
    kicker: "Beyond work",
    lead: "What you do when the day's work is done.",
    items: [
      { name: "A hobby", text: "A line or two about it." },
      { name: "A favourite book or game", text: "A line or two about it." },
      { name: "Something people say about you", text: "A short quote from a colleague." },
    ],
  },
  raven: {
    type: "contact",
    slug: "contact",
    label: "Contact",
    title: "The Rookery",
    kicker: "Contact",
    lead: "Send a raven. It arrives faster than you might think.",
    links: [
      { label: "Email", value: "you@example.com", href: "mailto:you@example.com" },
      { label: "GitHub", value: "github.com/you", href: "#" },
      { label: "LinkedIn", value: "linkedin.com/in/you", href: "#" },
      { label: "Résumé", value: "Download the scroll", href: "#" },
    ],
  },
  stones: {
    type: "intro",
    slug: "old-stones",
    label: "A secret",
    title: "The Old Stones",
    kicker: "A secret place",
    lead: "You found the place most travellers walk past.",
    body: ["Reserved for an easter egg. A hidden project, a joke, or a note to whoever looked this closely."],
  },
} satisfies Record<string, Section>;

export type SectionId = keyof typeof sections;

export const sectionById = (id: string): Section | undefined => (sections as Record<string, Section>)[id];

export const sectionBySlug = (slug: string): { id: SectionId; section: Section } | undefined => {
  for (const [id, section] of Object.entries(sections) as [SectionId, Section][]) if (section.slug === slug) return { id, section };
  return undefined;
};
