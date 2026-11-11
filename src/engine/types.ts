import type { Pt } from "./math";

export type BuildingKind = "keep" | "forge" | "guild" | "archive" | "tavern" | "raven" | "brazier";
export type PropKind = "lamp" | "sign" | "anvil" | "barrel" | "crate" | "hay" | "board";

/** A place on the map that opens a part of the portfolio. */
export interface Landmark {
  /** Matches a section id in the content. */
  id: string;
  sprite: BuildingKind | null;
  x: number;
  /** y of the building's base, used for depth sorting. */
  y: number;
  /** Solid footprint [width, height] that grows up from the base. */
  foot: [number, number] | null;
  /** Extra solid depth in front of the base. */
  front?: number;
  /** Where the player stands to enter. */
  door: { x: number; y: number };
  secret?: boolean;
}

export interface WorldPlan {
  W: number;
  H: number;
  spawn: { x: number; y: number };
  river: Pt[];
  bridge: { x: number; y0: number; y1: number; w: number };
  plaza: { x: number; y: number; r: number };
  roads: { w: number; pts: Pt[] }[];
  fields: { x: number; y: number; w: number; h: number }[];
  landmarks: Landmark[];
  houses: { x: number; y: number; v: 0 | 1 | 2 }[];
  props: { s: PropKind; x: number; y: number }[];
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
  flames: { x: number; y: number }[];
  /** Flat triples of x, y, phase. */
  glints: number[];
  ringRune: { x: number; y: number };
}

export type Facing = "down" | "up" | "side";
