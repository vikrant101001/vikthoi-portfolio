# vikthoi-portfolio

A portfolio you can walk through. The world is split down the middle: professional life on the right, drawn in ink on paper, and personal life on the left, painted warm and a little wild. A letter at the start explains the way.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then build to dist/
npm run typecheck
```

## Where things live

| Folder | What it holds | React? |
| --- | --- | --- |
| `src/content/` | Everything visitors read. One file per road (`career`, `projects`, `skills`, `games`, `fun`); each entry becomes a building. The letter is in `sections.ts`. Start here. | No |
| `src/world/plan.ts` | The square, the five roads and their signboards. Stops are laid out from the content files. Only roads and the square are walkable. | No |
| `src/engine/` | The game: terrain, collision, camera, light. Sprites are in `engine/sprites/`, one file per half. | No |
| `src/game/` | The bridge: the single engine instance and the store React reads. | Thin |
| `src/ui/` | HUD, title screen, section panels, world map. | Yes |
| `src/pages/` | Normal scrolling pages: project write-ups, games, 404. | Yes |
| `src/games/` | Mini-games, loaded only when opened. | Yes |
| `src/app/` | Router, world layout, redirects. | Yes |
| `src/styles/` | Design tokens and shared classes. Component styles sit next to each component as `.module.css`. | |

The engine never imports React. It owns the canvas and the loop, and React talks to it through
`engine.on(...)`, `engine.onFrame(...)` and commands such as `engine.teleport(id)`. HUD parts that
move every frame (compass, minimap) update the DOM directly through `onFrame`, so React does not
re-render 60 times a second.

## URLs

| URL | What opens |
| --- | --- |
| `/` | The world |
| `/map` | World map over the world |
| `/<place>` | A place over the world: `/letter`, `/career-3`, `/project-2`, `/skills-1`, `/games-4`, `/fun-2`. Shareable, and lands the traveller at that building. |
| `/projects/<slug>` | A project's own page |
| `/play/<game id>` | A mini-game |
| anything in `src/app/redirects.ts` | Redirects elsewhere, inside or outside the site |

## Common changes

- **Edit the starting letter:** the `letter` entry in `src/content/sections.ts`.
- **Add a stop to a road:** add an entry to that road's content file (`career.ts`, `projects.ts`, `skills.ts`, `games.ts`, `fun.ts`). The building, its signposted place on the road, its panel, its link (e.g. `/project-3`) and its row on the map all appear automatically. On the career road keep the last `upcoming: true` entry as the construction site; in `fun.ts`, `look` picks tent, stall, gazebo or campfire.
- **Full project write-ups** live at `/projects/<slug>`, linked from each project's stop.
- **Add a whole new road:** add it to `src/content/roads.ts`, generate its sections in `sections.ts`, lay it out with `layRoad` and give it a `board` in `src/world/plan.ts`, and add it to `journey` in `src/game/places.ts`.
- **Change how either half looks:** colours in `src/engine/palette.ts` (world) and `src/styles/tokens.css` (interface; the `--hud-*` tokens switch when you cross the seam).
- **Add a new kind of section layout:** add a member to `Section` in `src/content/types.ts`, a component in `src/ui/panel/sections/`, and a case in `SectionBody.tsx`. TypeScript flags anything missed.
- **Add a page:** create it in `src/pages/` using `PageShell`, then add a route in `src/app/router.tsx`.
- **Add a mini-game:** see the comment at the top of `src/games/registry.ts`.

## Hosting

It is a single-page app, so the host must serve `index.html` for every path. `public/_redirects`
(Netlify, Cloudflare Pages) and `vercel.json` (Vercel) already do this.

## Toolchain note

This uses Vite 7 with Rollup's WebAssembly build (see `overrides` in `package.json`) because the
development PC's Windows Application Control policy blocks unsigned native Node binaries, which
includes Rollup's and Vite 8's bundler. On a machine without that policy, the override can be removed.
