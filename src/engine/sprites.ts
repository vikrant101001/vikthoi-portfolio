/* Procedural pixel art. Every sprite is drawn in code, so there are no image
   files to license or load. */
import { BAYER, hash, rng } from "./math";
import { AMBER, BEAM, COPPER, DSTONE, GOLD, OUT, SLATE, STONE, TERRA, THATCH } from "./palette";
import type { BuildingKind, Facing, PropKind } from "./types";

export interface SpriteLight { dx: number; dy: number; r: number; hot?: boolean }
export interface SpriteSmoke { dx: number; dy: number; heavy?: boolean }
export interface Sprite { c: HTMLCanvasElement; w: number; h: number; lights: SpriteLight[]; smoke: SpriteSmoke[] }
type Ctx = CanvasRenderingContext2D;

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
export function sprite(w: number, h: number, fn: (g: Ctx, w: number, h: number) => Partial<Sprite> | void): Sprite {
  const c = canvas(w, h);
  const meta = fn(ctx2d(c), w, h) || {};
  return { c, w, h, lights: [], smoke: [], ...meta };
}
export const R = (g: Ctx, col: string, x: number, y: number, w: number, h: number) => {
  g.fillStyle = col;
  g.fillRect(x | 0, y | 0, w | 0, h | 0);
};

/* ---------- building parts ---------- */
function roof(g: Ctx, x: number, y: number, w: number, h: number, r: string[], seed: number) {
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
function timber(g: Ctx, x: number, y: number, w: number, h: number, plaster: string) {
  R(g, plaster, x, y, w, h);
  for (let i = 0; i < 90; i++) R(g, "rgba(90,60,25,.16)", x + hash(i, x) * w, y + hash(y, i) * h, 2, 1);
  R(g, BEAM, x, y, w, 2);
  R(g, BEAM, x, y + h - 3, w, 3);
  R(g, BEAM, x, y + Math.floor(h / 2), w, 2);
  for (let cx = x; cx <= x + w - 3; cx += 18) R(g, BEAM, cx, y, 3, h);
  R(g, BEAM, x + w - 3, y, 3, h);
}
function win(g: Ctx, x: number, y: number, w: number, h: number) {
  R(g, BEAM, x - 1, y - 1, w + 2, h + 2);
  R(g, AMBER, x, y, w, h);
  R(g, "#ffe6a6", x, y, w, 1);
  R(g, BEAM, x + (w >> 1), y, 1, h);
  R(g, BEAM, x, y + (h >> 1), w, 1);
}
function door(g: Ctx, x: number, y: number, w: number, h: number) {
  R(g, OUT, x - 1, y - 2, w + 2, h + 2);
  R(g, "#5c3a1c", x, y, w, h);
  for (let i = 2; i < w; i += 3) R(g, "#452a13", x + i, y, 1, h);
  R(g, "#d6a84c", x + w - 3, y + (h >> 1), 1, 2);
}
function chimney(g: Ctx, x: number, y: number, w: number, h: number) {
  stones(g, x, y, w, h, DSTONE, x);
  R(g, OUT, x - 1, y - 1, w + 2, 2);
  R(g, "#14100b", x + 1, y, w - 2, 1);
}
function cyl(g: Ctx, x: number, y: number, w: number, h: number, r: string[], seed: number) {
  stones(g, x, y, w, h, r, seed);
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const a = t < 0.3 ? (0.3 - t) * 0.35 : 0;
    const d = t > 0.45 ? (t - 0.45) * 0.95 : 0;
    if (a) R(g, `rgba(255,210,130,${a})`, x + i, y, 1, h);
    if (d) R(g, `rgba(18,10,4,${d})`, x + i, y, 1, h);
  }
}
function cone(g: Ctx, cx: number, y: number, w: number, h: number, r: string[]) {
  for (let i = 0; i < h; i++) {
    const hw = Math.max(1, (w / 2) * ((i + 1) / h));
    for (let dx = -hw; dx < hw; dx++) {
      const t = (dx + hw) / (2 * hw);
      const band = (i >> 2) % 2;
      let k = t < 0.28 ? 3 : t < 0.6 ? 2 : t < 0.82 ? 1 : 0;
      if (i % 4 === 3) k = Math.max(0, k - 1);
      if (hash(Math.floor((dx + 40) / 4) + band, i >> 2) > 0.85) k = Math.max(0, k - 1);
      R(g, r[k], cx + dx, y + i, 1, 1);
    }
    R(g, OUT, cx - hw - 1, y + i, 1, 1);
    R(g, OUT, cx + hw, y + i, 1, 1);
  }
  R(g, OUT, cx - w / 2 - 1, y + h, w + 2, 2);
}
function banner(g: Ctx, x: number, y: number, w: number, h: number) {
  R(g, OUT, x - 1, y - 1, w + 2, h + 1);
  R(g, "#7a1f1a", x, y, w, h - 3);
  R(g, "#9a2b22", x, y, 2, h - 3);
  for (let i = 0; i < w; i++) R(g, "#7a1f1a", x + i, y + h - 3, 1, 3 - Math.abs(i - w / 2) * (3 / (w / 2)));
  const cx = x + (w >> 1), cy = y + (h >> 1) - 2;
  R(g, GOLD, cx - 1, cy - 2, 2, 5);
  R(g, GOLD, cx - 3, cy, 6, 1);
  R(g, GOLD, cx - 2, cy - 1, 4, 3);
}
function crenels(g: Ctx, x: number, y: number, w: number, r: string[]) {
  for (let cx = x; cx < x + w - 3; cx += 8) {
    R(g, OUT, cx - 1, y - 1, 7, 7);
    R(g, r[3], cx, y, 5, 6);
    R(g, r[4], cx, y, 5, 1);
  }
}

