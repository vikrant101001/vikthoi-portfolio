/* Trees for both halves: painted autumn oaks and pines on the personal side,
   ink-drawn trees on the professional side. */
import { BAYER, hash, rng } from "../math";
import { INK, INK_SOFT, OUT, SHEET } from "../palette";
import { R, sprite, type Sprite } from "./kit";

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

/** Ink tree: a round canopy outline with hatched shade. `tall` makes a cypress. */
export function inkTree(seed: number, tall = false): Sprite {
  const rx = tall ? 7 : 10 + (seed % 3) * 2, ry = tall ? 17 : rx;
  const W = rx * 2 + 4, H = ry * 2 + 18;
  return sprite(W, H, (g) => {
    const cx = W / 2, cy = ry + 2;
    R(g, INK, cx, cy + ry - 2, 1, H - (cy + ry - 2));
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) {
      const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (d > 1) continue;
      const edge = d > 0.78;
      const shade = x / rx + y / ry > 0.35 && (x + y + 64) % 3 === 0;
      R(g, edge ? INK : shade ? INK_SOFT : SHEET, cx + x, cy + y, 1, 1);
    }
    /* A few inner strokes so it reads as foliage, not a balloon. */
    for (let i = 0; i < 4; i++) {
      const a = hash(seed, i) * 6.28, r = (0.35 + hash(i, seed) * 0.3);
      R(g, INK_SOFT, cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r, 3, 1);
    }
  });
}
