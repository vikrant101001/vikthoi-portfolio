/* The professional side: line drawings on drafting paper, like an
   architect's plan that is still being drawn. Ink, paper, one gold accent. */
import { hash } from "../math";
import { ACCENT, GLASS, INK, INK_SOFT, SHEET, SHEET_2, SHEET_3 } from "../palette";
import { R, dashed, hatch, inkBox, sprite, type Ctx } from "./kit";

/** Grid of windows on a facade; a few are lit gold. */
function windows(g: Ctx, x: number, y: number, w: number, rows: number, seed: number) {
  const cols = Math.floor((w - 6) / 10);
  const left = x + Math.floor((w - cols * 10 + 4) / 2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const lit = hash(c + seed, r + seed * 3) > 0.72;
    inkBox(g, left + c * 10, y + r * 16 + 4, 6, 9, lit ? ACCENT : GLASS);
    if (!lit) R(g, SHEET, left + c * 10 + 1, y + r * 16 + 5, 1, 3);
  }
}

/** One block of a building: flat roof seen from above, facade below.
    Returns the y where the block ends. */
export function block(g: Ctx, x: number, y: number, w: number, floors: number, roofD: number, seed: number) {
  inkBox(g, x, y, w, roofD + 1, SHEET_2);
  R(g, INK_SOFT, x + 3, y + 3, w - 6, 1);
  const fy = y + roofD;
  const fh = floors * 16 + 4;
  inkBox(g, x, fy, w, fh);
  windows(g, x, fy, w, floors, seed);
  hatch(g, x + Math.round(w * 0.72), fy + 1, Math.round(w * 0.28) - 1, fh - 2, 4);
  return fy + fh;
}

/** A career stop. `tier` 0-4: each stop stands taller than the last. */
export const office = (tier: number) => {
  const floors = tier + 1, W = 58 + tier * 6, roofD = 12;
  const upper = tier >= 3 ? 2 : 0;
  const antenna = tier === 4 ? 16 : 0;
  const H = antenna + (upper ? roofD - 4 + upper * 16 + 4 : 0) + roofD + (floors - upper) * 16 + 4 + 14;
  return sprite(W + 2, H, (g) => {
    let y = 0;
    if (antenna) {
      R(g, INK, W / 2, 0, 1, antenna + 2);
      R(g, ACCENT, W / 2 - 1, 0, 3, 3);
      y += antenna;
    }
    if (upper) y = block(g, 9, y, W - 18, upper, roofD - 4, tier * 7) - 1;
    const bottom = block(g, 0, y, W, floors - upper, roofD, tier * 13);
    /* Entrance canopy and door. */
    const dx = W / 2 - 7;
    inkBox(g, dx - 3, bottom - 4 - 13, 20, 4, SHEET_2);
    inkBox(g, dx, bottom - 13, 14, 13, SHEET_3);
    R(g, INK, dx + 7, bottom - 12, 1, 12);
    R(g, ACCENT, dx - 3, bottom - 4 - 13, 20, 1);
    /* Ground line. */
    R(g, INK, 0, H - 1, W + 2, 1);
    if (tier === 0) hatch(g, 1, H - 6, W - 1, 5, 3);
  });
};

/** The "coming soon" stop: scaffolding and a crane around a dashed outline. */
export const draft = () => sprite(92, 178, (g, W, H) => {
  dashed(g, 16, 40, 60, H - 40, INK);
  dashed(g, 22, 28, 48, 14, INK_SOFT);
  for (let y = 60; y < H; y += 22) for (let x = 16; x < 76; x++) if (x % 3) R(g, INK_SOFT, x, y, 1, 1);
  for (const x of [14, 46, 78]) R(g, INK, x, 50, 1, H - 50);
  for (let y = 54; y < H; y += 22) R(g, INK, 14, y, 65, 1);
  for (let y = 54; y < H - 22; y += 22) for (let k = 0; k < 22; k++) R(g, INK_SOFT, 14 + Math.round(k * 1.45), y + k, 1, 1);
  /* Crane. */
  R(g, INK, 84, 6, 2, H - 6);
  for (let y = 10; y < H; y += 8) { R(g, INK_SOFT, 82, y, 6, 1); }
  R(g, INK, 30, 6, 62, 2);
  R(g, ACCENT, 88, 4, 4, 6);
  R(g, INK, 40, 8, 1, 28); inkBox(g, 37, 36, 7, 5, ACCENT);
  /* Question mark plaque. */
  inkBox(g, 34, H - 32, 24, 22, SHEET);
  const q = ["###.", "...#", ".##.", ".#..", "....", ".#.."];
  q.forEach((row, j) => [...row].forEach((ch, i) => ch === "#" && R(g, ACCENT, 40 + i * 3, H - 29 + j * 3, 3, 3)));
  R(g, INK, 0, H - 1, W, 1);
});

