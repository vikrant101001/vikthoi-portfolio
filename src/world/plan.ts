/* Where everything sits. Units are art pixels; x grows right, y grows down.
   Tip: while running `npm run dev`, type `__engine.player` in the browser
   console to see where you're standing.

   A round stone stage sits in the middle, on the seam (x = 1400) between the
   personal half (left) and the professional half (right). Five roads leave
   it, each with a signboard at its mouth. The stops on each road are
   generated from the content files, so adding an entry adds a building.
   Only roads, the square and doorways can be walked on. */
import type { Landmark, PropKind, Road, Sign, WorldPlan } from "@/engine/types";
import type { Pt } from "@/engine/math";
import { career } from "@/content/career";
import { games } from "@/content/games";
import { funStuff } from "@/content/fun";
import { roads } from "@/content/roads";
import type { RoadKey } from "@/content/types";

const W = 2800, H = 1440;
const C = { x: 1400, y: 720 };
const PLAZA_R = 170;
const PRO_W = 40, PERSONAL_W = 36;

/** n positions from a towards b, no further apart than maxGap. */
function spread(n: number, a: number, b: number, maxGap: number) {
  if (n <= 1) return [a];
  const gap = Math.sign(b - a) * Math.min(maxGap, Math.abs(b - a) / (n - 1));
  return Array.from({ length: n }, (_, i) => Math.round(a + i * gap));
}

const landmarks: Landmark[] = [];
const props: WorldPlan["props"] = [];
const roadList: Road[] = [];

/** Lays out one road: its stops sit just north of the road, doors on it. */
function layRoad(key: RoadKey, opts: {
  bend: Pt[]; xs: number[]; y: (i: number) => number; straight: boolean; w: number;
  sprite: (i: number) => { sprite: Landmark["sprite"]; variant?: number };
}) {
  const ids = roads[key].ids;
  const stops = opts.xs.map((x, i) => [x, opts.y(i)] as Pt);
  const last = stops[stops.length - 1], dir = Math.sign(last[0] - C.x);
  roadList.push({ w: opts.w, straight: opts.straight, pts: [[C.x, C.y], ...opts.bend, ...stops, [last[0] + dir * 70, last[1]]] });
  stops.forEach(([x, y], i) => landmarks.push({ id: ids[i], ...opts.sprite(i), x, y: y - opts.w / 2 - 4, door: { x, y: y - 4 } }));
  return stops;
}

/* ---------- professional (right) ---------- */
const careerStops = layRoad("career", {
  bend: [[1560, 560], [1680, 380]], straight: true, w: PRO_W,
  xs: spread(career.length, 1780, 2580, 170), y: () => 380,
  sprite: (i) => (career[i].upcoming ? { sprite: "draft" } : { sprite: "office", variant: Math.min(i, 4) }),
});
const projectStops = layRoad("projects", {
  bend: [], straight: true, w: PRO_W,
  xs: spread(roads.projects.ids.length, 1820, 2580, 260), y: () => 720,
  sprite: (i) => ({ sprite: "project", variant: i }),
});
const skillStops = layRoad("skills", {
  bend: [[1560, 880], [1680, 1060]], straight: true, w: PRO_W,
  xs: spread(roads.skills.ids.length, 1820, 2580, 260), y: () => 1060,
  sprite: (i) => ({ sprite: "skill", variant: i }),
});

/* ---------- personal (left) ---------- */
const wiggle = (i: number) => (i % 2 ? 10 : -6);
const gameStops = layRoad("games", {
  bend: [[1240, 560], [1110, 430]], straight: false, w: PERSONAL_W,
  xs: spread(games.length, 1000, 300, 240), y: (i) => 404 + wiggle(i),
  sprite: (i) => (games[i].studio ? { sprite: "skullhall" } : { sprite: "arcade", variant: i }),
});
const funStops = layRoad("fun", {
  bend: [[1240, 880], [1110, 1020]], straight: false, w: PERSONAL_W,
  xs: spread(funStuff.length, 1000, 300, 240), y: (i) => 1056 + wiggle(i),
  sprite: (i) => ({ sprite: funStuff[i].look }),
});

