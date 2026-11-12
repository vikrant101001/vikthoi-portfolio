/* The personal side: warm, rustic and a little silly. */
import { hash } from "../math";
import { AMBER, BEAM, DSTONE, GOLD, OUT, SLATE, TERRA, THATCH } from "../palette";
import { R, banner, chimney, cone, door, pixels, roof, sprite, stones, timber, win, type Sprite } from "./kit";

const SKULL = [
  "..######..",
  ".########.",
  "##########",
  "##..##..##",
  "##..##..##",
  "####..####",
  ".########.",
  "..#.##.#..",
  "..######..",
];

/** Vikskull Games: a stone hall with a giant skull over the door. */
export const skullHall = () => sprite(152, 124, (g, W, H) => {
  const wall = 44, rh = H - wall;
  stones(g, 6, rh, W - 12, wall, DSTONE, 81);
  roof(g, 2, 20, W - 4, rh - 20, SLATE, 83);
  /* A raised centre gable carries the sign. */
  roof(g, 46, 6, 60, rh - 2, TERRA, 85);
  R(g, OUT, 55, 8, 42, 36);
  R(g, "#1f1410", 56, 9, 40, 34);
  pixels(g, 61, 13, SKULL, { "#": "#efe2c4" }, 3);
  R(g, "#ff5a3a", 67, 22, 6, 6); R(g, "#ff5a3a", 79, 22, 6, 6);
  R(g, "#ffd28a", 69, 24, 2, 2); R(g, "#ffd28a", 81, 24, 2, 2);
  /* Arcade windows in mismatched colours. */
  const glass = ["#ffc65a", "#e0563a", "#59b3a0", "#c58be0"];
  for (let i = 0; i < 4; i++) win(g, 14 + i * 9 + (i > 1 ? 86 : 0), rh + 12, 7, 12, glass[i]);
  door(g, 64, H - 28, 24, 28);
  banner(g, 32, rh + 6, 12, 30, "#5b1b4a");
  banner(g, 108, rh + 6, 12, 30, "#5b1b4a");
  pixels(g, 35, rh + 14, ["###", "#.#", "###", ".#."], { "#": "#efe2c4" }, 2);
  pixels(g, 111, rh + 14, ["###", "#.#", "###", ".#."], { "#": "#efe2c4" }, 2);
  chimney(g, 128, 4, 10, 22);
  return {
    lights: [
      { dx: -6, dy: -100, r: 22, hot: true }, { dx: 6, dy: -100, r: 22, hot: true },
      { dx: -54, dy: -26, r: 30 }, { dx: 54, dy: -26, r: 30 }, { dx: 0, dy: -10, r: 40 },
    ],
    smoke: [{ dx: 57, dy: -120 }],
  };
});

/** Other fun stuff: a striped fair tent with pennants. */
export const tent = () => sprite(124, 112, (g, W, H) => {
  const wall = 34, top = 18, cx = W / 2;
  /* Pennant strings from the peak to the ground. */
  const flags = ["#c0392b", "#e0b24a", "#2e8b7a", "#efe2c4"];
  for (const dir of [-1, 1]) for (let i = 0; i < 12; i++) {
    const t = i / 11, x = cx + dir * (6 + t * 56), y = top - 4 + t * 92;
    R(g, OUT, x, y, 1, 1);
    if (i % 2 === 0 && i < 11) { R(g, flags[(i / 2) % 4], x - 1, y + 1, 3, 2); R(g, flags[(i / 2) % 4], x, y + 3, 1, 1); }
  }
  /* Striped wall. */
  for (let x = 14; x < W - 14; x++) {
    const stripe = Math.floor((x - 14) / 8) % 2 ? "#efe2c4" : "#b8322a";
    R(g, stripe, x, H - wall, 1, wall);
    const t = (x - 14) / (W - 28);
    if (t > 0.65) R(g, `rgba(20,8,0,${(t - 0.65) * 0.8})`, x, H - wall, 1, wall);
  }
  R(g, OUT, 13, H - wall, 1, wall); R(g, OUT, W - 14, H - wall, 1, wall); R(g, OUT, 13, H - 1, W - 26, 1);
  cone(g, cx, top, W - 16, H - wall - top, THATCH, ["#b8322a", "#efe2c4"]);
  /* Entrance flap. */
  for (let i = 0; i < 26; i++) R(g, i < 2 ? OUT : "#2a130a", cx - i * 0.45, H - 26 + i, i * 0.9 + 1, 1);
  R(g, "#ffc65a", cx - 3, H - 8, 6, 8);
  /* Flag on the peak. */
  R(g, OUT, cx, 2, 1, top); R(g, GOLD, cx + 1, 3, 9, 5); R(g, "#c0392b", cx + 1, 5, 9, 1);
  return { lights: [{ dx: 0, dy: -6, r: 46 }, { dx: -40, dy: -20, r: 20 }, { dx: 40, dy: -20, r: 20 }] };
});

