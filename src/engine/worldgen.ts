/* Turns a WorldPlan into pixels: terrain, baked shadows, collision and the
   list of sprites to draw. Runs once; the result is cached by the engine. */
import { BAYER, fbm, hash, rng, spline, type Pt } from "./math";
import { GROUND, OUT, type Ramp } from "./palette";
import { BUILDINGS, PROPS, R, canvas, ctx2d, fencePost, houseSprite, oak, pine, standingStone, type Sprite } from "./sprites";
import type { BuildingKind, BuiltWorld, Entity, Light, PropKind, SmokeSource, WorldPlan } from "./types";

const CELL = 8;
const CLIFF = 74;

export function buildWorld(plan: WorldPlan): BuiltWorld {
  const { W, H } = plan;

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
  const stroke = (g: CanvasRenderingContext2D, pts: Pt[], w: number) => {
    const s = spline(pts, 20);
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(s[0][0], s[0][1]);
    for (const p of s) g.lineTo(p[0], p[1]);
    g.stroke();
  };
  const allRoads = (extra: number) => (g: CanvasRenderingContext2D) => plan.roads.forEach((r) => stroke(g, r.pts, r.w + extra));
  const mRoad = mask(allRoads(0)), mWorn = mask(allRoads(14));
  const mWater = mask((g) => stroke(g, plan.river, 54));
  const mDeep = mask((g) => stroke(g, plan.river, 26));
  const mBank = mask((g) => stroke(g, plan.river, 72));
  const mPlaza = mask((g) => { g.beginPath(); g.arc(plan.plaza.x, plan.plaza.y, plan.plaza.r, 0, 7); g.fill(); });
  const mField = mask((g) => plan.fields.forEach((f) => g.fillRect(f.x, f.y, f.w, f.h)));

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

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c4 = (y >> 2) * W4 + (x >> 2);
    const sx = Math.max(0, Math.min(W - 1, (x + wx[c4]) | 0)), sy = Math.max(0, Math.min(H - 1, (y + wy[c4]) | 0));
    const i = sy * W + sx, b = BAYER[(y & 3) * 4 + (x & 3)], n = hash(x, y);
    const edge = Math.min(x, y, W - 1 - x, H - 1 - y) + (lo[c4] - 0.5) * 90 + (md[c4] - 0.5) * 18;
    let col, blocked = false;
    if (edge < CLIFF) {
      blocked = true;
      const t = edge / CLIFF;
      col = pick(GROUND.rock, 0.05 + t * 0.55 + (md[c4] - 0.5) * 0.9 + b * 0.16 + (t > 0.9 ? 0.2 : 0));
    } else if (mWater[i] > 128) {
      blocked = true;
      col = pick(mDeep[i] > 128 ? GROUND.deep : GROUND.shallow, md[c4] + b * 0.4);
      if (n > 0.9935) glints.push(x, y, n * 6283);
    } else if (mBank[i] > 128) {
      col = pick(GROUND.mud, md[c4] + b * 0.5);
    } else if (mPlaza[i] > 128) {
      const row = y >> 2, off = (row & 1) * 3, bx = Math.floor((x + off) / 6);
      const mortar = (y & 3) === 3 || (x + off) % 6 === 5;
      col = pick(GROUND.cobble, mortar ? 0.1 : 0.3 + hash(bx, row) * 0.55 + b * 0.1);
    } else if (mRoad[i] > 128) {
      let v = 0.2 + md[c4] * 0.6 + b * 0.3;
      if (n > 0.985) v = 0.05; else if (n < 0.012) v = 0.95;
      col = pick(GROUND.dirt, v);
    } else if (mField[i] > 128) {
      const stripe = x % 5;
      col = pick(GROUND.wheat, stripe === 4 ? 0.08 : 0.32 + (stripe / 4) * 0.28 + (hash(x, y >> 1) - 0.5) * 0.4 + b * 0.12);
    } else if (mWorn[i] > 128) {
      col = pick(GROUND.worn, md[c4] * 0.9 + b * 0.35);
    } else if (lo[c4] + b * 0.09 > 0.54) {
      col = pick(GROUND.forest, md[c4] * 0.9 + b * 0.35 + (hash(x >> 1, y >> 1) - 0.5) * 0.3);
    } else {
      col = pick(GROUND.grass, 0.12 + md[c4] * 0.7 + (lo[c4] - 0.45) * -0.8 + b * 0.26 + (hash(x >> 1, y) - 0.5) * 0.24);
    }
    const p = (y * W + x) * 4;
    D[p] = col[0]; D[p + 1] = col[1]; D[p + 2] = col[2]; D[p + 3] = 255;
    if (blocked && (x & 7) === 4 && (y & 7) === 4) solid[(y >> 3) * GW + (x >> 3)] = 1;
  }
  gg.putImageData(img, 0, 0);

  /* ---- bridge: drawn on the ground and carved out of the collision grid ---- */
  const B = plan.bridge, bx0 = B.x - B.w / 2;
  gg.fillStyle = "rgba(12,8,4,.5)";
  gg.fillRect(bx0 + 4, B.y0 + 4, B.w + 8, B.y1 - B.y0);
  R(gg, OUT, bx0 - 2, B.y0, B.w + 4, B.y1 - B.y0);
  for (let y = B.y0; y < B.y1; y += 5) {
    R(gg, ["#8a6236", "#7a5630", "#96703e"][Math.floor(hash(y, 7) * 3)], bx0, y, B.w, 4);
    R(gg, "#54381c", bx0, y + 4, B.w, 1);
  }
  for (const sx of [bx0 - 3, bx0 + B.w - 1]) {
    R(gg, "#5c4a34", sx, B.y0 - 2, 4, B.y1 - B.y0 + 4);
    R(gg, "#a08a66", sx, B.y0 - 2, 2, B.y1 - B.y0 + 4);
    for (let y = B.y0; y < B.y1; y += 20) { R(gg, OUT, sx - 1, y, 6, 6); R(gg, "#b09a74", sx, y + 1, 4, 3); }
  }
  for (let cy = Math.floor((B.y0 - 8) / CELL); cy <= Math.floor((B.y1 + 8) / CELL); cy++)
    for (let cx = Math.floor((bx0 + 3) / CELL); cx <= Math.floor((bx0 + B.w - 3) / CELL); cx++) solid[cy * GW + cx] = 0;

  /* ---- plaza ring ---- */
  gg.strokeStyle = "#54452f"; gg.lineWidth = 2;
  gg.beginPath(); gg.arc(plan.plaza.x, plan.plaza.y + 2, 40, 0, 7); gg.stroke();
  gg.strokeStyle = "#b8a582"; gg.lineWidth = 1;
  gg.beginPath(); gg.arc(plan.plaza.x, plan.plaza.y + 2, 42, 0, 7); gg.stroke();

  /* ---- placing sprites ---- */
  const entities: Entity[] = [], lights: Light[] = [], smoke: SmokeSource[] = [], flames: { x: number; y: number }[] = [];
  const setSolid = (x0: number, y0: number, x1: number, y1: number) => {
    for (let y = Math.floor(y0 / CELL); y <= Math.floor((y1 - 1) / CELL); y++)
      for (let x = Math.floor(x0 / CELL); x <= Math.floor((x1 - 1) / CELL); x++)
        if (x >= 0 && y >= 0 && x < GW && y < GH) solid[y * GW + x] = 1;
  };
  /* Long evening shadows, baked into the ground once. */
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
    if (shadow > 0) {
      gg.save();
      gg.globalAlpha = shadow;
      gg.setTransform(1, 0, -0.85, -0.2, left + 0.85 * s.h, base + 0.2 * s.h);
      gg.drawImage(silhouette(s), 0, 0);
      gg.restore();
    }
    entities.push({ img: s.c, x: left, y: top, w: s.w, h: s.h, base });
    s.lights.forEach((l) => lights.push({ x: cx + l.dx, y: base + l.dy, r: l.r, hot: l.hot, seed: lights.length * 1.7 }));
    s.smoke.forEach((m) => smoke.push({ x: cx + m.dx, y: base + m.dy, heavy: m.heavy, acc: 0 }));
  }

  const buildings = new Map<BuildingKind, Sprite>(), props = new Map<PropKind, Sprite>();
  const building = (k: BuildingKind) => { let s = buildings.get(k); if (!s) buildings.set(k, (s = BUILDINGS[k]())); return s; };
  const prop = (k: PropKind) => { let s = props.get(k); if (!s) props.set(k, (s = PROPS[k]())); return s; };
  /** Areas where trees may not grow. */
  const blockers: [number, number, number, number][] = [];

  for (const l of plan.landmarks) {
    if (l.sprite && l.foot) {
      const s = building(l.sprite);
      place(s, l.x, l.y);
      setSolid(l.x - l.foot[0] / 2, l.y - l.foot[1], l.x + l.foot[0] / 2, l.y + (l.front ?? 0));
      blockers.push([l.x - l.foot[0] / 2 - 18, l.y - s.h - 8, l.x + l.foot[0] / 2 + 36, l.y + 78]);
    }
    if (l.sprite === "brazier") {
      flames.push({ x: l.x, y: l.y - 22 });
      lights.push({ x: l.x, y: l.y - 26, r: 110, hot: true, seed: 3.3 });
    }
  }
  const houses = [houseSprite(0), houseSprite(1), houseSprite(2)];
  for (const h of plan.houses) {
    const s = houses[h.v];
    place(s, h.x, h.y);
    setSolid(h.x - s.w / 2 + 2, h.y - s.h * 0.68, h.x + s.w / 2 - 2, h.y);
    blockers.push([h.x - s.w / 2 - 12, h.y - s.h - 6, h.x + s.w / 2 + 20, h.y + 62]);
  }
  for (const p of plan.props) {
    const s = prop(p.s);
    place(s, p.x, p.y, 0.28);
    const fw = Math.min(s.w, p.s === "lamp" ? 6 : s.w - 2);
    setSolid(p.x - fw / 2, p.y - 6, p.x + fw / 2, p.y);
    blockers.push([p.x - 16, p.y - 16, p.x + 16, p.y + 10]);
  }

  /* ---- the stone circle (the secret landmark) ---- */
  const ring = plan.landmarks.find((l) => l.secret) ?? { x: -999, y: -999 };
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * 6.283 + 0.35;
    if (Math.abs(a - 0.6) < 0.32) continue; /* a gap for the trail */
    const x = ring.x + Math.cos(a) * 58, y = ring.y + Math.sin(a) * 40 + 10;
    place(standingStone(i), x, y, 0.32);
    setSolid(x - 7, y - 6, x + 7, y);
  }
  blockers.push([ring.x - 90, ring.y - 90, ring.x + 90, ring.y + 120]);
  blockers.push([B.x - 62, B.y0 - 30, B.x + 62, B.y1 + 66]);
  gg.strokeStyle = "rgba(224,178,74,.5)"; gg.lineWidth = 1;
  gg.beginPath(); gg.ellipse(ring.x, ring.y + 6, 22, 14, 0, 0, 7); gg.stroke();
  gg.beginPath(); gg.ellipse(ring.x, ring.y + 6, 12, 7, 0, 0, 7); gg.stroke();

  /* ---- trees: denser in forests and against the cliffs, sparse in town ---- */
  const oaks = Array.from({ length: 9 }, (_, i) => oak(i, 100 + i * 37));
  const pines = [0, 1, 2, 3].map((i) => pine(11 + i * 29));
  const r = rng(20261111), occupied = new Set<string>();
  const clear = (x: number, y: number) => !blockers.some((b) => x > b[0] && x < b[2] && y > b[1] && y < b[3]);
  for (let t = 0; t < 7000; t++) {
    const x = 20 + r() * (W - 40), y = 20 + r() * (H - 40), ix = x | 0, iy = y | 0, i = iy * W + ix;
    const c4 = (iy >> 2) * W4 + (ix >> 2);
    const edge = Math.min(x, y, W - x, H - y) + (lo[c4] - 0.5) * 90;
    if (edge < CLIFF - 6) continue;
    /* Check the canopy as well as the trunk, so trees never overhang water or fields. */
    const up = Math.max(0, iy - 34) * W + ix;
    if (mWorn[i] > 40 || mBank[i] > 40 || mField[i] > 40 || mPlaza[i] > 40 || mBank[up] > 40 || mField[up] > 40 || mPlaza[up] > 40 || !clear(x, y)) continue;
    const nearEdge = edge < CLIFF + 60, forest = lo[c4] > 0.54;
    const inTown = Math.hypot(x - plan.plaza.x, y - plan.plaza.y) < 270;
    if (r() > (nearEdge ? 0.7 : inTown ? 0.02 : forest ? 0.55 : 0.035)) continue;
    const key = ((x / 18) | 0) + "," + ((y / 14) | 0);
    if (occupied.has(key)) continue;
    occupied.add(key);
    const isPine = forest ? r() < 0.55 : nearEdge ? r() < 0.4 : r() < 0.08;
    place(isPine ? pines[(r() * pines.length) | 0] : oaks[(r() * oaks.length) | 0], x, y, 0.3);
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
  for (const e of entities) if (e.h > 60) mg.drawImage(e.img, e.x / 4, e.y / 4, e.w / 4, e.h / 4);

  return { ground, mini, solid, GW, GH, CELL, entities, lights, smoke, flames, glints, ringRune: { x: ring.x, y: ring.y } };
}
