/* The single engine instance for the whole app, and the bridge that copies
   its events into the React store. Importing this module wires both up. */
import { Engine } from "@/engine/Engine";
import { plan } from "@/world/plan";
import { useGame } from "./store";

export const engine = new Engine(plan);

engine.on("ready", () => useGame.setState({ ready: true }));
engine.on("near", (l) => useGame.setState({ near: l?.id ?? null }));
engine.on("discover", (l) =>
  useGame.setState((s) => ({
    discovered: [...s.discovered, l.id],
    banner: { id: l.id, key: s.banner ? s.banner.key + 1 : 1 },
  })),
);

if (import.meta.env.DEV) (window as unknown as { __engine: Engine }).__engine = engine;
