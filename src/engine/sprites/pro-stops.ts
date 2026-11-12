/* Professional road stops beyond the career road: four project designs,
   four skills designs, and the drafted signboard. */
import { ACCENT, GLASS, INK, INK_SOFT, SHEET, SHEET_2, SHEET_3 } from "../palette";
import { R, hatch, inkBox, sprite } from "./kit";
import { block, gallery, workshop } from "./pro";

/* ---------- project stops ---------- */
const glassCube = () => sprite(100, 92, (g, W, H) => {
  inkBox(g, 0, 0, W, 16, SHEET_2);
  for (let i = 0; i < 5; i++) inkBox(g, 10 + i * 17, 5, 10, 6, SHEET);
  const fy = 15, fh = H - fy;
  inkBox(g, 0, fy, W, fh, GLASS);
  for (let x = 12; x < W - 4; x += 12) R(g, INK, x, fy + 1, 1, fh - 2);
  for (let y = fy + 18; y < H - 2; y += 18) R(g, INK, 1, y, W - 2, 1);
  for (let i = 0; i < 6; i++) for (let k = 0; k < 10; k++) R(g, SHEET, 6 + i * 16 + k, fy + 15 - k, 1, 1);
  inkBox(g, W / 2 - 10, H - 22, 20, 22, ACCENT);
  R(g, INK, W / 2, H - 21, 1, 21);
  hatch(g, Math.round(W * 0.75), fy + 1, Math.round(W * 0.25) - 1, fh - 2, 4);
});

const labTower = () => sprite(76, 122, (g, W) => {
  R(g, INK, W / 2, 0, 1, 14);
  inkBox(g, W / 2 - 9, 0, 18, 5, SHEET);
  R(g, ACCENT, W / 2 - 1, 5, 3, 3);
  const mid = block(g, 10, 12, W - 20, 3, 10, 41) - 1;
  for (let x = 14; x < W - 12; x += 6) R(g, INK_SOFT, x, 24, 1, mid - 26);
  const bottom = block(g, 0, mid, W, 2, 10, 43);
  inkBox(g, W / 2 - 8, bottom - 15, 16, 15, SHEET_3);
  R(g, ACCENT, W / 2 - 8, bottom - 15, 16, 1);
});

const pavilion = () => sprite(134, 70, (g, W, H) => {
  inkBox(g, 12, 13, W - 24, H - 18, GLASS);
  for (let x = 22; x < W - 14; x += 10) R(g, INK_SOFT, x, 14, 1, H - 20);
  for (let i = 0; i < 7; i++) for (let k = 0; k < 9; k++) R(g, SHEET, 20 + i * 15 + k, 30 - k, 1, 1);
  inkBox(g, 0, 0, W, 14, SHEET_2);
  R(g, ACCENT, 1, 11, W - 2, 2);
  for (const x of [4, W - 6]) R(g, INK, x, 14, 2, H - 18);
  inkBox(g, W / 2 - 11, H - 24, 22, 19, SHEET_3);
  R(g, INK, W / 2, H - 23, 1, 18);
  inkBox(g, 0, H - 5, W, 5, SHEET_3);
});

/** Project stops: `v` picks one of four designs. */
export const projectHouse = (v: number) => [gallery, glassCube, labTower, pavilion][v % 4]();

/* ---------- skills stops ---------- */
const library = () => sprite(122, 94, (g, W, H) => {
  inkBox(g, 0, 0, W, 18, SHEET_2);
  R(g, ACCENT, 1, 15, W - 2, 2);
  inkBox(g, 4, 17, W - 8, H - 25);
  for (let i = 0; i < 7; i++) {
    if (i === 3) continue;
    const x = 11 + i * 15;
    inkBox(g, x, 26, 8, H - 44, GLASS);
    R(g, SHEET, x + 2, 28, 1, H - 50);
  }
  inkBox(g, W / 2 - 9, H - 36, 18, 28, SHEET_3);
  R(g, INK, W / 2, H - 35, 1, 27);
  inkBox(g, 0, H - 9, W, 5, SHEET_2);
  inkBox(g, 6, H - 5, W - 12, 5, SHEET_3);
  hatch(g, Math.round(W * 0.78), 18, Math.round(W * 0.22) - 5, H - 27, 4);
});