/* A faint trail nobody signposted, off the far end of the games road. */
const gamesEnd = gameStops[gameStops.length - 1];
const STONES = { x: 210, y: 600 };
roadList.push({ w: 24, pts: [[gamesEnd[0] - 40, gamesEnd[1]], [235, 470], [STONES.x + 4, STONES.y - 30]] });

/* ---------- lamps and trees beside the roads ---------- */
const between = (stops: Pt[]) => stops.slice(0, -1).map(([x, y], i) => [(x + stops[i + 1][0]) / 2, (y + stops[i + 1][1]) / 2] as Pt);
const add = (s: PropKind, pts: Pt[], dy: number, v = 0) => pts.forEach(([x, y], i) => props.push({ s, x: Math.round(x), y: Math.round(y + dy), v: v + i }));
for (const stops of [careerStops, projectStops, skillStops]) {
  add("inkLamp", between(stops), 32);
  add("inkTree", stops, 90);
  add("inkTree", between(stops), 120, 3);
}
for (const stops of [gameStops, funStops]) {
  add("lamp", between(stops), 30);
  add("bunting", between(stops).filter((_, i) => i % 2 === 0), 6);
}

/* ---------- signboards at the mouth of each road ---------- */
const ARROWS = { career: "ne", projects: "e", skills: "se", games: "nw", fun: "sw" } as const;
function board(key: RoadKey, toward: Pt, w: number): Sign {
  const dx = toward[0] - C.x, dy = toward[1] - C.y, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  /* Stand the board beside the road mouth, on its southern side. */
  let px = -uy, py = ux;
  if (py < 0) { px = -px; py = -py; }
  const mouthX = C.x + ux * (PLAZA_R + 8), mouthY = C.y + uy * (PLAZA_R + 8);
  return {
    x: Math.round(mouthX + px * (w / 2 + 44)), y: Math.round(mouthY + py * (w / 2 + 44)),
    text: roads[key].label, arrow: ARROWS[key], side: roads[key].side, board: true,
  };
}

export const plan: WorldPlan = {
  W, H,
  seamX: C.x,
  spawn: { x: C.x, y: C.y + 70 },
  plaza: { x: C.x, y: C.y, r: PLAZA_R },
  roads: roadList,

  water: [
    { w: 26, pts: [[-30, 820], [200, 800], [380, 770]] },
    { w: 120, pts: [[410, 750], [470, 770]] },
  ],
  fields: [{ x: 690, y: 700, w: 150, h: 90 }],

  landmarks: [
    { id: "letter", sprite: "lectern", x: C.x, y: C.y - 70, foot: [14, 6], door: { x: C.x, y: C.y - 52 } },
    ...landmarks,
    { id: "stones", sprite: null, x: STONES.x, y: STONES.y, door: STONES, secret: true },
  ],

  houses: [{ x: 1060, y: 700, v: 0 }, { x: 560, y: 610, v: 1 }, { x: 830, y: 590, v: 2 }],

  props: [
    { s: "windmill", x: 940, y: 900 },
    { s: "hay", x: 700, y: 830 }, { s: "hay", x: 870, y: 820 },
    ...props,
  ],

  signs: [
    board("career", [1560, 560], PRO_W),
    board("projects", [1700, 720], PRO_W),
    board("skills", [1560, 880], PRO_W),
    board("games", [1240, 560], PERSONAL_W),
    board("fun", [1240, 880], PERSONAL_W),
    { x: C.x - 104, y: C.y + 8, text: "Personal", arrow: "w", side: "personal", engraved: true },
    { x: C.x + 104, y: C.y + 8, text: "Professional", arrow: "e", side: "pro", engraved: true },
  ],

  walkAreas: [{ x: STONES.x, y: STONES.y + 6, r: 44 }],
};
