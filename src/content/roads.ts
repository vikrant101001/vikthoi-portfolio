/* The five roads out of the centre. Each road is a line of stops, and every
   stop is generated from its content file, so adding an entry to a content
   file adds a building to the road. */
import { career } from "./career";
import { projects } from "./projects";
import { skillAreas } from "./skills";
import { games } from "./games";
import { funStuff } from "./fun";
import type { RoadKey, Side } from "./types";

export interface RoadInfo {
  key: RoadKey;
  /** Name on the signboard and in the journey list. */
  label: string;
  side: Side;
  /** Landmark ids of the stops, in order from the centre outwards. */
  ids: string[];
}

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}-${i + 1}`);

export const roads: Record<RoadKey, RoadInfo> = {
  career: { key: "career", label: "Career", side: "pro", ids: ids("career", career.length) },
  projects: { key: "projects", label: "Projects", side: "pro", ids: ids("project", projects.length) },
  skills: { key: "skills", label: "Skills", side: "pro", ids: ids("skills", skillAreas.length) },
  games: { key: "games", label: "Vikskull Games", side: "personal", ids: ids("games", games.length) },
  fun: { key: "fun", label: "Fun stuff", side: "personal", ids: ids("fun", funStuff.length) },
};

export const roadOf = (id: string) => Object.values(roads).find((r) => r.ids.includes(id));