/* ---------- buildings ---------- */
export function houseSprite(v: 0 | 1 | 2): Sprite {
  const spec = [
    { w: 74, h: 72, roof: THATCH, plaster: "#c8a86e" },
    { w: 66, h: 66, roof: TERRA, plaster: "#bb9860" },
    { w: 70, h: 62, roof: SLATE, plaster: "#ceb07a" },
  ][v];
  return sprite(spec.w + 4, spec.h, (g, W, H) => {
    const wall = 26, rh = H - wall;
    timber(g, 6, rh, W - 12, wall, spec.plaster);
    roof(g, 2, 2, W - 4, rh, spec.roof, v * 91);
    door(g, (W >> 1) - 5, H - 16, 10, 16);
    win(g, 14, rh + 8, 8, 8);
    win(g, W - 22, rh + 8, 8, 8);
    chimney(g, W - 20, 0, 8, 12);
    return {
      lights: [{ dx: -W / 2 + 18, dy: -14, r: 24 }, { dx: W / 2 - 18, dy: -14, r: 24 }],
      smoke: [{ dx: W / 2 - 16, dy: -H }],
    };
  });
}

export const BUILDINGS: Record<BuildingKind, () => Sprite> = {
  keep: () => sprite(240, 172, (g) => {
    stones(g, 40, 44, 160, 60, DSTONE, 3); crenels(g, 40, 40, 160, DSTONE);
    stones(g, 82, 14, 76, 94, STONE, 7); crenels(g, 82, 10, 76, STONE);
    win(g, 96, 40, 8, 14); win(g, 136, 40, 8, 14); win(g, 114, 30, 12, 20);
    stones(g, 22, 96, 196, 76, STONE, 5); R(g, "rgba(18,10,4,.3)", 22, 96, 196, 5);
    crenels(g, 22, 90, 196, STONE);
    cyl(g, 2, 66, 46, 106, STONE, 11); cone(g, 25, 22, 54, 44, TERRA);
    cyl(g, 192, 66, 46, 106, STONE, 13); cone(g, 215, 22, 54, 44, TERRA);
    win(g, 20, 104, 7, 11); win(g, 210, 104, 7, 11);
    R(g, OUT, 97, 118, 46, 54); R(g, DSTONE[3], 99, 120, 42, 52); R(g, "#21140a", 103, 126, 34, 46);
    for (let i = 0; i < 6; i++) R(g, "#463320", 105 + i * 6, 126, 2, 34);
    for (let i = 0; i < 5; i++) R(g, "#463320", 103, 130 + i * 7, 34, 2);
    banner(g, 62, 108, 18, 46); banner(g, 160, 108, 18, 46);
    return {
      lights: [
        { dx: -97, dy: -62, r: 30 }, { dx: 97, dy: -62, r: 30 },
        { dx: -24, dy: -110, r: 28 }, { dx: 24, dy: -110, r: 28 }, { dx: 0, dy: -24, r: 56 },
      ],
    };
  }),

  forge: () => sprite(122, 98, (g, W, H) => {
    const wall = 36, rh = H - wall;
    stones(g, 4, rh, W - 8, wall, DSTONE, 9);
    roof(g, 1, 8, W - 2, rh - 8, SLATE, 17);
    chimney(g, 88, 0, 18, 30);
    R(g, OUT, 40, rh + 6, 42, 30); R(g, "#2a130a", 42, rh + 8, 38, 28);
    R(g, "#a83a12", 46, rh + 20, 30, 16); R(g, "#ea7a1c", 50, rh + 24, 22, 12); R(g, AMBER, 56, rh + 28, 10, 8);
    R(g, BEAM, 38, rh + 4, 46, 4); R(g, BEAM, 38, rh + 4, 4, 32); R(g, BEAM, 80, rh + 4, 4, 32);
    win(g, 14, rh + 12, 10, 10); win(g, 98, rh + 12, 10, 10);
    return {
      lights: [{ dx: 0, dy: -16, r: 72, hot: true }, { dx: -42, dy: -18, r: 22 }, { dx: 42, dy: -18, r: 22 }],
      smoke: [{ dx: 36, dy: -98, heavy: true }],
    };
  }),

  guild: () => sprite(160, 106, (g, W, H) => {
    const wall = 38, rh = H - wall;
    timber(g, 6, rh, W - 12, wall, "#c8a86e");
    roof(g, 2, 8, W - 4, rh - 8, TERRA, 31);
    roof(g, 56, 0, 48, rh + 4, TERRA, 37);
    timber(g, 60, rh + 4, 40, wall - 4, "#d6ba84");
    door(g, 70, H - 24, 20, 24); R(g, GOLD, 79, H - 24, 2, 24);
    banner(g, 40, rh + 6, 12, 28); banner(g, 108, rh + 6, 12, 28);
    win(g, 18, rh + 11, 12, 11); win(g, 130, rh + 11, 12, 11);
    chimney(g, 128, 0, 10, 22);
    return {
      lights: [{ dx: -56, dy: -20, r: 26 }, { dx: 56, dy: -20, r: 26 }, { dx: 0, dy: -8, r: 34 }],
      smoke: [{ dx: 53, dy: -106 }],
    };
  }),

  archive: () => sprite(124, 132, (g, W, H) => {
    const wall = 52, rh = H - wall;
    stones(g, 8, rh, W - 16, wall, STONE, 21);
    roof(g, 4, 30, W - 8, rh - 30, SLATE, 41);
    cyl(g, 42, 34, 40, 62, STONE, 23);
    cone(g, 62, 0, 50, 36, COPPER);
    R(g, OUT, 52, 44, 20, 30);
    const glass = ["#d9a23a", "#a33a24", "#2f6d62", "#ecc867"];
    for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) R(g, glass[Math.floor(hash(x, y) * 4)], 54 + x * 3.2, 46 + y * 3.8, 3, 3);
    door(g, 52, H - 26, 20, 26);
    R(g, OUT, 18, rh + 14, 14, 20); R(g, AMBER, 20, rh + 16, 10, 16); R(g, BEAM, 24, rh + 16, 1, 16);
    R(g, OUT, 92, rh + 14, 14, 20); R(g, AMBER, 94, rh + 16, 10, 16); R(g, BEAM, 98, rh + 16, 1, 16);
    return { lights: [{ dx: 0, dy: -72, r: 40 }, { dx: -37, dy: -26, r: 26 }, { dx: 37, dy: -26, r: 26 }] };
  }),

  tavern: () => sprite(134, 102, (g, W, H) => {
    const wall = 40, rh = H - wall;
    timber(g, 6, rh, W - 12, wall, "#d0b078");
    roof(g, 2, 6, W - 4, rh - 6, THATCH, 51);
    chimney(g, 22, 0, 12, 22);
    door(g, 56, H - 24, 22, 24);
    win(g, 18, rh + 11, 14, 12); win(g, 100, rh + 11, 14, 12);
    R(g, BEAM, 84, rh + 2, 22, 2); R(g, BEAM, 92, rh + 3, 1, 6); R(g, BEAM, 100, rh + 3, 1, 6);
    R(g, OUT, 89, rh + 8, 15, 12); R(g, "#d6a84c", 90, rh + 9, 13, 10); R(g, "#6e431c", 93, rh + 11, 6, 6); R(g, "#f4e6c0", 93, rh + 10, 6, 2);
    return {
      lights: [{ dx: -42, dy: -20, r: 34 }, { dx: 40, dy: -20, r: 34 }, { dx: 0, dy: -8, r: 40 }],
      smoke: [{ dx: -39, dy: -102, heavy: true }],
    };
  }),

  raven: () => sprite(66, 176, (g) => {
    cyl(g, 11, 52, 44, 124, STONE, 61);
    R(g, DSTONE[2], 5, 52, 56, 6); R(g, OUT, 4, 58, 58, 2);
    cone(g, 33, 2, 60, 50, SLATE);
    win(g, 28, 70, 10, 14); win(g, 28, 110, 8, 12);
    door(g, 24, 150, 18, 26);
    return { lights: [{ dx: 0, dy: -98, r: 34 }, { dx: 0, dy: -60, r: 24 }] };
  }),

  brazier: () => sprite(40, 34, (g) => {
    R(g, OUT, 4, 22, 32, 12); stones(g, 5, 23, 30, 10, STONE, 71);
    R(g, OUT, 10, 12, 20, 11); stones(g, 11, 13, 18, 9, DSTONE, 73);
    R(g, "#d6a84c", 11, 12, 18, 1);
    R(g, "#2a130a", 13, 10, 14, 3);
  }),
};

