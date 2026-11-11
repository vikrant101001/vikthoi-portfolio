/* Mini-games, each served at /play/<id>.
   To add one: create src/games/<id>/index.tsx with a default-exported
   component, then add an entry below. Each game is loaded only when someone
   opens it, so games never slow down the main world.

   Example:
   { id: "forge-rush", title: "Forge Rush", description: "Temper blades before the fire dies.",
     load: () => import("./forge-rush") },
*/
import type { ComponentType } from "react";

export interface GameEntry {
  id: string;
  title: string;
  description: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const games: GameEntry[] = [];

export const gameById = (id: string) => games.find((g) => g.id === id);
