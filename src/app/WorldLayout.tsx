/* The world and everything layered on it. The URL decides what is open:
   "/" is free roaming, "/map" and "/<section>" pause the game under an overlay. */
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { engine } from "@/game/engine";
import { useGame } from "@/game/store";
import { sectionById } from "@/content/sections";
import { GameCanvas } from "@/ui/GameCanvas";
import { Hud } from "@/ui/hud/Hud";
import { TitleScreen } from "@/ui/title/TitleScreen";

export function WorldLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const started = useGame((s) => s.started);
  const overlay = pathname !== "/";

  /* Arriving on a deep link such as /career-2 skips the title screen. */
  useEffect(() => {
    if (overlay && !started) useGame.setState({ started: true });
  }, [overlay, started]);

  useEffect(() => {
    engine.setMode(!started ? "title" : overlay ? "paused" : "play");
  }, [started, overlay]);

  useEffect(
    () =>
      engine.on("interact", (l) => {
        const s = sectionById(l.id);
        if (s) navigate(`/${s.slug}`);
      }),
    [navigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!useGame.getState().started || e.repeat) return;
      if ((e.target as HTMLElement).closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.code === "KeyM" && (pathname === "/" || pathname === "/map")) navigate(pathname === "/map" ? "/" : "/map");
      if (e.code === "Escape" && overlay) navigate("/");
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [navigate, pathname, overlay]);

  return (
    <>
      <GameCanvas />
      {started && <Hud inert={overlay} />}
      <TitleScreen skip={overlay} />
      <Outlet />
    </>
  );
}
