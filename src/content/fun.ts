/* The fun-stuff road: one place per thing you love doing.
   `look` picks the building: "tent", "stall", "gazebo" or "campfire".
   All text is placeholder. */
import type { FunItem } from "./types";

export const funStuff: FunItem[] = [
  {
    name: "Fun thing one",
    look: "tent",
    tagline: "A hobby, a passion, a rabbit hole.",
    text: ["A paragraph or two about it, and why you keep coming back to it."],
  },
  {
    name: "Fun thing two",
    look: "stall",
    tagline: "Something you make, collect or trade.",
    text: ["A paragraph or two about it."],
  },
  {
    name: "Fun thing three",
    look: "gazebo",
    tagline: "Music, performance, or something you do with others.",
    text: ["A paragraph or two about it."],
  },
  {
    name: "Fun thing four",
    look: "campfire",
    tagline: "The stories people tell about you, or the ones you tell.",
    text: ["A paragraph or two about it, or a quote from a friend."],
  },
];
