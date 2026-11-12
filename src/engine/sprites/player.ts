/* The traveller: a hooded figure in a red cloak, in four walking frames for
   each of three facings (left is the side view mirrored). */
import { OUT } from "../palette";
import type { Facing } from "../types";
import { R, canvas, ctx2d } from "./kit";

function playerFrame(dir: Facing, f: number): HTMLCanvasElement {
  const c = canvas(20, 27), g = ctx2d(c);
  const CL = "#8a231d", CD = "#5a140f", CH = "#b83a2c", SKIN = "#e0b083", LEATHER = "#3b2614", TRIM = "#e8bd5c", STEEL = "#c9c2ae";
  const sw = [0, 2, 0, -2][f], bob = f % 2 ? 1 : 0, cx = 10;
  if (dir === "side") {
    R(g, OUT, 7 + sw, 21, 6, 6); R(g, "#50341c", 8 + sw, 21, 4, 5);
    R(g, OUT, 7 - sw, 21, 6, 6); R(g, LEATHER, 8 - sw, 21, 4, 5);
  } else {
    const l = sw > 0 ? 2 : 0, r = sw < 0 ? 2 : 0;
    R(g, OUT, 5, 21, 5, 6 - l); R(g, LEATHER, 6, 21, 3, 5 - l);
    R(g, OUT, 10, 21, 5, 6 - r); R(g, LEATHER, 11, 21, 3, 5 - r);
  }
  /* Silhouette built row by row: pointed hood, shoulders, flared cloak. */
  const half = [1, 2, 3, 4, 4, 4, 4, 4, 3, 5, 6, 6, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8];
  const lean = dir === "side" ? 1 : 0;
  half.forEach((hw, row) => {
    const y = row + bob, off = row < 9 ? lean : -lean;
    const sway = row > 16 ? Math.round(sw / 2) : 0;
    const x0 = cx - hw + off + sway, w = hw * 2;
    R(g, OUT, x0 - 1, y, w + 2, 1);
    R(g, CL, x0, y, w, 1);
    R(g, CH, x0, y, Math.max(1, Math.round(w * 0.28)), 1);
    R(g, CD, x0 + Math.round(w * 0.7), y, Math.round(w * 0.3), 1);
  });
  R(g, OUT, 2 + Math.round(sw / 2), 22 + bob, 16, 1);
  R(g, TRIM, 3 + Math.round(sw / 2), 21 + bob, 14, 1);
  const y = bob;
  if (dir === "down") {
    R(g, OUT, 7, 4 + y, 6, 5); R(g, SKIN, 8, 6 + y, 4, 3); R(g, "#2a150e", 8, 5 + y, 4, 1);
    R(g, TRIM, 6, 3 + y, 1, 6); R(g, TRIM, 13, 3 + y, 1, 6);
    R(g, "#d8c49a", 8, 10 + y, 4, 11);
    R(g, LEATHER, 5, 15 + y, 10, 2); R(g, TRIM, 9, 15 + y, 2, 2);
  } else if (dir === "side") {
    R(g, OUT, 11, 4 + y, 4, 5); R(g, SKIN, 12, 6 + y, 3, 3);
    R(g, TRIM, 10, 3 + y, 1, 6);
    R(g, LEATHER, 4, 15 + y, 12, 2); R(g, TRIM, 12, 15 + y, 2, 2);
    R(g, STEEL, 3, 16 + y, 6, 1); R(g, TRIM, 9, 15 + y, 1, 3);
  } else {
    R(g, CD, 9, 2 + y, 2, 7);
    for (let i = 0; i < 12; i++) R(g, i < 3 ? TRIM : STEEL, 5 + i, 8 + i + y, 1, 1);
    R(g, LEATHER, 5, 15 + y, 10, 1);
  }
  return c;
}

export type PlayerFrames = Record<Facing, HTMLCanvasElement[]>;

export function buildPlayerFrames(): PlayerFrames {
  const make = (d: Facing) => [0, 1, 2, 3].map((f) => playerFrame(d, f));
  return { down: make("down"), up: make("up"), side: make("side") };
}
