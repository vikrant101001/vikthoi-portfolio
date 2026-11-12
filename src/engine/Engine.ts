/* The game engine. Plain TypeScript with no React in it: it owns the canvas,
   the loop, input, collision, camera and lighting. React talks to it through
   methods and events (see src/game/). */
import { clamp, hash } from "./math";
import { seamAt, sideAt } from "./seam";
import { buildPlayerFrames, canvas, ctx2d, glow, type PlayerFrames } from "./sprites";
import type { BuiltWorld, Facing, Landmark, Side, WorldPlan } from "./types";
import { buildWorld } from "./worldgen";

export type Mode = "title" | "play" | "paused";

export interface EngineEvents {
  ready: void;
  near: Landmark | null;
  discover: Landmark;
  interact: Landmark;
}
type Handler<T> = (payload: T) => void;

interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; kind: "smoke" | "ember" }

const WALK = 120, RUN = 210;
const INTERACT_RANGE = 40;

export class Engine {
  readonly plan: WorldPlan;
  world: BuiltWorld | null = null;
  mode: Mode = "title";
  readonly player = {
    x: 0, y: 0, dir: "up" as Facing, flip: false, step: 0, moving: false,
    /** Direction of travel in radians, 0 = north. Smoothed, for the compass. */
    heading: 0,
    target: null as { x: number; y: number } | null,
    stuck: 0,
  };
  readonly cam = { x: 0, y: 0 };
  near: Landmark | null = null;
  readonly discovered = new Set<string>();

  private cv: HTMLCanvasElement | null = null;
  private g: CanvasRenderingContext2D | null = null;
  private vw = 640;
  private vh = 360;
  private scale = 3;
  private frames: PlayerFrames | null = null;
  private building: Promise<void> | null = null;
  private raf = 0;
  private last = 0;
  private keys = new Set<string>();
  private particles: Particle[] = [];
  private handlers = new Map<keyof EngineEvents, Set<Handler<never>>>();
  private frameSubs = new Set<(e: Engine) => void>();
  private readonly calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  private grade!: HTMLCanvasElement;
  private vignette!: HTMLCanvasElement;
  private rays!: HTMLCanvasElement;
  private readonly warm = glow("rgba(255,170,70,.55)", 128);
  private readonly hot = glow("rgba(255,120,40,.6)", 128);
  private readonly shade = glow("rgba(30,14,4,.5)", 256);
  private readonly clouds: { x: number; y: number; r: number }[];
  private readonly motes = Array.from({ length: 70 }, (_, i) => ({ x: hash(i, 1), y: hash(1, i), p: hash(i, i) * 6.28, s: 0.4 + hash(i, 9) }));
  private readonly ravens = Array.from({ length: 5 }, (_, i) => ({ a: i * 1.3, r: 42 + i * 12, s: 0.5 + i * 0.09 }));

  constructor(plan: WorldPlan) {
    this.plan = plan;
    this.player.x = plan.spawn.x;
    this.player.y = plan.spawn.y;
    this.clouds = Array.from({ length: 5 }, (_, i) => ({ x: i * 420, y: (i * 377) % plan.H, r: 260 + (i % 3) * 90 }));
  }

  /* ---------- events ---------- */
  on<K extends keyof EngineEvents>(evt: K, fn: Handler<EngineEvents[K]>): () => void {
    let set = this.handlers.get(evt);
    if (!set) this.handlers.set(evt, (set = new Set()));
    const s = set as Set<Handler<EngineEvents[K]>>;
    s.add(fn);
    return () => void s.delete(fn);
  }
  private emit<K extends keyof EngineEvents>(evt: K, payload: EngineEvents[K]) {
    (this.handlers.get(evt) as Set<Handler<EngineEvents[K]>> | undefined)?.forEach((fn) => fn(payload));
  }
  /** Runs after every drawn frame. Use for HUD parts that move every frame. */
  onFrame(fn: (e: Engine) => void): () => void {
    this.frameSubs.add(fn);
    return () => void this.frameSubs.delete(fn);
  }

  /* ---------- lifecycle ---------- */
  /** Generates the world once. Waits a frame first so a loading screen can paint. */
  build(): Promise<void> {
    this.building ??= new Promise<void>((resolve) =>
      requestAnimationFrame(() => setTimeout(() => {
        this.world = buildWorld(this.plan);
        this.frames = buildPlayerFrames();
        resolve();
        this.emit("ready", undefined);
      }, 30)));
    return this.building;
  }

