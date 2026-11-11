/* Joins each landmark in the world plan with its section content. */
import { plan } from "@/world/plan";
import { sectionById } from "@/content/sections";
import type { Landmark } from "@/engine/types";
import type { Section } from "@/content/types";

export interface Place { landmark: Landmark; section: Section }

export const places: Place[] = plan.landmarks.map((landmark) => {
  const section = sectionById(landmark.id);
  if (!section) throw new Error(`Landmark "${landmark.id}" has no section in src/content/sections.ts`);
  return { landmark, section };
});

/** Places that count towards the quest (secrets don't). */
export const mainPlaces = places.filter((p) => !p.landmark.secret);

export const placeById = (id: string) => places.find((p) => p.landmark.id === id);
