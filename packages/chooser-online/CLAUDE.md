# chooser-online

Chwazi-style finger picker. Multiple people put fingers on the phone screen,
hold for a few seconds, and the app picks a winner, splits them into teams, or
assigns an order. Offline-first PWA.

## Stack

- **Astro 5** with `@astrojs/preact`. One page (`src/pages/index.astro`) that
  mounts `ChooserApp` as a `client:load` island.
- **Preact + @preact/signals** for state and reactivity.
- **Tailwind v4** via `@tailwindcss/vite`. Component styles use CSS Modules
  (`*.module.css`) alongside `src/styles/global.css`.
- **TypeScript strict** with `noUncheckedIndexedAccess`, JSX → `preact`,
  `baseUrl: src`.
- **@vite-pwa/astro** generates the service worker + manifest so the app is
  installable and works offline.
- **pnpm**, formatted with Prettier (`proseWrap: always`).

## Commands

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Astro dev server at `localhost:4321` |
| `pnpm build`        | Production build to `dist/`          |
| `pnpm preview`      | Preview built site                   |
| `pnpm format:write` | Prettier write                       |
| `pnpm format:check` | Prettier check                       |
| `npx tsc --noEmit`  | Type-check                           |

## Architecture

Settings state lives in `src/state/chooserState.ts` as `@preact/signals` signals
(`mode`, `teamCount`, `holdSeconds`, `settingsOpen`). Mutations go through
exported helpers (`setMode`, `setTeamCount`, `setHoldSeconds`). An `effect()`
persists the snapshot to `localStorage` under `chooser-state`.

Ephemeral state (which fingers are currently down, current phase, in-flight
result) lives in `ChooserApp.tsx` using React-style refs + `useState`, because
pointer events fire at frame-rate and don't belong in signals.

### Selection flow

1. `pointerdown` → add a `Finger` to the ref'd `Map<pointerId, Finger>`, assign
   it the next free colour from the palette.
2. As soon as `>= 2` fingers are present, the phase switches to `"countdown"`
   and a `requestAnimationFrame` loop drives the ring pulse.
3. Any change in finger count (down or up) restarts the countdown — this is
   intentional and matches the original Chwazi behaviour.
4. When `progress >= 1`, `pickResult()` (`src/chooser/selection.ts`) runs over
   the current fingers and returns a `ChoiceResult`. Phase becomes `"result"`
   and rings re-render in their new state (winner big + glowing, team-coloured,
   or numbered).
5. The result stays on screen until the user taps "Tap to play again". Any new
   touch while a result is up also resets.

### Folder layout

```
src/
├── pages/index.astro            # entry, renders Layout > ChooserApp
├── layouts/Layout.astro
├── chooser/
│   ├── ChooserApp.tsx           # main island: touch surface + RAF loop
│   ├── ChooserApp.module.css
│   ├── SettingsDrawer.tsx       # bottom-sheet settings UI
│   ├── SettingsDrawer.module.css
│   ├── selection.ts             # pickResult(mode, fingers, teamCount)
│   ├── colors.ts                # FINGER_COLORS + TEAM_COLORS palette
│   └── types.ts                 # Mode, Finger, ChoiceResult
├── state/chooserState.ts        # signals + persistence + clamp helpers
└── styles/global.css            # Tailwind v4 theme + component classes
```

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`.
- Import paths use the `src/` baseUrl alias (`import 'styles/global.css'`) for
  top-level dirs; relative paths within a feature folder.
- Signals are read via `.value` in components; never destructured.

## PWA notes

`@vite-pwa/astro` is configured with `registerType: "autoUpdate"` and a workbox
`globPatterns` that precaches everything in `dist/`. Icons live in `public/`:

- `favicon.svg` — browser tab
- `icon-192.png`, `icon-512.png` — Android home-screen
- `icon-maskable-512.png` — Android maskable

Regenerate icons from `public/favicon.svg` (or a 512×512 source SVG) with
`sips -s format png --resampleHeightWidth N N source.svg --out icon-N.png`.
