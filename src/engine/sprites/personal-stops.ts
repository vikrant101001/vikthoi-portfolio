/* Personal road stops: the game booths, the fun-stuff places, and the
   wooden signboard. */
import { AMBER, GOLD, OUT, SLATE, TERRA } from "../palette";
import { R, cone, door, pixels, roof, sprite, timber } from "./kit";

/* ---------- Vikskull game booths ---------- */
const GHOST = [".####.", "######", "#.##.#", "######", "######", "#.#.#."];
const NEON = ["#ff5a7a", "#5ad1ff", "#9cff5a", "#ffc65a", "#c58be0"];

/** A game booth: timber walls, glowing screens, a neon sign on the roof. */
export const arcade = (v: number) => sprite(84, 84, (g, W, H) => {
  const neon = NEON[v % NEON.length];
  const wall = 40, rh = H - wall;
  timber(g, 6, rh, W - 12, wall, v % 2 ? "#c8a86e" : "#bb9860");
  roof(g, 2, 24, W - 4, rh - 24, v % 2 ? TERRA : SLATE, 90 + v);
  R(g, OUT, 14, 0, 56, 26);
  R(g, "#1f1410", 15, 1, 54, 24);
  for (let i = 0; i < 54; i += 2) { R(g, neon, 15 + i, 1, 1, 1); R(g, neon, 15 + i, 24, 1, 1); }
  pixels(g, 36, 7, GHOST, { "#": neon }, 2);
  for (const sx of [14, W - 30]) {
    R(g, OUT, sx - 1, rh + 9, 18, 14);
    R(g, neon, sx, rh + 10, 16, 12);
    for (let y = rh + 11; y < rh + 22; y += 2) R(g, "rgba(0,0,0,.25)", sx, y, 16, 1);
  }
  door(g, W / 2 - 7, H - 22, 14, 22);
  return { lights: [{ dx: 0, dy: -70, r: 34 }, { dx: -20, dy: -24, r: 22 }, { dx: 20, dy: -24, r: 22 }] };
});

/* ---------- fun-stuff places ---------- */
/** A market stall with a striped awning. */
export const stall = () => sprite(98, 70, (g, W, H) => {
  for (const x of [8, W - 11]) { R(g, OUT, x, 18, 3, H - 18); R(g, "#6e4a26", x + 1, 18, 1, H - 18); }
  for (let x = 4; x < W - 4; x++) {
    const col = Math.floor((x - 4) / 9) % 2 ? "#efe2c4" : "#2e8b7a";
    R(g, col, x, 6, 1, 18);
    R(g, col, x, 24, 1, Math.round(Math.sin((((x - 4) % 9) / 9) * Math.PI) * 4));
    if (x > W * 0.72) R(g, "rgba(20,8,0,.22)", x, 6, 1, 22);
  }
  R(g, OUT, 3, 5, W - 6, 1);
  R(g, OUT, 2, 6, 1, 18);
  R(g, OUT, W - 3, 6, 1, 18);
  R(g, OUT, 12, H - 26, W - 24, 20);
  R(g, "#94703c", 13, H - 25, W - 26, 18);
  R(g, "#b38a50", 13, H - 25, W - 26, 2);
  for (let y = H - 20; y < H - 7; y += 5) R(g, "#6e4a26", 13, y, W - 26, 1);
  const goods = ["#c0392b", "#e0b24a", "#7a3a8a", "#2e8b7a", "#e8d6a8"];
  for (let i = 0; i < 12; i++) R(g, goods[i % 5], 16 + i * 6, H - 30, 4, 4);
  R(g, OUT, W / 2 - 1, 24, 2, 4);
  R(g, AMBER, W / 2 - 2, 28, 4, 5);
  return { lights: [{ dx: 0, dy: -38, r: 40 }] };
});

