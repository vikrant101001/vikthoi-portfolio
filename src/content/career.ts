/* The career road, in order. Each entry becomes a building on the road,
   each one taller than the last, and gets its own page at /career-<number>.
   Keep the last entry as `upcoming: true`: it's drawn as a construction site.
   Everything except the last entry is placeholder. */
import type { CareerStop } from "./types";

export const career: CareerStop[] = [
  {
    company: "First company",
    role: "Your first role",
    period: "20XX to 20XX",
    location: "City",
    summary: "One or two lines on what this place was and why you went there.",
    highlights: ["Something you built or owned.", "Something you learned that stuck."],
    stack: ["Tool", "Tool"],
  },
  {
    company: "Second company",
    role: "Your role",
    period: "20XX to 20XX",
    summary: "One or two lines on what this place was and why you went there.",
    highlights: ["Something you built or owned.", "A result, with a number if you have one."],
  },
  {
    company: "Third company",
    role: "Your role",
    period: "20XX to 20XX",
    summary: "One or two lines on what this place was and why you went there.",
    highlights: ["Something you built or owned.", "A result, with a number if you have one."],
  },
  {
    company: "Fourth company",
    role: "Your role",
    period: "20XX to 20XX",
    summary: "One or two lines on what this place was and why you went there.",
    highlights: ["Something you built or owned.", "A result, with a number if you have one."],
  },
  {
    company: "Fifth company",
    role: "Your current role",
    period: "20XX to now",
    summary: "One or two lines on what you do now.",
    highlights: ["Something you built or owned.", "A result, with a number if you have one."],
  },
  {
    upcoming: true,
    company: "What's next",
    role: "This stop isn't built yet",
    period: "Coming soon",
    summary: "The next building on this road is still being drawn. If you have a team that could be it, the starting letter has my contact details.",
    highlights: [],
  },
];