/** Lectern at the start, holding the starting letter. */
export const lectern = () => sprite(26, 34, (g) => {
  R(g, OUT, 10, 14, 6, 20); R(g, "#6e4a26", 11, 14, 4, 20); R(g, "#94703c", 11, 14, 1, 20);
  R(g, OUT, 6, 31, 14, 3); R(g, "#55381c", 7, 31, 12, 2);
  R(g, OUT, 2, 6, 22, 10); R(g, "#7c5228", 3, 7, 20, 8);
  R(g, "#f4e6c0", 4, 5, 9, 9); R(g, "#ead6a4", 13, 5, 9, 9); R(g, "#b49a6c", 13, 5, 1, 9);
  for (let i = 0; i < 4; i++) { R(g, "#8a7350", 5, 7 + i * 2, 6, 1); R(g, "#8a7350", 15, 7 + i * 2, 5, 1); }
  R(g, "#a33a24", 19, 11, 3, 3);
  return { lights: [{ dx: 0, dy: -24, r: 34 }] };
});

export function cottage(v: 0 | 1 | 2): Sprite {
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

export const lamp = () => sprite(10, 34, (g) => {
  R(g, OUT, 4, 8, 2, 26); R(g, "#55402a", 4, 8, 1, 26);
  R(g, OUT, 2, 2, 6, 8); R(g, AMBER, 3, 3, 4, 6); R(g, "#fff0c0", 4, 4, 2, 3);
  R(g, OUT, 2, 32, 6, 2);
  return { lights: [{ dx: 0, dy: -28, r: 44 }] };
});
export const barrel = () => sprite(14, 18, (g) => {
  R(g, OUT, 1, 1, 12, 17); R(g, "#7c5228", 2, 2, 10, 15); R(g, "#a0703a", 3, 2, 3, 15);
  R(g, "#4a4034", 2, 5, 10, 1); R(g, "#4a4034", 2, 13, 10, 1); R(g, "#55381c", 3, 2, 8, 2);
});
export const crate = () => sprite(18, 18, (g) => {
  R(g, OUT, 1, 1, 16, 17); R(g, "#94703c", 2, 2, 14, 15); R(g, "#b38a50", 2, 2, 14, 2);
  R(g, "#6e4a26", 2, 8, 14, 1); R(g, "#6e4a26", 8, 2, 1, 15);
});
export const hay = () => sprite(24, 18, (g) => {
  R(g, OUT, 2, 3, 20, 15); R(g, "#c49a32", 3, 4, 18, 13); R(g, "#ecc867", 3, 4, 18, 3);
  for (let i = 0; i < 16; i++) R(g, "#8f6c20", 3 + hash(i, 3) * 17, 7 + hash(3, i) * 9, 3, 1);
  R(g, "#6e4a26", 8, 4, 1, 13); R(g, "#6e4a26", 16, 4, 1, 13);
});
/** A string of flags between two poles. */
export const bunting = () => sprite(72, 30, (g) => {
  R(g, OUT, 1, 2, 3, 28); R(g, "#6e4a26", 2, 2, 1, 28);
  R(g, OUT, 68, 2, 3, 28); R(g, "#6e4a26", 69, 2, 1, 28);
  const flags = ["#c0392b", "#e0b24a", "#2e8b7a", "#efe2c4", "#7a3a8a"];
  for (let x = 3; x < 69; x++) {
    const sag = Math.round(Math.sin(((x - 3) / 66) * Math.PI) * 6);
    R(g, OUT, x, 4 + sag, 1, 1);
    if ((x - 6) % 9 === 0 && x < 66) {
      const c = flags[((x - 6) / 9) % flags.length];
      for (let k = 0; k < 6; k++) R(g, c, x + Math.floor(k / 2), 5 + sag + k, 4 - Math.floor(k / 2) * 1.3, 1);
    }
  }
});
/** Windmill tower. The blades are drawn by the engine so they can turn. */
export const windmill = () => sprite(44, 92, (g, W, H) => {
  for (let y = 22; y < H; y++) {
    const t = (y - 22) / (H - 22), hw = 10 + t * 8;
    R(g, OUT, W / 2 - hw - 1, y, hw * 2 + 2, 1);
    R(g, "#c8a86e", W / 2 - hw, y, hw * 2, 1);
    R(g, "rgba(255,235,190,.35)", W / 2 - hw, y, 4, 1);
    R(g, "rgba(40,20,5,.25)", W / 2 + hw - 6, y, 6, 1);
  }
  for (let y = 30; y < H; y += 9) R(g, "rgba(90,60,25,.25)", W / 2 - 16, y, 32, 1);
  cone(g, W / 2, 8, 26, 16, TERRA);
  door(g, W / 2 - 4, H - 14, 8, 14);
  win(g, W / 2 - 3, 44, 6, 7);
  R(g, OUT, W / 2 - 3, 18, 6, 6); R(g, BEAM, W / 2 - 2, 19, 4, 4);
});
/** A standing stone for the secret circle. */
export const standingStone = (i: number) => sprite(18, 34, (g) => {
  const top = 2 + (i % 3) * 3;
  R(g, OUT, 2, top, 14, 34 - top);
  stones(g, 3, top + 1, 12, 33 - top, DSTONE, i * 9);
  R(g, "rgba(255,210,130,.2)", 3, top + 1, 3, 33 - top);
  R(g, GOLD, 8, top + 10, 2, 7); R(g, GOLD, 6, top + 13, 6, 1);
});
export const fencePost = () => sprite(4, 12, (g) => { R(g, OUT, 0, 0, 4, 12); R(g, "#7a5630", 1, 1, 2, 11); });