export const PROPS: Record<PropKind, () => Sprite> = {
  lamp: () => sprite(10, 34, (g) => {
    R(g, OUT, 4, 8, 2, 26); R(g, "#55402a", 4, 8, 1, 26);
    R(g, OUT, 2, 2, 6, 8); R(g, AMBER, 3, 3, 4, 6); R(g, "#fff0c0", 4, 4, 2, 3);
    R(g, OUT, 2, 32, 6, 2);
    return { lights: [{ dx: 0, dy: -28, r: 44 }] };
  }),
  sign: () => sprite(26, 30, (g) => {
    R(g, OUT, 12, 2, 3, 28); R(g, "#6e4a26", 13, 2, 1, 28);
    R(g, OUT, 2, 4, 22, 8); R(g, "#a07a42", 3, 5, 20, 6); R(g, "#6e4a26", 6, 7, 14, 1);
    R(g, OUT, 4, 14, 20, 7); R(g, "#94703c", 5, 15, 18, 5); R(g, "#6e4a26", 8, 17, 11, 1);
  }),
  anvil: () => sprite(20, 14, (g) => {
    R(g, OUT, 6, 8, 8, 6); R(g, "#3d3a36", 7, 9, 6, 5);
    R(g, OUT, 1, 2, 18, 7); R(g, "#5b5750", 2, 3, 16, 5); R(g, "#8c8678", 2, 3, 16, 1);
  }),
  barrel: () => sprite(14, 18, (g) => {
    R(g, OUT, 1, 1, 12, 17); R(g, "#7c5228", 2, 2, 10, 15); R(g, "#a0703a", 3, 2, 3, 15);
    R(g, "#4a4034", 2, 5, 10, 1); R(g, "#4a4034", 2, 13, 10, 1); R(g, "#55381c", 3, 2, 8, 2);
  }),
  crate: () => sprite(18, 18, (g) => {
    R(g, OUT, 1, 1, 16, 17); R(g, "#94703c", 2, 2, 14, 15); R(g, "#b38a50", 2, 2, 14, 2);
    R(g, "#6e4a26", 2, 8, 14, 1); R(g, "#6e4a26", 8, 2, 1, 15);
  }),
  hay: () => sprite(24, 18, (g) => {
    R(g, OUT, 2, 3, 20, 15); R(g, "#c49a32", 3, 4, 18, 13); R(g, "#ecc867", 3, 4, 18, 3);
    for (let i = 0; i < 16; i++) R(g, "#8f6c20", 3 + hash(i, 3) * 17, 7 + hash(3, i) * 9, 3, 1);
    R(g, "#6e4a26", 8, 4, 1, 13); R(g, "#6e4a26", 16, 4, 1, 13);
  }),
  board: () => sprite(42, 40, (g) => {
    R(g, OUT, 4, 8, 4, 32); R(g, OUT, 34, 8, 4, 32);
    R(g, "#6e4a26", 5, 8, 2, 32); R(g, "#6e4a26", 35, 8, 2, 32);
    R(g, OUT, 1, 3, 40, 26); R(g, "#6e4a26", 2, 4, 38, 24); R(g, "#55381c", 2, 4, 38, 2);
    for (const [x, y, w, h] of [[5, 8, 9, 12], [16, 7, 10, 14], [28, 9, 9, 11], [9, 19, 8, 7]]) {
      R(g, "#ead6a4", x, y, w, h); R(g, "#a33a24", x + (w >> 1), y, 1, 2); R(g, "#8f7a50", x + 1, y + 4, w - 2, 1);
    }
  }),
};

