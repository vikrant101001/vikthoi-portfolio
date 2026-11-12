/* Joins each landmark in the world plan with its section content, and groups
   them into the journey shown in the HUD and on the map. */
import { plan } from "@/world/plan";
import { sectionById } from "@/content/sections";
import { roads } from "@/content/roads";
import type { Landmark } from "@/engine/types";
import type { RoadKey, Section } from "@/content/types";

export interface Place { landmark: Landmark; section: Section }

export const places: Place[] = plan.landmarks.map((landmark) => {
  const section = sectionById(landmark.id);
  if (!section) throw new Error(`Landmark "${landmark.id}" has no section in src/content/sections.ts`);
  return { landmark, section };
});

export const placeById = (id: string) => places.find((p) => p.landmark.id === id);

/** Places that count towards the journey (the letter and secrets don't). */
export const mainPlaces = places.filter((p) => !p.landmark.secret && p.landmark.id !== "letter");

/** The journey, as shown in the HUD and on the map: one row per road. */
export interface JourneyRow { key: RoadKey; label: string; ids: string[] }
const row = (key: RoadKey): JourneyRow => ({ key, label: roads[key].label, ids: roads[key].ids });
export const journey: { side: "pro" | "personal"; title: string; rows: JourneyRow[] }[] = [
  { side: "pro", title: "Professional", rows: [row("career"), row("projects"), row("skills")] },
  { side: "personal", title: "Personal", rows: [row("games"), row("fun")] },
];
