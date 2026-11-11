/* React-facing game state. Only things that change rarely live here; values
   that change every frame (position, heading) are read from the engine
   directly with engine.onFrame, so React never re-renders 60 times a second. */
import { create } from "zustand";

interface GameState {
  /** The world has finished generating. */
  ready: boolean;
  /** The visitor has left the title screen. */
  started: boolean;
  /** Landmark id the player is standing at, if any. */
  near: string | null;
  discovered: string[];
  /** Latest discovery to announce. `key` restarts the animation. */
  banner: { id: string; key: number } | null;
}

export const useGame = create<GameState>(() => ({
  ready: false,
  started: false,
  near: null,
  discovered: [],
  banner: null,
}));
