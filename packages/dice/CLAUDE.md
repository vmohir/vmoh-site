# sixes

Sixes — a pass-and-play roll-and-write dice game for one device and 1-6 players,
in the spirit of games like _That's Pretty Clever_. The rules here are an
original design (own scoring, own column layout) inspired by that genre, not a
reproduction of any specific game's board or scoring chart.

## Stack

- **Astro 7**, no `@astrojs/preact` integration — `src/pages/index.astro` mounts
  `SixesApp` directly with `preact.render()` in an inline `<script>`, skipping
  Astro's islands runtime entirely. Same pattern as `chooser` and `vaje-games`.
- **Preact + @preact/signals** for the persisted player-setup state; ephemeral
  game state lives in `SixesApp.tsx` via `useState` (same rationale as the other
  packages' orchestrators — single-component, high-churn state).
- **Tailwind v4** via `@tailwindcss/vite`. Component styles use CSS Modules
  (`*.module.css`) co-located with components; Tailwind utility classes for
  one-offs.
- **TypeScript strict**, `noUncheckedIndexedAccess`, JSX → `preact`,
  `baseUrl: src`.
- Static build deployed to Netlify (`dist/`). No PWA/offline support.

## Commands

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Astro dev server at `localhost:4321` |
| `pnpm build`        | Production build to `dist/`          |
| `pnpm preview`      | Preview built site                   |
| `pnpm format:write` | Prettier write                       |
| `pnpm format:check` | Prettier check                       |
| `npx tsc --noEmit`  | Type-check                           |

## The rules

- Dice: one **white (wild)** die plus five **colored** dice — red, blue, green,
  amber, purple.
- Each player has a scoresheet with those five colors as columns, each column
  holding boxes numbered 1-6. Within a column, boxes must be checked off in
  strictly ascending order — checking box 4 permanently forfeits boxes 1-3 in
  that column, so taking a die value early can cost you later. This is the
  entire strategic tension of the game (`canCheck`/`highestChecked` in
  `logic.ts`).
- The game runs a fixed `TOTAL_ROUNDS = 6` rounds (`logic.ts`), regardless of
  player count — matching the genre convention of "always 6 rounds," not scaling
  turn count with player count. The active roller rotates round-robin, one
  player per round.
- Each round: the active player rolls all six dice once (no rerolls).
  - **Every** player (including the active one) may then use the white die's
    value on **one** column of their choice (or skip).
  - The active player additionally gets their five colored dice — each colored
    die can only be used on its own matching column, at most once each,
    independent of the white die.
- **Scoring** (`columnScore`/`totalScore` in `logic.ts`): a column's score is
  the sum of its checked box values, +3 if box 6 was reached, +10 if the whole
  column (all six boxes) was completed. A player who has checked at least one
  box in every column gets a flat +5 "rainbow" bonus. Highest total after 6
  rounds wins.

## Folder layout

```
src/
├── pages/index.astro          # entry, renders Layout > SixesApp
├── layouts/Layout.astro
├── state/setupState.ts        # persisted player names (signals)
└── game/
    ├── SixesApp.tsx           # orchestrator: phase machine + all game state
    ├── types.ts                # ColorId, PlayerState, DiceRoll, Phase
    ├── logic.ts                 # rollDice, canCheck/checkBox, scoring — pure, no UI
    ├── Die.tsx                  # pip-grid die face (wild or one of the 5 colors)
    ├── ColumnRow.tsx             # one interactive column row: boxes + "Take N" button
    ├── ScoreSheet.tsx            # read-only column grid, used on the game-over screen
    ├── SetupScreen.tsx           # player name list (min 1, max 6)
    ├── RollScreen.tsx            # "Round N — {player}'s roll" + roll button
    ├── HandoffScreen.tsx         # "pass the device to {player}" between turns
    ├── WildTurnScreen.tsx        # non-active player: white die only, single action
    ├── ActiveTurnScreen.tsx      # active player: white die (any column) + own 5 colored dice
    └── GameOverScreen.tsx        # ranked scoreboard, tap a row to expand that sheet
```

## Turn orchestration (`SixesApp.tsx`)

`Phase = "setup" | "roll" | "handoff" | "wildTurn" | "activeTurn" | "gameOver"`.
A round is processed as a queue of per-player "steps": step index `i`
corresponds to `players[i]`, and whichever player is at `round % players.length`
is the active roller for that round (`activeIndex`).

- `doRoll()` rolls the dice once for the round and calls `enterStep(0)`.
- `enterStep(index)` sets `stepIndex` and picks the next phase: `"handoff"` when
  there's more than one player (so the device can physically change hands),
  otherwise jumps straight to `"wildTurn"`/`"activeTurn"` — solo play never sees
  a handoff screen since there's no one to pass to.
- Each turn screen calls `advanceStep()` when done: it either moves to the next
  step in the round, or — once every player has had their step — advances to the
  next round (rerolling) or, after `TOTAL_ROUNDS`, to `"gameOver"`.
- `WildTurnScreen` auto-advances the moment a choice (apply or skip) is made,
  since it's a single action. `ActiveTurnScreen` does not — it has up to six
  independent legal actions (the wild die once, plus up to five colored dice),
  so it stays on screen behind an explicit "Continue" button; `wildUsed` is
  local `useState` inside that component, reset by the
  `key={`active-${round}-${stepIndex}`}` remount trick when a new step starts,
  since the wild die is only usable once per round.
- Dice application always goes through `checkBox()` in `logic.ts`, which is a
  no-op (returns the player unchanged) if the move is illegal — so the UI only
  needs to gate _visibility/enabled state_ of the action buttons via
  `canCheck()`, not duplicate the legality check on the write path.

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`.
- Import paths use the `src/` baseUrl alias for top-level dirs (`state/...`);
  relative paths within `game/`.
- Signals (`setupState.ts`) are read via `.value` in components; never
  destructured.
- Column colors are plain, generic names (`red`/`blue`/`green`/`amber`/
  `purple`) with their own CSS custom properties in `global.css` (`--die-red`,
  etc.) — not tied to any particular game's branding.