  attach(cv: HTMLCanvasElement) {
    this.cv = cv;
    this.g = ctx2d(cv);
    this.resize();
    addEventListener("resize", this.resize);
    addEventListener("keydown", this.onKeyDown);
    addEventListener("keyup", this.onKeyUp);
    addEventListener("blur", this.clearInput);
    cv.addEventListener("pointerdown", this.onPointer);
    void this.build().then(() => {
      if (this.cv !== cv || this.raf) return; /* detached, or already running */
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    });
  }

  detach() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    removeEventListener("resize", this.resize);
    removeEventListener("keydown", this.onKeyDown);
    removeEventListener("keyup", this.onKeyUp);
    removeEventListener("blur", this.clearInput);
    this.cv?.removeEventListener("pointerdown", this.onPointer);
    this.cv = null;
    this.g = null;
    this.clearInput();
  }

  /* ---------- commands ---------- */
  setMode(mode: Mode) {
    if (mode === this.mode) return;
    if (this.mode === "title") this.snapCamera();
    this.mode = mode;
    this.clearInput();
    this.player.target = null;
    if (mode !== "play" && this.near) { this.near = null; this.emit("near", null); }
  }

  teleport(id: string) {
    const l = this.landmark(id);
    if (!l) return;
    const p = this.player;
    p.x = l.door.x;
    p.y = l.door.y + (l.secret ? 0 : 10);
    p.dir = "up"; p.flip = false; p.target = null; p.heading = 0;
    this.snapCamera();
  }

  discover(id: string) {
    const l = this.landmark(id);
    if (!l || this.discovered.has(id)) return;
    this.discovered.add(id);
    this.emit("discover", l);
  }

  landmark(id: string) {
    return this.plan.landmarks.find((l) => l.id === id);
  }

  /** Converts a world point to CSS pixels on screen, for labels drawn by the UI. */
  worldToScreen(x: number, y: number) {
    return { x: (x - this.cam.x) * this.scale, y: (y - this.cam.y) * this.scale };
  }

  /** CSS pixels per art pixel; labels use it to scale with the world. */
  get pixelScale() {
    return this.scale;
  }

  /** Which half of the world the player is standing in. */
  get side(): Side {
    return sideAt(this.plan, this.player.x, this.player.y);
  }

  clearInput = () => {
    this.keys.clear();
  };

  /* ---------- input ---------- */
  private onKeyDown = (e: KeyboardEvent) => {
    if (this.mode !== "play" || isTyping(e)) return;
    if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
    this.keys.add(e.code);
    if (!e.repeat && this.near && (e.code === "KeyE" || e.code === "Space" || e.code === "Enter")) this.emit("interact", this.near);
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };
  private onPointer = (e: PointerEvent) => {
    if (this.mode !== "play") return;
    this.player.target = { x: e.clientX / this.scale + this.cam.x, y: e.clientY / this.scale + this.cam.y };
    this.player.stuck = 0;
  };

  private resize = () => {
    const cv = this.cv, g = this.g;
    if (!cv || !g) return;
    const w = innerWidth, h = innerHeight;
    this.scale = Math.max(2, Math.round(Math.min(w / 640, h / 360)));
    this.vw = Math.ceil(w / this.scale);
    this.vh = Math.ceil(h / this.scale);
    cv.width = this.vw;
    cv.height = this.vh;
    cv.style.width = this.vw * this.scale + "px";
    cv.style.height = this.vh * this.scale + "px";
    g.imageSmoothingEnabled = false;
    this.buildOverlays();
    if (this.mode !== "title") this.snapCamera();
  };

  /* ---------- simulation ---------- */
  private solidAt(x: number, y: number) {
    const w = this.world!;
    if (x < 0 || y < 0 || x >= this.plan.W || y >= this.plan.H) return true;
    return w.solid[((y / w.CELL) | 0) * w.GW + ((x / w.CELL) | 0)] === 1;
  }
  private blocked(x: number, y: number) {
    return this.solidAt(x - 5, y - 3) || this.solidAt(x + 5, y - 3) || this.solidAt(x - 5, y + 1) || this.solidAt(x + 5, y + 1);
  }
  private snapCamera() {
    this.cam.x = clamp(this.player.x - this.vw / 2, 0, this.plan.W - this.vw);
    this.cam.y = clamp(this.player.y - this.vh / 2, 0, this.plan.H - this.vh);
  }

  private update(dt: number, t: number) {
    const p = this.player, k = this.keys, plan = this.plan;
    let dx = 0, dy = 0;
    if (this.mode === "play") {
      if (k.has("KeyA") || k.has("ArrowLeft")) dx--;
      if (k.has("KeyD") || k.has("ArrowRight")) dx++;
      if (k.has("KeyW") || k.has("ArrowUp")) dy--;
      if (k.has("KeyS") || k.has("ArrowDown")) dy++;
      if (dx || dy) p.target = null;
      else if (p.target) {
        const tx = p.target.x - p.x, ty = p.target.y - p.y, d = Math.hypot(tx, ty);
        if (d < 4) p.target = null;
        else { dx = tx / d; dy = ty / d; }
      }
    }
    const len = Math.hypot(dx, dy);
    p.moving = len > 0;
    if (p.moving) {
      dx /= len; dy /= len;
      const running = k.has("ShiftLeft") || k.has("ShiftRight");
      const sp = (running ? RUN : WALK) * dt;
      const ox = p.x, oy = p.y;
      if (!this.blocked(p.x + dx * sp, p.y)) p.x += dx * sp;
      if (!this.blocked(p.x, p.y + dy * sp)) p.y += dy * sp;
      if (p.target) {
        p.stuck = Math.hypot(p.x - ox, p.y - oy) < sp * 0.25 ? p.stuck + dt : 0;
        if (p.stuck > 0.25) { p.target = null; p.stuck = 0; }
      }
      p.step += dt * (running ? 14 : 9);
      if (Math.abs(dx) > Math.abs(dy)) { p.dir = "side"; p.flip = dx < 0; }
      else { p.dir = dy < 0 ? "up" : "down"; p.flip = false; }
      const diff = Math.atan2(Math.sin(Math.atan2(dx, -dy) - p.heading), Math.cos(Math.atan2(dx, -dy) - p.heading));
      p.heading += diff * Math.min(1, dt * 7);
    }

    /* Camera. On the title screen it drifts slowly back and forth over the seam. */
    if (this.mode === "title") {
      this.cam.x = clamp(plan.spawn.x - this.vw / 2 + Math.sin(t * 0.00012) * 160, 0, plan.W - this.vw);
      this.cam.y = clamp(plan.spawn.y - this.vh / 2 - 40 + Math.cos(t * 0.00009) * 40, 0, plan.H - this.vh);
    } else {
      const f = this.calm ? 1 : Math.min(1, dt * 6);
      this.cam.x += (clamp(p.x - this.vw / 2, 0, plan.W - this.vw) - this.cam.x) * f;
      this.cam.y += (clamp(p.y - this.vh / 2, 0, plan.H - this.vh) - this.cam.y) * f;
    }

    /* What you can enter, and what you have just discovered. */
    if (this.mode === "play") {
      let near: Landmark | null = null, best = INTERACT_RANGE;
      for (const l of plan.landmarks) {
        const d = Math.hypot(l.door.x - p.x, l.door.y - p.y);
        if (d < best) { best = d; near = l; }
        if (d < (l.secret ? 70 : 80)) this.discover(l.id);
      }
      if (near !== this.near) { this.near = near; this.emit("near", near); }
    }

    if (this.calm) return;
    const w = this.world!;
    for (const f of w.flames) if (Math.random() < dt * 18)
      this.particles.push({ x: f.x + (Math.random() - 0.5) * 10, y: f.y - 4, vx: (Math.random() - 0.5) * 12, vy: -24 - Math.random() * 30, life: 0, max: 0.7 + Math.random() * 1, kind: "ember" });
    for (const s of w.smoke) {
      s.acc += dt * (s.heavy ? 9 : 4);
      while (s.acc > 1) {
        s.acc--;
        this.particles.push({ x: s.x + (Math.random() - 0.5) * 3, y: s.y, vx: 5 + Math.random() * 7, vy: -11 - Math.random() * 9, life: 0, max: 2.6 + Math.random() * 1.6, kind: "smoke" });
      }
    }
    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const q = ps[i];
      q.life += dt; q.x += q.vx * dt; q.y += q.vy * dt;
      if (q.life > q.max) ps.splice(i, 1);
    }
    for (const c of this.clouds) { c.x += dt * 9; if (c.x > plan.W + c.r) c.x = -c.r; }
  }

  /* ---------- rendering ---------- */
  private buildOverlays() {
    const { vw, vh } = this;
    this.grade = canvas(vw, vh);
    let c = ctx2d(this.grade);
    let gr = c.createLinearGradient(0, 0, vw, vh);
    gr.addColorStop(0, "#ffd080"); gr.addColorStop(0.55, "#b98a48"); gr.addColorStop(1, "#5a3414");
    c.fillStyle = gr; c.fillRect(0, 0, vw, vh);

    this.vignette = canvas(vw, vh);
    c = ctx2d(this.vignette);
    const rg = c.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.42, vw / 2, vh / 2, Math.max(vw, vh) * 0.72);
    rg.addColorStop(0, "rgba(14,7,2,0)"); rg.addColorStop(1, "rgba(14,7,2,.78)");
    c.fillStyle = rg; c.fillRect(0, 0, vw, vh);

    this.rays = canvas(vw + 200, vh);
    c = ctx2d(this.rays);
    for (const [x, w] of [[40, 70], [190, 36], [300, 90], [480, 44], [620, 80]]) {
      gr = c.createLinearGradient(0, 0, 0, vh);
      gr.addColorStop(0, "rgba(255,206,120,.20)"); gr.addColorStop(1, "rgba(255,206,120,0)");
      c.fillStyle = gr;
      c.beginPath();
      c.moveTo(x, 0); c.lineTo(x + w, 0); c.lineTo(x + w + vh * 0.55, vh); c.lineTo(x + vh * 0.55, vh);
      c.fill();
    }
  }

  private draw(t: number) {
    const g = this.g!, w = this.world!, { vw, vh } = this, p = this.player;
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    const onScreen = (x: number, y: number, pad: number) => x > -pad && x < vw + pad && y > -pad && y < vh + pad;
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    g.drawImage(w.ground, cx, cy, vw, vh, 0, 0, vw, vh);

    /* Sun glints on the river. */
    for (let i = 0; i < w.glints.length; i += 3) {
      const x = w.glints[i] - cx, y = w.glints[i + 1] - cy;
      if (!onScreen(x, y, 0)) continue;
      const s = Math.sin(t * 0.0022 + w.glints[i + 2]);
      if (s > 0.35) { g.fillStyle = s > 0.8 ? "#ffe9b0" : "#e8bf6c"; g.fillRect(x, y, s > 0.8 ? 4 : 2, 1); }
    }

    /* The stone circle's rune breathes. */
    const rr = w.ringRune;
    if (onScreen(rr.x - cx, rr.y - cy, 80)) {
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.25 + (0.5 + Math.sin(t * 0.002) * 0.5) * 0.4;
      g.drawImage(this.warm, rr.x - cx - 44, rr.y - cy - 34, 88, 80);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    }

    /* Depth-sorted scene. */
    type Drawable = { base: number; img?: HTMLCanvasElement; x?: number; y?: number };
    const vis: Drawable[] = [];
    for (const e of w.entities) if (e.x < cx + vw && e.x + e.w > cx && e.y < cy + vh && e.y + e.h > cy) vis.push(e);
    if (this.mode !== "title") vis.push({ base: p.y + 1 });
    vis.sort((a, b) => a.base - b.base);
    for (const e of vis) {
      if (e.img) g.drawImage(e.img, e.x! - cx, e.y! - cy);
      else this.drawPlayer(cx, cy);
    }

    /* Campfire flames. */
    for (const f of w.flames) {
      const fx = f.x - cx, fy = f.y - cy;
      if (!onScreen(fx, fy, 40)) continue;
      for (let i = 0; i < 6; i++) {
        const sway = Math.sin(t * 0.012 + i * 1.7) * 2.2, h = 11 + Math.sin(t * 0.017 + i * 2.1) * 4 - Math.abs(i - 2.5) * 2.4;
        const x = Math.round(fx - 6 + i * 2 + sway * 0.4);
        g.fillStyle = "#b53c10"; g.fillRect(x, fy - h, 2, h);
        g.fillStyle = "#f08a20"; g.fillRect(x, fy - h * 0.68, 2, h * 0.68);
        g.fillStyle = "#ffd070"; g.fillRect(x, fy - h * 0.34, 2, h * 0.34);
      }
    }

    /* Windmill blades. */
    for (const sp of w.spinners) {
      const hx = sp.x - cx, hy = sp.y - cy;
      if (!onScreen(hx, hy, sp.r + 4)) continue;
      const turn = this.calm ? 0.3 : t * 0.0011;
      for (let k = 0; k < 4; k++) {
        const ang = turn + (k * Math.PI) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
        for (let d = 3; d < sp.r; d++) {
          const x = Math.round(hx + ca * d), y = Math.round(hy + sa * d);
          g.fillStyle = "#1c130b"; g.fillRect(x, y, 1, 1);
          if (d > 10) {
            g.fillStyle = "#e8d6a8";
            g.fillRect(Math.round(x - sa * 2), Math.round(y + ca * 2), 1, 1);
            g.fillRect(Math.round(x - sa * 3), Math.round(y + ca * 3), 1, 1);
          }
        }
      }
      g.fillStyle = "#1c130b"; g.fillRect(hx - 2, hy - 2, 4, 4);
    }

    for (const q of this.particles) {
      const x = q.x - cx, y = q.y - cy;
      if (!onScreen(x, y, 10)) continue;
      const k = q.life / q.max;
      if (q.kind === "smoke") {
        const r = 2 + k * 7;
        g.fillStyle = `rgba(190,165,130,${0.3 * (1 - k)})`;
        g.fillRect(x - r / 2, y - r / 2, r, r);
      } else {
        g.fillStyle = k < 0.5 ? "#ffcf70" : "#d9561a";
        g.fillRect(x, y, 1, 1);
      }
    }

    /* Bats circle the Vikskull hall. */
    const tower = this.plan.landmarks.find((l) => l.sprite === "skullhall");
    if (tower) {
      g.fillStyle = "#120b06";
      for (const b of this.ravens) {
        const a = b.a + t * 0.001 * b.s;
        const x = tower.x + Math.cos(a) * b.r - cx, y = tower.y - 140 + Math.sin(a) * b.r * 0.45 - cy;
        const flap = Math.sin(t * 0.016 + b.a * 3) > 0 ? 1 : -1;
        g.fillRect(x - 1, y, 3, 1); g.fillRect(x - 3, y - flap, 2, 1); g.fillRect(x + 2, y - flap, 2, 1);
      }
    }

    /* Light. Golden haze on the personal side, fading to clean daylight on paper. */
    const mid = this.cam.y + vh / 2;
    const pro = smoothstep(-220, 220, this.cam.x + vw / 2 - seamAt(this.plan, mid));
    g.globalCompositeOperation = "soft-light";
    g.globalAlpha = 0.85 * (1 - pro * 0.92);
    g.drawImage(this.grade, 0, 0);
    g.globalAlpha = 1 - pro * 0.7;
    g.globalCompositeOperation = "multiply";
    for (const c of this.clouds) {
      const x = c.x - cx, y = c.y - cy;
      if (onScreen(x, y, c.r)) g.drawImage(this.shade, x - c.r, y - c.r, c.r * 2, c.r * 2);
    }
    g.globalCompositeOperation = "lighter";
    for (const L of w.lights) {
      const x = L.x - cx, y = L.y - cy;
      if (!onScreen(x, y, L.r)) continue;
      const fl = this.calm ? 1 : 0.86 + Math.sin(t * 0.009 + L.seed) * 0.08 + Math.sin(t * 0.023 + L.seed * 2) * 0.06;
      const r = L.r * fl;
      g.globalAlpha = L.hot ? 0.75 : 0.6;
      g.drawImage(L.hot ? this.hot : this.warm, x - r, y - r, r * 2, r * 2);
    }
    g.globalAlpha = 1;
    if (!this.calm && pro < 0.98) {
      g.globalCompositeOperation = "screen";
      g.globalAlpha = (0.55 + Math.sin(t * 0.0004) * 0.2) * (1 - pro);
      g.drawImage(this.rays, -100 - ((cx * 0.12) % 100), 0);
      g.globalAlpha = 1;
      g.globalCompositeOperation = "lighter";
      for (const m of this.motes) {
        const x = (m.x * vw + t * 0.006 * m.s + Math.sin(t * 0.0006 + m.p) * 16 - cx * 0.5) % vw;
        const y = (m.y * vh - t * 0.004 * m.s + Math.cos(t * 0.0008 + m.p) * 12 - cy * 0.5) % vh;
        g.fillStyle = `rgba(255,214,140,${(0.25 + 0.3 * Math.sin(t * 0.002 + m.p) ** 2) * (1 - pro)})`;
        g.fillRect(x < 0 ? x + vw : x, y < 0 ? y + vh : y, 1, 1);
      }
    }
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1 - pro * 0.55;
    g.drawImage(this.vignette, 0, 0);
    g.globalAlpha = 1;
  }

  private drawPlayer(cx: number, cy: number) {
    const g = this.g!, p = this.player;
    const img = this.frames![p.dir][p.moving ? Math.floor(p.step) % 4 : 0];
    const x = Math.round(p.x - cx), y = Math.round(p.y - cy);
    g.fillStyle = "rgba(20,10,4,.4)";
    g.beginPath();
    g.ellipse(x + 9, y + 2, 14, 3, -0.15, 0, 7);
    g.fill();
    if (p.flip) {
      g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(img, -10, y - 26); g.restore();
    } else g.drawImage(img, x - 10, y - 26);
  }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    this.update(dt, t);
    this.draw(t);
    if (this.mode !== "title") this.frameSubs.forEach((fn) => fn(this));
    this.raf = requestAnimationFrame(this.loop);
  };
}

function smoothstep(a: number, b: number, v: number) {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function isTyping(e: KeyboardEvent) {
  const el = e.target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}