export const standingStone = (i: number) => sprite(18, 34, (g) => {
  const top = 2 + (i % 3) * 3;
  R(g, OUT, 2, top, 14, 34 - top);
  stones(g, 3, top + 1, 12, 33 - top, DSTONE, i * 9);
  R(g, "rgba(255,210,130,.2)", 3, top + 1, 3, 33 - top);
  R(g, GOLD, 8, top + 10, 2, 7); R(g, GOLD, 6, top + 13, 6, 1);
});
export const fencePost = () => sprite(4, 12, (g) => { R(g, OUT, 0, 0, 4, 12); R(g, "#7a5630", 1, 1, 2, 11); });

/* ---------- trees ---------- */
const OAK_COLOURS = [
  ["#3d2a10", "#6a4414", "#96641a", "#c08d28", "#e2b546"],
  ["#3a1f0e", "#6b3214", "#9b4c1a", "#c87426", "#e39c3e"],
  ["#3a3312", "#5e5418", "#857a22", "#ac9f30", "#d0c052"],
];
export function oak(variant: number, seed: number): Sprite {
  const colors = OAK_COLOURS[variant % 3];
  return sprite(46, 56, (g) => {
    R(g, OUT, 20, 32, 7, 24); R(g, "#4a2f18", 21, 32, 5, 24); R(g, "#6a4624", 21, 32, 2, 24);
    const r = rng(seed), blobs = [{ x: 23, y: 21, r: 17 }];
    for (let i = 0; i < 6; i++) {
      const a = r() * 6.28;
      blobs.push({ x: 23 + Math.cos(a) * 11, y: 21 + Math.sin(a) * 9, r: 7 + r() * 5 });
    }
    for (let y = 0; y < 44; y++) for (let x = 0; x < 46; x++) {
      let best = -1, nx = 0, ny = 0;
      for (const b of blobs) {
        const dx = (x - b.x) / b.r, dy = (y - b.y) / b.r, d = 1 - (dx * dx + dy * dy);
        if (d > best) { best = d; nx = dx; ny = dy; }
      }
      if (best < -0.03) continue;
      let v = 0.5 + (-nx * 0.5 - ny * 0.55) * 0.75 + (hash(x >> 1, (y >> 1) + seed) - 0.5) * 0.4 + BAYER[(y & 3) * 4 + (x & 3)] * 0.14;
      if (best < 0.1) v = Math.min(v, 0.14);
      R(g, colors[Math.max(0, Math.min(4, Math.floor(v * 5)))], x, y, 1, 1);
    }
  });
}
export function pine(seed: number): Sprite {
  const C = ["#191d10", "#262a14", "#3a3d1a", "#565522", "#7c7430"];
  return sprite(34, 60, (g) => {
    R(g, OUT, 15, 46, 5, 14); R(g, "#46301a", 16, 46, 3, 14);
    for (let t = 0; t < 5; t++) {
      const y0 = t * 9, h = 18, wmax = 12 + t * 5;
      for (let i = 0; i < h; i++) {
        const hw = wmax * (i / h) * 0.5 + 1;
        for (let dx = -hw; dx < hw; dx++) {
          const s = (dx + hw) / (2 * hw);
          let v = 1 - s + (i / h - 0.7) * -0.4 + (hash((dx | 0) + seed, i + t * 19) - 0.5) * 0.45;
          if (i > h - 3) v *= 0.4;
          R(g, C[Math.max(0, Math.min(4, Math.floor(v * 4.4)))], 17 + dx, y0 + i, 1, 1);
        }
      }
    }
  });
}

/* ---------- the traveller ---------- */
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
