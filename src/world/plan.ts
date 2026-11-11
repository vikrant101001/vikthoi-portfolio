/* Where everything sits in the vale. Units are art pixels.
   To move a building, change x/y and its door, then re-route its road.
   Landmark ids must match section ids in src/content/sections.ts. */
import type { WorldPlan } from "@/engine/types";

export const plan: WorldPlan = {
  W: 1600,
  H: 1120,
  spawn: { x: 800, y: 712 },

  river: [[-30, 360], [260, 430], [520, 400], [800, 400], [1080, 440], [1340, 400], [1630, 450]],
  bridge: { x: 800, y0: 354, y1: 446, w: 46 },
  plaza: { x: 800, y: 620, r: 104 },

  roads: [
    { w: 26, pts: [[800, 1140], [790, 1000], [812, 860], [800, 700], [800, 620], [800, 480], [800, 400], [800, 312]] },
    { w: 24, pts: [[800, 640], [660, 662], [500, 642], [340, 664]] },
    { w: 24, pts: [[800, 640], [950, 666], [1100, 642], [1250, 664]] },
    { w: 20, pts: [[520, 645], [482, 780], [430, 962]] },
    { w: 20, pts: [[1090, 645], [1130, 800], [1180, 972]] },
    { w: 20, pts: [[800, 330], [1000, 346], [1180, 312], [1310, 288]] },
    { w: 12, pts: [[800, 330], [620, 342], [440, 292], [292, 232]] },
  ],

  fields: [
    { x: 524, y: 806, w: 176, h: 112 },
    { x: 900, y: 812, w: 186, h: 112 },
  ],

  landmarks: [
    { id: "hearth", sprite: "brazier", x: 800, y: 622, foot: [44, 22], front: 10, door: { x: 800, y: 644 } },
    { id: "keep", sprite: "keep", x: 800, y: 300, foot: [232, 122], door: { x: 800, y: 316 } },
    { id: "forge", sprite: "forge", x: 340, y: 640, foot: [118, 62], door: { x: 340, y: 656 } },
    { id: "guild", sprite: "guild", x: 1250, y: 640, foot: [156, 68], door: { x: 1250, y: 656 } },
    { id: "archive", sprite: "archive", x: 430, y: 944, foot: [120, 78], door: { x: 430, y: 960 } },
    { id: "tavern", sprite: "tavern", x: 1180, y: 954, foot: [130, 66], door: { x: 1180, y: 970 } },
    { id: "raven", sprite: "raven", x: 1310, y: 272, foot: [58, 34], door: { x: 1310, y: 290 } },
    { id: "stones", sprite: null, x: 290, y: 216, foot: null, door: { x: 290, y: 216 }, secret: true },
  ],

  /* Town houses: scenery that gives the square its shape. */
  houses: [
    { x: 622, y: 612, v: 0 }, { x: 532, y: 592, v: 1 }, { x: 980, y: 616, v: 1 }, { x: 1072, y: 598, v: 0 },
    { x: 688, y: 500, v: 2 }, { x: 912, y: 500, v: 2 }, { x: 652, y: 776, v: 1 }, { x: 958, y: 780, v: 0 },
  ],

  props: [
    { s: "lamp", x: 772, y: 486 }, { s: "lamp", x: 828, y: 486 },
    { s: "lamp", x: 772, y: 770 }, { s: "lamp", x: 828, y: 770 },
    { s: "lamp", x: 560, y: 680 }, { s: "lamp", x: 1040, y: 684 },
    { s: "lamp", x: 400, y: 680 }, { s: "lamp", x: 1190, y: 684 },
    { s: "lamp", x: 770, y: 340 }, { s: "lamp", x: 830, y: 340 },
    { s: "lamp", x: 1270, y: 306 }, { s: "lamp", x: 470, y: 954 }, { s: "lamp", x: 1140, y: 966 },
    { s: "sign", x: 830, y: 724 },
    { s: "anvil", x: 412, y: 650 }, { s: "barrel", x: 268, y: 650 }, { s: "barrel", x: 256, y: 656 },
    { s: "board", x: 1352, y: 654 }, { s: "crate", x: 1148, y: 650 },
    { s: "barrel", x: 1262, y: 966 }, { s: "barrel", x: 1274, y: 962 }, { s: "crate", x: 1096, y: 964 },
    { s: "crate", x: 712, y: 668 }, { s: "barrel", x: 892, y: 568 },
    { s: "hay", x: 720, y: 880 }, { s: "hay", x: 880, y: 900 }, { s: "hay", x: 1104, y: 880 },
  ],
};
