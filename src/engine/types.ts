import type { Pt } from "./math";

/** Which half of the world a point belongs to. */
export type Side = "personal" | "pro";

export type BuildingKind =
  | "lectern"
  /** Career stop; `variant` 0-4 makes it taller. */
  | "office"
  /** An unbuilt building under construction: the "coming soon" stop. */
  | "draft"
  /** Project stop; `variant` 0-3 picks one of four designs. */
  | "project"
  /** Skills stop; `variant` 0-3 picks one of four designs. */
  | "skill"
  | "skullhall"
  /** Game booth; `variant` picks the sign colour. */
  | "arcade"
  | "tent"
  | "stall"
  | "gazebo"
  | "campfire";

export type PropKind =
  | "lamp" | "barrel" | "crate" | "hay" | "bunting" | "windmill" | "flowers"
  | "inkLamp" | "inkTree" | "bench" | "planter";

/** A place on the map that opens a part of the portfolio. */
export interface Landmark {
  /** Matches a section id in the content. */
  id: string;
  sprite: BuildingKind | null;
  /** Picks a look within a building kind (e.g. office height). */
  variant?: number;
  x: number;
  /** y of the building's base, used for depth sorting. */
  y: number;
  /** Solid footprint [width, height] that grows up from the base. Only needed
      for things standing on walkable ground, like the lectern in the square. */
  foot?: [number, number];
  /** Where the player stands to enter. */
  door: { x: number; y: number };
  secret?: boolean;
}

export interface Road {
  w: number;
  pts: Pt[];
  /** Ruled straight segments instead of a smooth curve (professional side). */
  straight?: boolean;
}

/** A label in the world, drawn by the UI. */
export interface Sign {
  x: number;
  y: number;
  text: string;
  /** Which way the road goes from the sign, as a compass direction. */
  arrow?: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
  side: Side;
  /** Bigger text for the two halves' names. */
  big?: boolean;
  /** Stand a signboard here and write the text on it. x, y is the board's base. */
  board?: boolean;
  /** Carved into the centre stage, in neither half's style. */
  engraved?: boolean;
}

export interface WorldPlan {
  W: number;
  H: number;
  spawn: { x: number; y: number };
  /** The line between the halves: personal to the left, professional to the right. */
  seamX: number;
  plaza: { x: number; y: number; r: number };
  /** Only roads, the plaza and walkAreas can be walked on. */
  roads: Road[];
  /** Streams and ponds, drawn as thick strokes. */
  water: { w: number; pts: Pt[] }[];
  fields: { x: number; y: number; w: number; h: number }[];
  landmarks: Landmark[];
  houses: { x: number; y: number; v: 0 | 1 | 2 }[];
  props: { s: PropKind; x: number; y: number; v?: number }[];
  signs: Sign[];
  /** Extra walkable spots off the roads, e.g. inside the stone circle. */
  walkAreas: { x: number; y: number; r: number }[];
}

export interface Light { x: number; y: number; r: number; hot?: boolean; seed: number }
export interface SmokeSource { x: number; y: number; heavy?: boolean; acc: number }
export interface Entity { img: HTMLCanvasElement; x: number; y: number; w: number; h: number; base: number }

export interface BuiltWorld {
  ground: HTMLCanvasElement;
  /** Quarter-size picture of the world, for maps. */
  mini: HTMLCanvasElement;
  solid: Uint8Array;
  GW: number;
  GH: number;
  CELL: number;
  entities: Entity[];
  lights: Light[];
  smoke: SmokeSource[];
  /** Windmill hubs: blades are drawn every frame. */
  spinners: { x: number; y: number; r: number }[];
  /** Campfires: flames are drawn every frame. */
  flames: { x: number; y: number }[];
  /** Flat triples of x, y, phase. */
  glints: number[];
  ringRune: { x: number; y: number };
  /** Point just above each landmark's roof, for its name label. */
  anchors: Record<string, { x: number; y: number }>;
}

export type Facing = "down" | "up" | "side";
