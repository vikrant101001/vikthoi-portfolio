/* The drawing toolkit every sprite is built from. Sprites are drawn in code,
   pixel by pixel, so there are no image files to license or load. */
import { hash } from "../math";
import { AMBER, BEAM, DSTONE, INK, INK_SOFT, OUT, SHEET } from "../palette";

export interface SpriteLight { dx: number; dy: number; r: number; hot?: boolean }
export interface SpriteSmoke { dx: number; dy: number; heavy?: boolean }
export interface Sprite {
  c: HTMLCanvasElement;
  w: number;
  h: number;
  /** Lights and chimney smoke, relative to the sprite's bottom centre. */
  lights: SpriteLight[];
  smoke: SpriteSmoke[];
}
export type Ctx = CanvasRenderingContext2D;

export function canvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
export function ctx2d(c: HTMLCanvasElement, opts?: CanvasRenderingContext2DSettings): Ctx {
  const g = c.getContext("2d", opts);
  if (!g) throw new Error("Canvas 2D is not available");
  return g;
}
/** Makes a w×h sprite; `fn` draws it and may return lights or smoke. */
export function sprite(w: number, h: number, fn: (g: Ctx, w: number, h: number) => Partial<Sprite> | void): Sprite {
  const c = canvas(w, h);
  const meta = fn(ctx2d(c), w, h) || {};
  return { c, w, h, lights: [], smoke: [], ...meta };
}
/** Filled rectangle, snapped to whole pixels. */
export const R = (g: Ctx, col: string, x: number, y: number, w: number, h: number) => {
  g.fillStyle = col;
  g.fillRect(x | 0, y | 0, w | 0, h | 0);
};

