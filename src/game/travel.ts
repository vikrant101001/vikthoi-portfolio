/* Moving the traveller somewhere and opening that place, used by the map,
   the career "next stop" buttons and the journey list. */
import type { NavigateFunction } from "react-router";
import { sectionById } from "@/content/sections";
import { engine } from "./engine";

export function travelTo(id: string, navigate: NavigateFunction) {
  const section = sectionById(id);
  if (!section) return;
  engine.teleport(id);
  engine.discover(id);
  navigate(`/${section.slug}`);
}
