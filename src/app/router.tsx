/* Every URL in the site. The world lives at "/" and its overlays (the map and
   each section) are child routes, so the game keeps running underneath and
   every section has a shareable link. */
import { createBrowserRouter } from "react-router";
import { WorldLayout } from "./WorldLayout";
import { redirects } from "./redirects";
import { Redirect } from "./Redirect";
import { RouteError } from "@/pages/RouteError";
import { NotFound } from "@/pages/NotFound";
import { ProjectPage } from "@/pages/ProjectPage";
import { GamePage } from "@/pages/GamePage";
import { WorldMap } from "@/ui/map/WorldMap";
import { SectionRoute } from "@/ui/panel/SectionRoute";

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        path: "/",
        element: <WorldLayout />,
        children: [
          { index: true, element: null },
          { path: "map", element: <WorldMap /> },
          { path: ":slug", element: <SectionRoute /> },
        ],
      },
      { path: "/projects/:slug", element: <ProjectPage /> },
      { path: "/play/:gameId", element: <GamePage /> },
      ...redirects.map((r) => ({ path: r.from, element: <Redirect to={r.to} /> })),
      { path: "*", element: <NotFound /> },
    ],
  },
]);
