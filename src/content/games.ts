/* The Vikskull Games road. The first entry is the studio (the skull hall);
   each game after it gets its own arcade booth. All text is placeholder. */
import type { Game } from "./types";

export const games: Game[] = [
  {
    studio: true,
    name: "Vikskull Games",
    status: "The studio",
    tagline: "Placeholder: what Vikskull Games is, in one line.",
    text: [
      "Placeholder: the story of the studio. Why you started it, what kind of games you like to make, and what's on the workbench.",
      "Walk on down the road: each booth is one game.",
    ],
  },
  {
    name: "Game one",
    status: "Playable",
    tagline: "A line on what it is and why it's fun.",
    text: ["A short paragraph about the game: the idea, how it plays, what you're proud of."],
    href: "#",
  },
  {
    name: "Game two",
    status: "In the forge",
    tagline: "A line on what it is and why it's fun.",
    text: ["A short paragraph about the game."],
  },
  {
    name: "Game three",
    status: "Just an idea",
    tagline: "A line on what it is and why it's fun.",
    text: ["A short paragraph about the idea."],
  },
];
