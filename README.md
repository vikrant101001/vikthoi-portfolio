# vikthoi-portfolio

The Amber Vale: a portfolio you can walk through. A top-down, golden-hour world where each building is a section.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, then build to dist/
npm run typecheck
```

## Where things live

| Folder | What it holds | React? |
| --- | --- | --- |
| `src/content/` | Everything visitors read: profile, sections, projects. Start here. | No |
| `src/world/plan.ts` | Where buildings, roads, the river and props sit. | No |
| `src/engine/` | The game: terrain, sprites, collision, camera, light. | No |
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
| `/<section slug>` | A section over the world, e.g. `/about`, `/projects`. Shareable, and lands the traveller at that building. |
| `/projects/<slug>` | A project's own page |
| `/play/<game id>` | A mini-game |
| anything in `src/app/redirects.ts` | Redirects elsewhere, inside or outside the site |

## Common changes

- **Add a project:** add an entry to `src/content/projects.ts`. It appears on the Guild Hall board and gets a page.
- **Add a section and building:** add the section to `src/content/sections.ts` and a landmark with the same id to `src/world/plan.ts`.
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