/** A bandstand with fairy lights. */
export const gazebo = () => sprite(104, 96, (g, W, H) => {
  R(g, OUT, 4, H - 15, W - 8, 15);
  R(g, "#8c785a", 5, H - 14, W - 10, 13);
  R(g, "#b8a582", 5, H - 14, W - 10, 3);
  for (const x of [12, 34, W - 36, W - 14]) { R(g, OUT, x - 1, 40, 4, H - 54); R(g, "#efe2c4", x, 40, 2, H - 54); }
  R(g, "#6e4a26", 12, H - 30, W - 24, 2);
  cone(g, W / 2, 4, W - 4, 38, TERRA);
  R(g, OUT, W / 2 - 1, 0, 2, 6);
  R(g, GOLD, W / 2 - 2, 0, 4, 2);
  for (let i = 0; i < 14; i++) R(g, i % 2 ? "#ffe08a" : AMBER, 4 + i * 7, 43 + (i % 2), 2, 2);
  pixels(g, 20, 50, ["..##", "..#.", "..#.", "###.", "##.."], { "#": "#efe2c4" }, 2);
  pixels(g, W - 30, 54, ["..##", "..#.", "###.", "##.."], { "#": "#efe2c4" }, 2);
  return { lights: [{ dx: -36, dy: -52, r: 24 }, { dx: 36, dy: -52, r: 24 }, { dx: 0, dy: -30, r: 44 }] };
});

/** A campfire ring with log benches. The flames are animated by the engine. */
export const campfire = () => sprite(96, 44, (g, W, H) => {
  const cx = W / 2, cy = H - 14;
  for (const x of [4, W - 30]) {
    R(g, OUT, x, cy - 4, 26, 9);
    R(g, "#6e4a26", x + 1, cy - 3, 24, 7);
    R(g, "#94703c", x + 1, cy - 3, 24, 2);
    R(g, "#c49a5a", x + 1, cy - 3, 3, 7);
  }
  R(g, OUT, cx - 14, 6, 28, 7);
  R(g, "#6e4a26", cx - 13, 7, 26, 5);
  for (let a = 0; a < 12; a++) {
    const ang = (a / 12) * Math.PI * 2;
    const x = cx + Math.cos(ang) * 13, y = cy + Math.sin(ang) * 6;
    R(g, OUT, x - 3, y - 2, 6, 5);
    R(g, a % 2 ? "#75664e" : "#948465", x - 2, y - 1, 4, 3);
  }
  R(g, "#2a130a", cx - 8, cy - 3, 16, 6);
  R(g, "#4a2f18", cx - 7, cy - 2, 14, 2);
  R(g, "#4a2f18", cx - 2, cy - 5, 4, 8);
  return { lights: [{ dx: 0, dy: -18, r: 80, hot: true }], smoke: [{ dx: 0, dy: -34 }] };
});

/* ---------- small things ---------- */
/** A wooden signboard. The UI writes the road's name on its face. */
export const woodBoard = () => sprite(72, 42, (g, W, H) => {
  for (const x of [10, W - 14]) { R(g, OUT, x, 14, 4, H - 14); R(g, "#6e4a26", x + 1, 14, 2, H - 14); }
  R(g, OUT, 0, 1, W, 24);
  R(g, "#a07a42", 1, 2, W - 2, 22);
  R(g, "#c49a5a", 1, 2, W - 2, 2);
  for (const y of [8, 13, 19]) R(g, "#8a6634", 3, y, W - 6, 1);
  for (const [x, y] of [[4, 5], [W - 6, 5], [4, 20], [W - 6, 20]]) R(g, OUT, x, y, 2, 2);
});

/** A barrel of flowers, for the square. */
export const flowers = () => sprite(18, 22, (g) => {
  R(g, OUT, 2, 9, 14, 13);
  R(g, "#7c5228", 3, 10, 12, 11);
  R(g, "#4a4034", 3, 13, 12, 1);
  R(g, "#4a4034", 3, 18, 12, 1);
  const c = ["#c0392b", "#e0b24a", "#efe2c4", "#7a3a8a"];
  for (let i = 0; i < 14; i++) R(g, i % 3 ? "#5e5418" : c[i % 4], 2 + ((i * 5) % 14), 2 + ((i * 3) % 8), 2, 2);
});
