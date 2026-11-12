/* The wavy line that splits the world: personal to the left, professional
   to the right. Shared by the world generator, the engine and the HUD. */
import { fbm } from "./math";
import type { Side, WorldPlan } from "./types";

export function seamAt(plan: WorldPlan, y: number): number {
  return plan.seamX + (fbm(y * 0.008, 3.7, 3) - 0.5) * 70;
}

export function sideAt(plan: WorldPlan, x: number, y: number): Side {
  return x > seamAt(plan, y) ? "pro" : "personal";
}
