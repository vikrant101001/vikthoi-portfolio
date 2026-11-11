import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";
import { useParams } from "react-router";
import { gameById, type GameEntry } from "@/games/registry";
import { PageShell } from "./PageShell";
import { NotFound } from "./NotFound";

/* One lazy component per game, created once so React keeps it stable. */
const cache = new Map<string, LazyExoticComponent<ComponentType>>();
const lazyGame = (g: GameEntry) => {
  let c = cache.get(g.id);
  if (!c) cache.set(g.id, (c = lazy(g.load)));
  return c;
};

/** /play/<id>: a mini-game, loaded on demand. */
export function GamePage() {
  const { gameId = "" } = useParams();
  const entry = gameById(gameId);
  if (!entry) return <NotFound />;
  const Game = lazyGame(entry);
  return (
    <PageShell title={entry.title} wide>
      <small className="kicker">A diversion</small>
      <h1>{entry.title}</h1>
      <p>{entry.description}</p>
      <Suspense fallback={<p>Setting up the board&hellip;</p>}>
        <Game />
      </Suspense>
    </PageShell>
  );
}
