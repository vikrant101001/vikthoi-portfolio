/* The skills road: one building per area, in order. Levels are 0 to 100.
   All text is placeholder. */
import type { SkillArea } from "./types";

export const skillAreas: SkillArea[] = [
  {
    name: "Area one",
    blurb: "Placeholder: e.g. Frontend. What you do here and how deep you go.",
    items: [{ name: "Skill", level: 90 }, { name: "Skill", level: 80 }, { name: "Skill", level: 70 }],
  },
  {
    name: "Area two",
    blurb: "Placeholder: e.g. Backend.",
    items: [{ name: "Skill", level: 85 }, { name: "Skill", level: 70 }, { name: "Skill", level: 60 }],
  },
  {
    name: "Area three",
    blurb: "Placeholder: e.g. Data and infrastructure.",
    items: [{ name: "Skill", level: 75 }, { name: "Skill", level: 60 }, { name: "Skill", level: 50 }],
  },
  {
    name: "Area four",
    blurb: "Placeholder: e.g. Tools and ways of working.",
    items: [{ name: "Skill", level: 80 }, { name: "Skill", level: 70 }, { name: "Skill", level: 65 }],
  },
];
