/* The sprite catalogue: maps the names used in the world plan to the
   functions that draw them. Add a new building or prop here. */
import type { BuildingKind, PropKind, Side } from "../types";
import { ctx2d, canvas, type Sprite } from "./kit";
import * as P from "./personal";
import * as PS from "./personal-stops";
import * as Pro from "./pro";
import * as ProS from "./pro-stops";
import { inkTree } from "./nature";

/** `variant` picks a look within a kind (office height, design number, sign colour). */
export const BUILDINGS: Record<BuildingKind, (variant: number) => Sprite> = {
  lectern: P.lectern,
  office: (v) => Pro.office(v),
  draft: Pro.draft,
  project: ProS.projectHouse,
  skill: ProS.skillHouse,
  skullhall: P.skullHall,
  arcade: PS.arcade,
  tent: P.tent,
  stall: PS.stall,
  gazebo: PS.gazebo,
  campfire: PS.campfire,
};

export const PROPS: Record<PropKind, (variant: number) => Sprite> = {
  lamp: P.lamp,
  barrel: P.barrel,
  crate: P.crate,
  hay: P.hay,
  bunting: P.bunting,
  windmill: P.windmill,
  flowers: PS.flowers,
  inkLamp: Pro.inkLamp,
  inkTree: (v) => inkTree(v, v % 4 === 3),
  bench: Pro.bench,
  planter: ProS.planter,
};

/** Signboards at the mouth of each road, one look per half. */
export const BOARDS: Record<Side, () => Sprite> = { personal: PS.woodBoard, pro: ProS.proBoard };
/** How far above a signboard's base the middle of its face is, for the text. */
export const BOARD_FACE_Y = 27;

/** Props you can walk through (things overhead). */
export const WALK_THROUGH = new Set<PropKind>(["bunting"]);

export { canvas, ctx2d, sprite, R, type Sprite } from "./kit";
export { cottage, standingStone, fencePost } from "./personal";
export { oak, pine, inkTree } from "./nature";
export { buildPlayerFrames, type PlayerFrames } from "./player";

/** Soft radial light, drawn additively. `color` must be an rgba() string. */
export function glow(color: string, size: number): HTMLCanvasElement {
  const c = canvas(size, size), g = ctx2d(c), h = size / 2;
  const gr = g.createRadialGradient(h, h, 0, h, h, h);
  gr.addColorStop(0, color);
  gr.addColorStop(0.35, color.replace(/[\d.]+\)$/, (m) => parseFloat(m) * 0.45 + ")"));
  gr.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  return c;
}