const silo = () => sprite(98, 112, (g, W, H) => {
  const cx = 30, r = 24, top = 12;
  inkBox(g, 54, 46, W - 54, H - 46);
  for (let i = 0; i < 3; i++) inkBox(g, 60 + i * 12, 58, 7, 9, i === 1 ? ACCENT : GLASS);
  inkBox(g, 66, H - 20, 16, 20, SHEET_3);
  for (let y = top; y < H; y++) {
    for (let x = -r; x <= r; x++) {
      const t = (x + r) / (2 * r);
      R(g, t > 0.62 && (x + y) % 3 === 0 ? INK_SOFT : SHEET, cx + x, y, 1, 1);
    }
    R(g, INK, cx - r - 1, y, 1, 1);
    R(g, INK, cx + r + 1, y, 1, 1);
  }
  for (let band = top + 20; band < H; band += 18) for (let x = -r; x <= r; x++) {
    const sag = Math.round(Math.sqrt(1 - (x * x) / (r * r)) * 5);
    const gold = band === top + 56;
    R(g, gold ? ACCENT : INK_SOFT, cx + x, band + sag, 1, gold ? 2 : 1);
  }
  for (let x = -r - 1; x <= r + 1; x++) {
    const e = Math.round(Math.sqrt(Math.max(0, 1 - (x * x) / ((r + 1) * (r + 1)))) * 7);
    R(g, SHEET_2, cx + x, top - e, 1, e * 2);
    R(g, INK, cx + x, top - e, 1, 1);
    R(g, INK, cx + x, top + e, 1, 1);
  }
  R(g, INK, 0, H - 1, W, 1);
});

const aframe = () => sprite(104, 90, (g, W, H) => {
  const roofH = 58;
  for (let y = 0; y < roofH; y++) {
    const hw = Math.round((y / roofH) * (W / 2 - 2)) + 1;
    R(g, y % 5 === 0 ? INK_SOFT : SHEET_2, W / 2 - hw, y, hw * 2, 1);
    R(g, INK, W / 2 - hw, y, 1, 1);
    R(g, INK, W / 2 + hw - 1, y, 1, 1);
    if (y > 16) {
      const ihw = Math.round(((y - 16) / roofH) * (W / 2 - 18));
      if (ihw > 0) R(g, GLASS, W / 2 - ihw, y, ihw * 2, 1);
    }
  }
  inkBox(g, 4, roofH, W - 8, H - roofH);
  inkBox(g, W / 2 - 10, H - 24, 20, 24, SHEET_3);
  R(g, ACCENT, W / 2 - 10, H - 24, 20, 1);
  for (const x of [14, W - 30]) inkBox(g, x, roofH + 8, 16, 12, GLASS);
  hatch(g, W / 2 + 6, roofH + 1, W / 2 - 11, H - roofH - 2, 4);
});

/** Skills stops: `v` picks one of four designs. */
export const skillHouse = (v: number) => [workshop, library, silo, aframe][v % 4]();

/* ---------- small things ---------- */
/** A drafted signboard. The UI writes the road's name on its face. */
export const proBoard = () => sprite(72, 40, (g, W, H) => {
  R(g, INK, 12, 20, 1, H - 20);
  R(g, INK, W - 13, 20, 1, H - 20);
  inkBox(g, 0, 1, W, 24, SHEET);
  R(g, ACCENT, 1, 2, W - 2, 2);
  R(g, INK, 6, H - 1, 12, 1);
  R(g, INK, W - 18, H - 1, 12, 1);
});

export const planter = () => sprite(22, 22, (g) => {
  inkBox(g, 3, 13, 16, 9, SHEET_2);
  for (let y = -7; y <= 7; y++) for (let x = -8; x <= 8; x++) {
    const d = (x * x) / 64 + (y * y) / 49;
    if (d <= 1) R(g, d > 0.75 ? INK : (x + y) % 3 === 0 && x + y > 0 ? INK_SOFT : SHEET, 11 + x, 8 + y, 1, 1);
  }
});
