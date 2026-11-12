/* Turns a WorldPlan into pixels: terrain, baked shadows, collision and the
   list of sprites to draw. Runs once; the result is cached by the engine.

   Left of the seam is painted (personal), right of it is ink on paper
   (professional). Near the seam the paint dissolves into paper, as if the
   map were still being drawn. */
import { BAYER, fbm, hash, rng, spline, type Pt } from "./math";
import { GROUND, PAPER, STAGE, type Ramp, type RGB } from "./palette";
import { seamAt } from "./seam";
import { BOARDS, BUILDINGS, PROPS, WALK_THROUGH, canvas, cottage, ctx2d, fencePost, inkTree, oak, pine, standingStone, type Sprite } from "./sprites";
import type { BuildingKind, BuiltWorld, Entity, Light, PropKind, SmokeSource, WorldPlan } from "./types";

const CELL = 8;
/** Width of the impassable border: rock on the left, a drafting margin on the right. */
const CLIFF = 74;
const MARGIN = 58;
/** How far into the painted side the paint starts to dissolve. */
const FADE = 26;

export function buildWorld(plan: WorldPlan): BuiltWorld {
  const { W, H } = plan;
  const seam = Float32Array.from({ length: H }, (_, y) => seamAt(plan, y));
  const isPro = (x: number, y: number) => x > seam[Math.max(0, Math.min(H - 1, y | 0))];

  /* ---- masks: one byte per pixel, drawn with canvas strokes ---- */
  function mask(draw: (g: CanvasRenderingContext2D) => void): Uint8Array {
    const c = canvas(W, H), g = ctx2d(c, { willReadFrequently: true });
    g.fillStyle = g.strokeStyle = "#fff";
    g.lineCap = g.lineJoin = "round";
    draw(g);
    const d = g.getImageData(0, 0, W, H).data, o = new Uint8Array(W * H);
    for (let i = 0; i < o.length; i++) o[i] = d[i * 4 + 3];
    return o;
  }
  const stroke = (g: CanvasRenderingContext2D, pts: Pt[], w: number, straight = false) => {
    const s = straight ? pts : spline(pts, 20);
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(s[0][0], s[0][1]);
    for (const p of s) g.lineTo(p[0], p[1]);
    g.stroke();
  };
  const allRoads = (extra: number) => (g: CanvasRenderingContext2D) => plan.roads.forEach((r) => stroke(g, r.pts, r.w + extra, r.straight));
  const mRoad = mask(allRoads(0)), mEdge = mask(allRoads(4)), mWorn = mask(allRoads(14));
  const allWater = (extra: number) => (g: CanvasRenderingContext2D) => plan.water.forEach((w) => stroke(g, w.pts, w.w + extra));
  const mWater = mask(allWater(0)), mDeep = mask(allWater(-24)), mBank = mask(allWater(18));
  const mPlaza = mask((g) => { g.beginPath(); g.arc(plan.plaza.x, plan.plaza.y, plan.plaza.r, 0, 7); g.fill(); });
  const mField = mask((g) => plan.fields.forEach((f) => g.fillRect(f.x, f.y, f.w, f.h)));
  /* Where you can walk: roads, the square, doorways and a few extra spots.
     Everything else is solid. */
  const mWalk = mask((g) => {
    allRoads(0)(g);
    const dot = (x: number, y: number, r: number) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    dot(plan.plaza.x, plan.plaza.y, plan.plaza.r);
    plan.landmarks.forEach((l) => dot(l.door.x, l.door.y, 16));
    plan.walkAreas.forEach((a) => dot(a.x, a.y, a.r));
  });

  /* ---- noise fields at quarter resolution ---- */
  const W4 = Math.ceil(W / 4) + 1, H4 = Math.ceil(H / 4) + 1;
  const wx = new Float32Array(W4 * H4), wy = new Float32Array(W4 * H4), lo = new Float32Array(W4 * H4), md = new Float32Array(W4 * H4);
  for (let y = 0; y < H4; y++) for (let x = 0; x < W4; x++) {
    const i = y * W4 + x, X = x * 4, Y = y * 4;
    wx[i] = (fbm(X * 0.03, Y * 0.03, 2) - 0.5) * 16;
    wy[i] = (fbm(X * 0.03 + 91, Y * 0.03 + 47, 2) - 0.5) * 16;
    lo[i] = fbm(X * 0.0085 + 13, Y * 0.0085 + 7, 3);
    md[i] = fbm(X * 0.05 + 5, Y * 0.05 + 3, 3);
  }

  /* ---- terrain ---- */
  const ground = canvas(W, H), gg = ctx2d(ground);
  const img = gg.createImageData(W, H), D = img.data;
  const GW = Math.ceil(W / CELL), GH = Math.ceil(H / CELL);
  const solid = new Uint8Array(GW * GH);
  const glints: number[] = [];
  const pick = (r: Ramp, v: number) => r[Math.max(0, Math.min(r.length - 1, Math.floor(v * r.length)))];
  const shade = (c: RGB, k: number): RGB => [(c[0] * k) | 0, (c[1] * k) | 0, (c[2] * k) | 0];

  /* The centre stage: its own clean stone floor, in rings of tiles, with a
     stepped rim. Neither half's ground reaches inside it. */
  const SX = plan.plaza.x, SY = plan.plaza.y, SR = plan.plaza.r;
  function stageColor(dx: number, dy: number, d: number, b: number): RGB {
    if (d > SR - 2.5) return STAGE.rimDark;
    if (d > SR - 4.5) return STAGE.rimLight;
    const turn = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
    if (d > SR - 15) {
      /* The step around the edge: long curved blocks. */
      const t = turn * 56;
      if (t % 1 < 0.05 || d < SR - 14) return STAGE.grout;
      return pick(STAGE.step, 0.3 + hash(Math.floor(t), 3) * 0.6 + b * 0.1);
    }
    if (Math.abs(d - SR * 0.62) < 1.2) return STAGE.inlay;
    /* Floor tiles in rings, about 16px each way. */
    const ring = Math.floor(d / 16), n = Math.max(6, ring * 6);
    const t = turn * n;
    if (d % 16 < 1 || (t % 1) * ((Math.PI * 2 * d) / n) < 1) return STAGE.grout;
    return pick(STAGE.tile, 0.25 + hash(ring, Math.floor(t)) * 0.55 + b * 0.08);
  }

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c4 = (y >> 2) * W4 + (x >> 2), b = BAYER[(y & 3) * 4 + (x & 3)], n = hash(x, y);
    const fromSeam = x - seam[y];
    const pd = Math.hypot(x - SX, y - SY);
    let col: RGB, blocked = false;

    if (pd <= SR) {
      col = stageColor(x - SX, y - SY, pd, b);
    } else if (fromSeam > 0) {
      /* ---------- professional: ink on paper, crisp and unwarped ---------- */
      const i = y * W + x;
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y);
      if (edge < MARGIN) {
        blocked = true;
        col = edge >= MARGIN - 3 && edge < MARGIN - 1 ? PAPER.ink : (x + y) % 6 === 0 ? PAPER.hatch : PAPER.margin;
      } else if (fromSeam < 1.5) {
        col = PAPER.ink;
      } else if (mRoad[i] > 128) {
        col = pick(PAPER.road, md[c4]);
      } else if (mEdge[i] > 128) {
        col = PAPER.ink;
      } else if (mWater[i] > 128) {
        blocked = true;
        col = (x - y) % 4 === 0 ? PAPER.ink : PAPER.sheet[0];
      } else {
        col = x % 32 === 0 || y % 32 === 0 ? PAPER.grid : pick(PAPER.sheet, md[c4] * 0.8 + n * 0.25);
      }
    } else {
      /* ---------- personal: painted, warped, organic ---------- */
      const sx = Math.max(0, Math.min(W - 1, (x + wx[c4]) | 0)), sy = Math.max(0, Math.min(H - 1, (y + wy[c4]) | 0));
      const i = sy * W + sx;
      const edge = Math.min(x, y, W - 1 - x, H - 1 - y) + (lo[c4] - 0.5) * 90 + (md[c4] - 0.5) * 18;
      if (edge < CLIFF) {
        blocked = true;
        const t = edge / CLIFF;
        col = pick(GROUND.rock, 0.05 + t * 0.55 + (md[c4] - 0.5) * 0.9 + b * 0.16 + (t > 0.9 ? 0.2 : 0));
      } else if (mWater[i] > 128) {
        blocked = true;
        col = pick(mDeep[i] > 128 ? GROUND.deep : GROUND.shallow, md[c4] + b * 0.4);
        if (n > 0.993) glints.push(x, y, n * 6283);
      } else if (mBank[i] > 128) {
        col = pick(GROUND.mud, md[c4] + b * 0.5);
      } else if (mRoad[i] > 128) {
        let v = 0.2 + md[c4] * 0.6 + b * 0.3;
        if (n > 0.985) v = 0.05; else if (n < 0.012) v = 0.95;
        col = pick(GROUND.dirt, v);
      } else if (mField[i] > 128) {
        const stripe = x % 5;
        col = pick(GROUND.wheat, stripe === 4 ? 0.08 : 0.32 + (stripe / 4) * 0.28 + (hash(x, y >> 1) - 0.5) * 0.4 + b * 0.12);
      } else if (mWorn[i] > 128) {
        col = pick(GROUND.worn, md[c4] * 0.9 + b * 0.35);
      } else if (lo[c4] + b * 0.09 > 0.56) {
        col = pick(GROUND.forest, md[c4] * 0.9 + b * 0.35 + (hash(x >> 1, y >> 1) - 0.5) * 0.3);
      } else {
        col = pick(GROUND.grass, 0.12 + md[c4] * 0.7 + (lo[c4] - 0.45) * -0.8 + b * 0.26 + (hash(x >> 1, y) - 0.5) * 0.24);
      }
      /* The paint dissolves into paper approaching the seam. */
      const t = -fromSeam / FADE;
      if (t < 1 && !blocked && b + 0.5 > t + (n - 0.5) * 0.3) col = pick(PAPER.sheet, n);
    }
    /* A soft shadow just outside the rim, so the stage reads as raised. */
    if (pd > SR && pd < SR + 5) col = shade(col, 0.7 + (pd - SR) * 0.06);
    const p = (y * W + x) * 4;
    D[p] = col[0]; D[p + 1] = col[1]; D[p + 2] = col[2]; D[p + 3] = 255;
    if (blocked && (x & 7) === 4 && (y & 7) === 4) solid[(y >> 3) * GW + (x >> 3)] = 1;
  }
  gg.putImageData(img, 0, 0);
  for (let cy = 0; cy < GH; cy++) for (let cx = 0; cx < GW; cx++) {
    const x = Math.min(W - 1, cx * CELL + 4), y = Math.min(H - 1, cy * CELL + 4);
    if (mWalk[y * W + x] < 128) solid[cy * GW + cx] = 1;
  }

  /* ---- a dashed centre line down the professional streets ---- */
  gg.save();
  gg.beginPath();
  gg.rect(0, 0, W, H);
  gg.arc(plan.plaza.x, plan.plaza.y, plan.plaza.r + 4, 0, Math.PI * 2, true);
  gg.clip("evenodd");
  gg.strokeStyle = "rgba(47,59,76,.38)";
  gg.lineWidth = 1;
  gg.setLineDash([10, 8]);
  for (const r of plan.roads) if (r.straight) {
    gg.beginPath();
    gg.moveTo(r.pts[0][0] + 0.5, r.pts[0][1] + 0.5);
    for (const p of r.pts) gg.lineTo(p[0] + 0.5, p[1] + 0.5);
    gg.stroke();
  }
  gg.restore();

  /* ---- the stage's centre: a dark medallion with a gold compass rose ---- */
  const disc = (r: number) => { gg.beginPath(); gg.arc(SX, SY, r, 0, Math.PI * 2); };
  gg.fillStyle = "#2f2b27"; disc(44); gg.fill();
  gg.strokeStyle = "#c9a24e"; gg.lineWidth = 2; disc(41); gg.stroke();
  gg.lineWidth = 1; disc(35); gg.stroke();
  const point = (ang: number, len: number, wid: number, fill: string) => {
    gg.fillStyle = fill;
    gg.beginPath();
    gg.moveTo(SX + Math.cos(ang) * len, SY + Math.sin(ang) * len);
    gg.lineTo(SX + Math.cos(ang + Math.PI / 2) * wid, SY + Math.sin(ang + Math.PI / 2) * wid);
    gg.lineTo(SX + Math.cos(ang - Math.PI / 2) * wid, SY + Math.sin(ang - Math.PI / 2) * wid);
    gg.fill();
  };
  for (let a = 0; a < 4; a++) point(Math.PI / 4 + (a * Math.PI) / 2, 20, 4, "#9c7f3f");
  for (let a = 0; a < 4; a++) point((a * Math.PI) / 2, 33, 6, "#d9b25a");
  gg.fillStyle = "#f2e6c4"; disc(3); gg.fill();
  /* Small gold diamonds set into the inlay ring (east and west are left clear for the carved words). */
  for (let a = 0; a < 8; a++) {
    if (a % 4 === 0) continue;
    const ang = (a * Math.PI) / 4, x = SX + Math.cos(ang) * SR * 0.62, y = SY + Math.sin(ang) * SR * 0.62;
    gg.fillStyle = "#2f2b27"; gg.fillRect(Math.round(x) - 3, Math.round(y) - 3, 6, 6);
    gg.fillStyle = "#d9b25a"; gg.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4);
  }

  /* ---- placing sprites ---- */
  const entities: Entity[] = [], lights: Light[] = [], smoke: SmokeSource[] = [], flames: BuiltWorld["flames"] = [];
  const spinners: BuiltWorld["spinners"] = [], anchors: BuiltWorld["anchors"] = {};
  const setSolid = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = Math.floor(y0 / CELL); y <= Math.floor((y1 - 1) / CELL); y++)
      for (let x = Math.floor(x0 / CELL); x <= Math.floor((x1 - 1) / CELL); x++)
        if (x >= 0 && y >= 0 && x < GW && y < GH) solid[y * GW + x] = 1;
  };
  /* Long evening shadows, baked into the ground once. Faint on paper. */
  const shadowCache = new Map<Sprite, HTMLCanvasElement>();
  function silhouette(s: Sprite) {
    let c = shadowCache.get(s);
    if (!c) {
      c = canvas(s.w, s.h);
      const g = ctx2d(c);
      g.drawImage(s.c, 0, 0);
      g.globalCompositeOperation = "source-in";
      g.fillStyle = "#1a0d04";
      g.fillRect(0, 0, s.w, s.h);
      shadowCache.set(s, c);
    }
    return c;
  }
  function place(s: Sprite, cx: number, base: number, shadow = 0.34) {
    const left = Math.round(cx - s.w / 2), top = Math.round(base - s.h);
    const alpha = isPro(cx, base) ? 0.1 : shadow;
    if (alpha > 0) {
      gg.save();
      gg.globalAlpha = alpha;
      gg.setTransform(1, 0, -0.85, -0.2, left + 0.85 * s.h, base + 0.2 * s.h);
      gg.drawImage(silhouette(s), 0, 0);
      gg.restore();
    }
    entities.push({ img: s.c, x: left, y: top, w: s.w, h: s.h, base });
    s.lights.forEach((l) => lights.push({ x: cx + l.dx, y: base + l.dy, r: l.r, hot: l.hot, seed: lights.length * 1.7 }));
    s.smoke.forEach((m) => smoke.push({ x: cx + m.dx, y: base + m.dy, heavy: m.heavy, acc: 0 }));
  }

  const cache = new Map<string, Sprite>();
  const building = (k: BuildingKind, v = 0) => { const key = `b:${k}:${v}`; let s = cache.get(key); if (!s) cache.set(key, (s = BUILDINGS[k](v))); return s; };
  const prop = (k: PropKind, v = 0) => { const key = `p:${k}:${v}`; let s = cache.get(key); if (!s) cache.set(key, (s = PROPS[k](v))); return s; };
  /** Areas where trees may not grow. */
  const blockers: [number, number, number, number][] = [];

  for (const l of plan.landmarks) {
    if (!l.sprite) continue;
    const s = building(l.sprite, l.variant);
    place(s, l.x, l.y);
    if (l.foot) setSolid(l.x - l.foot[0] / 2, l.y - l.foot[1], l.x + l.foot[0] / 2, l.y);
    if (l.sprite === "campfire") flames.push({ x: l.x, y: l.y - 15 });
    blockers.push([l.x - s.w / 2 - 24, l.y - s.h - 8, l.x + s.w / 2 + 36, l.y + 96]);
    anchors[l.id] = { x: l.x, y: l.y - s.h - 4 };
  }
  for (const h of plan.houses) {
    const s = cottage(h.v);
    place(s, h.x, h.y);
    setSolid(h.x - s.w / 2 + 2, h.y - s.h * 0.68, h.x + s.w / 2 - 2, h.y);
    blockers.push([h.x - s.w / 2 - 12, h.y - s.h - 6, h.x + s.w / 2 + 20, h.y + 50]);
  }
  for (const p of plan.props) {
    const s = prop(p.s, p.v);
    place(s, p.x, p.y, 0.28);
    if (!WALK_THROUGH.has(p.s)) {
      const fw = p.s === "lamp" || p.s === "inkLamp" || p.s === "inkTree" ? 6 : Math.min(s.w - 2, 30);
      setSolid(p.x - fw / 2, p.y - 6, p.x + fw / 2, p.y);
    }
    if (p.s === "windmill") spinners.push({ x: p.x, y: p.y - s.h + 21, r: 34 });
    blockers.push([p.x - s.w / 2 - 8, p.y - 16, p.x + s.w / 2 + 8, p.y + 14]);
  }

  /* ---- signboards at the mouth of each road ---- */
  for (const s of plan.signs) if (s.board) {
    const b = BOARDS[s.side]();
    place(b, s.x, s.y, 0.3);
    blockers.push([s.x - b.w / 2 - 6, s.y - b.h - 4, s.x + b.w / 2 + 6, s.y + 40]);
  }

  /* ---- the stone circle (the secret landmark) ---- */
  const ring = plan.landmarks.find((l) => l.secret) ?? { id: "", x: -999, y: -999 };
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.283 + 0.35;
    if (Math.abs(a - 0.6) < 0.32) continue; /* a gap to walk in */
    const x = ring.x + Math.cos(a) * 58, y = ring.y + Math.sin(a) * 40 + 10;
    place(standingStone(i), x, y, 0.32);
    setSolid(x - 7, y - 6, x + 7, y);
  }
  anchors[ring.id] = { x: ring.x, y: ring.y - 44 };
  blockers.push([ring.x - 90, ring.y - 90, ring.x + 90, ring.y + 120]);
  gg.strokeStyle = "rgba(224,178,74,.5)"; gg.lineWidth = 1;
  gg.beginPath(); gg.ellipse(ring.x, ring.y + 6, 22, 14, 0, 0, 7); gg.stroke();
  gg.beginPath(); gg.ellipse(ring.x, ring.y + 6, 12, 7, 0, 0, 7); gg.stroke();

  /* ---- trees: dense painted woods on the left, a few ink trees on the right ---- */
  const oaks = Array.from({ length: 9 }, (_, i) => oak(i, 100 + i * 37));
  const pines = [0, 1, 2, 3].map((i) => pine(11 + i * 29));
  const inks = [0, 1, 2, 3, 5, 7].map((i) => inkTree(i, i % 4 === 3));
  const r = rng(20261112), occupied = new Set<string>();
  const clear = (x: number, y: number) => !blockers.some((b) => x > b[0] && x < b[2] && y > b[1] && y < b[3]);
  for (let t = 0; t < 12000; t++) {
    const x = 20 + r() * (W - 40), y = 20 + r() * (H - 40), ix = x | 0, iy = y | 0, i = iy * W + ix;
    const c4 = (iy >> 2) * W4 + (ix >> 2), up = Math.max(0, iy - 34) * W + ix;
    if (mWorn[i] > 40 || mBank[i] > 40 || mField[i] > 40 || mPlaza[i] > 40 || mBank[up] > 40 || mField[up] > 40 || mPlaza[up] > 40 || !clear(x, y)) continue;
    const pro = isPro(x, y);
    if (Math.abs(x - seam[iy]) < 30) continue;
    let chance: number;
    if (pro) {
      const edge = Math.min(x, y, W - x, H - y);
      if (edge < MARGIN + 8) continue;
      chance = edge < MARGIN + 50 ? 0.22 : 0.006;
    } else {
      const edge = Math.min(x, y, W - x, H - y) + (lo[c4] - 0.5) * 90;
      if (edge < CLIFF - 6) continue;
      const forest = lo[c4] > 0.56;
      chance = edge < CLIFF + 60 ? 0.7 : forest ? 0.5 : 0.03;
    }
    if (r() > chance) continue;
    const key = ((x / 18) | 0) + "," + ((y / 14) | 0);
    if (occupied.has(key)) continue;
    occupied.add(key);
    let s: Sprite;
    if (pro) s = inks[(r() * inks.length) | 0];
    else {
      const forest = lo[c4] > 0.56, nearEdge = Math.min(x, y, W - x, H - y) < CLIFF + 100;
      s = (forest ? r() < 0.55 : nearEdge ? r() < 0.4 : r() < 0.08) ? pines[(r() * pines.length) | 0] : oaks[(r() * oaks.length) | 0];
    }
    place(s, x, y, 0.3);
    setSolid(x - 4, y - 4, x + 4, y);
  }

  /* ---- field fences ---- */
  const post = fencePost();
  for (const f of plan.fields) {
    gg.fillStyle = "#3a2513";
    gg.fillRect(f.x, f.y - 6, f.w, 1);
    gg.fillRect(f.x, f.y + f.h, f.w, 1);
    for (let x = f.x; x <= f.x + f.w; x += 22) { place(post, x, f.y, 0.25); place(post, x, f.y + f.h + 6, 0.25); }
    setSolid(f.x, f.y - 6, f.x + f.w, f.y + f.h + 6);
  }

  const mini = canvas(W >> 2, H >> 2), mg = ctx2d(mini);
  mg.imageSmoothingEnabled = true;
  mg.drawImage(ground, 0, 0, mini.width, mini.height);
  for (const e of [...entities].sort((a, b) => a.base - b.base)) if (e.h > 50) mg.drawImage(e.img, e.x / 4, e.y / 4, e.w / 4, e.h / 4);

  return { ground, mini, solid, GW, GH, CELL, entities, lights, smoke, spinners, flames, glints, ringRune: { x: ring.x, y: ring.y }, anchors };
}
