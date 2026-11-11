/* Golden hour, umber shadows. Every colour in the world comes from here. */
export type RGB = [number, number, number];
export type Ramp = RGB[];

const rgb = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const ramp = (...hs: string[]): Ramp => hs.map(rgb);

export const GROUND = {
  grass: ramp("#4e4420", "#675a26", "#80702c", "#9a8434", "#b39a42", "#c9af55"),
  forest: ramp("#2c2715", "#3a331a", "#4a4120", "#5a4f26"),
  dirt: ramp("#6e4f2c", "#866239", "#9c7546", "#b18a56", "#c29c66"),
  worn: ramp("#6b5a2a", "#7f6a31", "#94793a", "#a78a46"),
  cobble: ramp("#5a4a36", "#74624a", "#8c785a", "#a4906e", "#b8a582"),
  wheat: ramp("#7c5a1e", "#a07a26", "#c49a32", "#dcb648", "#efd070"),
  mud: ramp("#3f3320", "#524229", "#655233"),
  shallow: ramp("#2f5450", "#3b655d", "#4b7868"),
  deep: ramp("#1a3336", "#223f42", "#2b4b4c"),
  rock: ramp("#17120e", "#241c15", "#33281d", "#463727", "#5c4832", "#74603f"),
};

/** Four-step ramps for sprites: dark, mid, light, highlight. */
export const SLATE = ["#2b2620", "#40382d", "#544a3b", "#6e6250"];
export const THATCH = ["#5a3f18", "#7c5a22", "#9c762e", "#c29a44"];
export const TERRA = ["#4c2115", "#6e3220", "#8f462b", "#b0603a"];
export const COPPER = ["#23403a", "#2f5a50", "#3f7566", "#6aa18a"];
export const STONE = ["#3b3226", "#5a4d3a", "#75664e", "#948465", "#b0a07e"];
export const DSTONE = ["#2b241b", "#40362a", "#544837", "#6b5d47", "#837357"];

export const OUT = "#1c130b";
export const BEAM = "#3a2513";
export const AMBER = "#ffc65a";
export const GOLD = "#e0b24a";