/** Projects: a wide glass gallery with a gold band under the roof. */
export const gallery = () => sprite(158, 88, (g, W, H) => {
  inkBox(g, 0, 0, W, 20, SHEET_2);
  for (let i = 0; i < 5; i++) inkBox(g, 14 + i * 28, 6, 16, 8, GLASS);
  const fy = 19, fh = H - fy;
  inkBox(g, 0, fy, W, fh, GLASS);
  R(g, ACCENT, 1, fy + 1, W - 2, 2);
  for (let x = 8; x < W - 4; x += 10) R(g, INK, x, fy + 3, 1, fh - 3);
  R(g, INK, 1, fy + 30, W - 2, 1);
  for (let i = 0; i < 9; i++) for (let k = 0; k < 12; k++) R(g, SHEET, 14 + i * 16 + k, fy + 26 - k, 1, 1);
  inkBox(g, W / 2 - 14, H - 26, 28, 26, SHEET_3);
  R(g, INK, W / 2, H - 25, 1, 25);
  inkBox(g, W / 2 - 22, H - 32, 44, 6, SHEET);
  R(g, ACCENT, W / 2 - 22, H - 32, 44, 1);
  hatch(g, Math.round(W * 0.78), fy + 3, Math.round(W * 0.22) - 1, fh - 4, 5);
});

/** Skills: a workshop with a sawtooth roof and a gear over the door. */
export const workshop = () => sprite(130, 96, (g, W, H) => {
  const roofD = 28, teeth = 5, tw = W / teeth;
  for (let t = 0; t < teeth; t++) {
    const x0 = Math.round(t * tw);
    for (let y = 0; y < roofD; y++) {
      const rise = Math.round((y / roofD) * tw);
      R(g, SHEET_2, x0, y, rise, 1);
      R(g, INK, x0 + rise, y, 1, 1);
      if (y % 4 === 0) R(g, INK_SOFT, x0, y, rise, 1);
    }
    R(g, INK, x0, 0, 1, roofD);
    inkBox(g, x0 + Math.round(tw) - 5, 2, 4, roofD - 4, GLASS);
  }
  const fy = roofD, fh = H - fy;
  inkBox(g, 0, fy, W, fh);
  for (let y = fy + 6; y < H - 2; y += 6) R(g, INK_SOFT, 1, y, W - 2, 1);
  inkBox(g, W / 2 - 22, H - 36, 44, 36, SHEET_2);
  for (let y = H - 33; y < H; y += 4) R(g, INK, W / 2 - 21, y, 42, 1);
  /* Gear emblem. */
  const cx = W / 2, cy = fy + 14;
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    R(g, ACCENT, cx + Math.cos(ang) * 8 - 1.5, cy + Math.sin(ang) * 8 - 1.5, 3, 3);
  }
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
    const d = Math.hypot(x, y);
    if (d <= 6.5 && d > 2.5) R(g, ACCENT, cx + x, cy + y, 1, 1);
  }
  for (const wx of [12, W - 30]) { inkBox(g, wx, fy + 22, 18, 14, GLASS); R(g, INK, wx + 9, fy + 22, 1, 14); }
  hatch(g, Math.round(W * 0.74), fy + 1, Math.round(W * 0.26) - 1, fh - 2, 4);
});

export const inkLamp = () => sprite(8, 30, (g) => {
  R(g, INK, 3, 6, 1, 23);
  inkBox(g, 1, 1, 6, 6, SHEET);
  R(g, ACCENT, 2, 3, 4, 2);
  R(g, INK, 1, 29, 6, 1);
});
export const bench = () => sprite(22, 12, (g) => {
  inkBox(g, 0, 0, 22, 4, SHEET_2);
  inkBox(g, 0, 4, 22, 4, SHEET);
  R(g, INK, 2, 8, 1, 4); R(g, INK, 19, 8, 1, 4);
});