/* ---------- rustic parts (personal side) ---------- */
export function roof(g: Ctx, x: number, y: number, w: number, h: number, r: string[], seed: number) {
  R(g, r[1], x, y, w, h);
  for (let row = 0; row * 4 < h; row++) {
    const yy = y + row * 4, hh = Math.min(3, y + h - yy);
    R(g, row % 2 ? r[1] : r[2], x, yy, w, hh);
    if (yy + 3 < y + h) R(g, r[0], x, yy + 3, w, 1);
    for (let cx = x + (row % 2 ? 3 : 0); cx < x + w; cx += 6) {
      R(g, r[0], cx, yy, 1, hh);
      if (hash(cx, yy + seed) > 0.72) R(g, r[3], cx + 1, yy, 4, 1);
    }
  }
  R(g, r[3], x, y, w, 2);
  R(g, OUT, x - 1, y - 1, w + 2, 1);
  R(g, OUT, x - 1, y, 1, h);
  R(g, OUT, x + w, y, 1, h);
  R(g, OUT, x - 1, y + h, w + 2, 2);
  g.fillStyle = "rgba(255,214,130,.13)";
  g.fillRect(x, y, Math.round(w * 0.3), h);
  g.fillStyle = "rgba(20,10,0,.18)";
  g.fillRect(x + Math.round(w * 0.72), y, Math.round(w * 0.28), h);
}
export function stones(g: Ctx, x: number, y: number, w: number, h: number, r: string[], seed: number) {
  R(g, r[0], x, y, w, h);
  let row = 0;
  for (let yy = y; yy < y + h; yy += 5, row++) {
    let cx = x - (row % 2 ? 4 : 0);
    while (cx < x + w) {
      const bw = 7 + Math.floor(hash(cx + seed, yy) * 6);
      const x0 = Math.max(x, cx), x1 = Math.min(x + w, cx + bw - 1);
      const hh = Math.min(4, y + h - yy);
      if (x1 > x0 && hh > 0) {
        const k = 1 + Math.floor(hash(cx, yy + seed) * 3);
        R(g, r[k], x0, yy, x1 - x0, hh);
        R(g, r[Math.min(k + 1, r.length - 1)], x0, yy, x1 - x0, 1);
      }
      cx += bw;
    }
  }
}
export function timber(g: Ctx, x: number, y: number, w: number, h: number, plaster: string) {
  R(g, plaster, x, y, w, h);
  for (let i = 0; i < 90; i++) R(g, "rgba(90,60,25,.16)", x + hash(i, x) * w, y + hash(y, i) * h, 2, 1);
  R(g, BEAM, x, y, w, 2);
  R(g, BEAM, x, y + h - 3, w, 3);
  R(g, BEAM, x, y + Math.floor(h / 2), w, 2);
  for (let cx = x; cx <= x + w - 3; cx += 18) R(g, BEAM, cx, y, 3, h);
  R(g, BEAM, x + w - 3, y, 3, h);
}
export function win(g: Ctx, x: number, y: number, w: number, h: number, glass = AMBER) {
  R(g, BEAM, x - 1, y - 1, w + 2, h + 2);
  R(g, glass, x, y, w, h);
  R(g, "rgba(255,240,200,.6)", x, y, w, 1);
  R(g, BEAM, x + (w >> 1), y, 1, h);
  R(g, BEAM, x, y + (h >> 1), w, 1);
}
export function door(g: Ctx, x: number, y: number, w: number, h: number) {
  R(g, OUT, x - 1, y - 2, w + 2, h + 2);
  R(g, "#5c3a1c", x, y, w, h);
  for (let i = 2; i < w; i += 3) R(g, "#452a13", x + i, y, 1, h);
  R(g, "#d6a84c", x + w - 3, y + (h >> 1), 1, 2);
}
export function chimney(g: Ctx, x: number, y: number, w: number, h: number) {
  stones(g, x, y, w, h, DSTONE, x);
  R(g, OUT, x - 1, y - 1, w + 2, 2);
  R(g, "#14100b", x + 1, y, w - 2, 1);
}
/** Cone roof. `stripes` swaps shading for alternating stripe colours. */
export function cone(g: Ctx, cx: number, y: number, w: number, h: number, r: string[], stripes?: [string, string]) {
  for (let i = 0; i < h; i++) {
    const hw = Math.max(1, (w / 2) * ((i + 1) / h));
    for (let dx = -hw; dx < hw; dx++) {
      const t = (dx + hw) / (2 * hw);
      let col: string;
      if (stripes) {
        col = stripes[Math.floor(t * 8) % 2];
      } else {
        let k = t < 0.28 ? 3 : t < 0.6 ? 2 : t < 0.82 ? 1 : 0;
        if (i % 4 === 3) k = Math.max(0, k - 1);
        col = r[k];
      }
      R(g, col, cx + dx, y + i, 1, 1);
      if (stripes && t > 0.7) R(g, `rgba(20,8,0,${(t - 0.7) * 0.9})`, cx + dx, y + i, 1, 1);
      if (stripes && t < 0.25) R(g, `rgba(255,230,180,${(0.25 - t) * 0.8})`, cx + dx, y + i, 1, 1);
    }
    R(g, OUT, cx - hw - 1, y + i, 1, 1);
    R(g, OUT, cx + hw, y + i, 1, 1);
  }
  R(g, OUT, cx - w / 2 - 1, y + h, w + 2, 2);
}
export function banner(g: Ctx, x: number, y: number, w: number, h: number, cloth = "#7a1f1a") {
  R(g, OUT, x - 1, y - 1, w + 2, h + 1);
  R(g, cloth, x, y, w, h - 3);
  R(g, "rgba(255,255,255,.12)", x, y, 2, h - 3);
  for (let i = 0; i < w; i++) R(g, cloth, x + i, y + h - 3, 1, 3 - Math.abs(i - w / 2) * (3 / (w / 2)));
}
/** Draws a picture from a string map: each character picks a colour. */
export function pixels(g: Ctx, x: number, y: number, rows: string[], colours: Record<string, string>, scale = 1) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = colours[ch];
    if (c) R(g, c, x + i * scale, y + j * scale, scale, scale);
  }));
}

/* ---------- drafting parts (professional side) ---------- */
/** Ink-outlined box with a paper fill. */
export function inkBox(g: Ctx, x: number, y: number, w: number, h: number, fill = SHEET) {
  R(g, INK, x, y, w, h);
  R(g, fill, x + 1, y + 1, w - 2, h - 2);
}
/** Diagonal hatching inside a rectangle, for shade. */
export function hatch(g: Ctx, x: number, y: number, w: number, h: number, step = 4, col = INK_SOFT) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if ((xx + (h - yy)) % step === 0) R(g, col, x + xx, y + yy, 1, 1);
}
/** Dashed ink rectangle outline, for things not built yet. */
export function dashed(g: Ctx, x: number, y: number, w: number, h: number, col = INK) {
  for (let i = 0; i < w; i++) if (i % 5 < 3) { R(g, col, x + i, y, 1, 1); R(g, col, x + i, y + h - 1, 1, 1); }
  for (let i = 0; i < h; i++) if (i % 5 < 3) { R(g, col, x, y + i, 1, 1); R(g, col, x + w - 1, y + i, 1, 1); }
}
