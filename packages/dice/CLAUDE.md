# sixes

Sixes — a pass-and-play roll-and-write dice game for one device and 1-6 players,
in the spirit of "That's Pretty Clever" (Ganz Schön Clever). It follows that
game's real turn structure and per-color fill rules closely enough that a fan of
the original should recognize it immediately, but the exact printed box
values/points are this project's own approximation (see "What's faithful vs.
approximated" below) — the primary rulebook wasn't fetchable from this
environment, so the mechanics were reconstructed from several independent
secondary sources, not verified against the original scoresheet.

## Stack

- **Astro 7**, no `@astrojs/preact` integration — `src/pages/index.astro` mounts
  `SixesApp` directly with `preact.render()` in an inline `<script>`, skipping
  Astro's islands runtime entirely. Same pattern as `chooser` and `vaje-games`.
- **Preact**, no signals for game state — `SixesApp.tsx` and
  `ActiveTurnScreen.tsx` hold everything in `useState` (single-component,
  high-churn state). `@preact/signals` is used only for the persisted
  player-setup names (`state/setupState.ts`).
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

- **Dice**: one **white (wild)** die plus **yellow, blue, green, orange,
  purple**.
- **Rounds**: `roundsForPlayerCount()` (`board.ts`) — 6 rounds for 1-2 players,
  5 for 3, 4 for 4+. One player is "active" (the roller) each round, rotating
  round-robin (`round % players.length`).
- **Active player's turn** (`ActiveTurnScreen.tsx`): up to **3 roll-and-pick
  cycles**.
  1. Roll every die still "in play" (all 6 at the start of the turn).
  2. Pick one die to place. Dice show sorted by value, low to high, so it's easy
     to scan. A colored die goes into its own matching color, at its own face
     value; the white die can stand in for **any one of yellow, green, orange,
     or purple** at its own face value — or be **added to the blue die** for one
     bigger blue entry (a dedicated "Blue (white + blue = N)" option, only
     offered when blue is still in play; this consumes both dice as a single
     pick). White can **not** stand alone as blue — blue is reached either by
     its own die's value, or by the white+blue sum, never by white alone.
  3. Placing a die never auto-picks a box: the sheet highlights every
     currently-legal box for that die's value in that one column (there can be
     more than one — e.g. yellow has two boxes for each value 1-6), and the
     player taps the specific box they want (`ScoreSheet`'s `pickable`/ `onPick`
     props). There's a "Cancel" affordance to back out of a selection before
     confirming, without spending the pick.
  4. Once confirmed, every other in-play die showing **less** than the value
     just placed drops out onto the **Silver Platter** (`platter` state, an
     array of `{ die, value }`); dice showing the same or higher stay in play
     for the next reroll.
  5. Repeat, or stop early. After the 3rd pick — or whenever no dice remain in
     play — everything still in play also lands on the platter regardless of
     value.
- **Everyone else** (`PlatterTurnScreen.tsx`): once per round, take **one**
  value off the Silver Platter (also shown sorted by value) and mark it on your
  own sheet — same "pick a die, then tap the specific box" flow, minus the
  white+blue combo (that's an active-turn-only move, since it needs control of
  two dice from the same roll) — or skip. The platter isn't consumed — two
  different players can use the same entry.
- **Five columns, five different fill rules** (`board.ts` + `logic.ts`'s
  `legalBoxIndices`) — this is what actually makes the game recognizable, not
  the exact numbers:
  - **Yellow** (`kind: "match"`, grid layout): place a die in any open box that
    shows its value, in any order.
  - **Blue** (`kind: "match"`, row layout): same any-order matching rule, but
    scored by **how many** boxes you've filled against an accelerating table
    (`BLUE_COUNT_TABLE`), not by the values themselves.
  - **Green** (`kind: "threshold"`): strictly left-to-right; the next open box
    needs a die at least as high as its printed threshold (thresholds cycle
    1-2-3-4-5-…); scored by each box's printed point value.
  - **Orange** (`kind: "free"`): strictly left-to-right; write the die's value
    into the next open box (some boxes multiply it ×2/×3); scored by summing
    what's written.
  - **Purple** (`kind: "increasing"`): strictly left-to-right; each new entry
    must beat the previous one — caps out at 6 boxes since values only run 1-6;
    scored by each box's printed point value.
- **Foxes**: a handful of boxes across the sheet carry a fox icon (`fox: true`
  in `board.ts`); each one checked earns a fox (`countFoxes()`). At game end,
  each fox scores as many points as your single **lowest**-scoring color — so a
  zero anywhere makes every fox worth zero, by construction of `Math.min(...)`
  in `totalScore()`.
- **Reroll bonus**: a few boxes (`bonusReroll: true`) grant the active player
  one extra roll cycle this turn when checked (`ActiveTurnScreen`'s local
  `bonusRerolls` state, only meaningful during an active turn).

### What's faithful vs. approximated

Faithful to the real game (confirmed across multiple independent descriptions of
the rules): the 6-dice/white-wild setup, the 3-roll pick-and-shrink turn
structure with the Silver Platter, the player choosing which specific open box a
die goes into rather than it being auto-assigned, each color's distinct
fill-order rule (yellow/blue any-order, green threshold, orange
free-with-multipliers, purple strictly-increasing), the white+blue addition
combo for blue, and the fox-scores-your-lowest-color mechanic.

**Approximated/simplified**, and worth knowing if you've played the original and
something feels off:

- The exact printed box values, point tables, and multiplier positions on the
  real scoresheet weren't available to verify from this environment — everything
  in `board.ts` (yellow's two-of-each-value grid, blue's 1-12 range and
  count-table, green/orange/purple's specific point curves) is an original,
  reasonable-feeling approximation, not a transcription of the official sheet.
- Two bonus-box effects from the original are not implemented: reusing a die
  later via a banked token, and crossing off a box in a different color as a
  bonus. Only the fox bonus and the extra-reroll bonus are wired up.

## Folder layout

```
src/
├── pages/index.astro           # entry, renders Layout > SixesApp
├── layouts/Layout.astro
├── state/setupState.ts         # persisted player names (signals)
└── game/
    ├── SixesApp.tsx            # orchestrator: phase machine + players/round/platter state
    ├── board.ts                 # the printed sheet: BOARD defs, scoring mode, round count
    ├── types.ts                  # ColorId, DieId, BoxDef variants, PlayerState, Phase
    ├── logic.ts                   # rollDie, legalBoxIndices/placeDieAt, scoreColumn, totalScore, countFoxes
    ├── Die.tsx                    # pip-grid die face; renders as a <button> when onClick is passed
    ├── ScoreSheet.tsx              # the full sheet: yellow grid + 4 rows + fox tally (+ totals when showScores)
    ├── SetupScreen.tsx             # player name list (min 1, max 6)
    ├── HandoffScreen.tsx           # "pass the device to {player}" between turns
    ├── ActiveTurnScreen.tsx        # the roll/pick/reroll loop — owns its own turn-local state
    ├── PlatterTurnScreen.tsx       # a passive player's single pick off the Silver Platter
    └── GameOverScreen.tsx          # ranked scoreboard, tap a row to expand that player's sheet
```

## Turn orchestration (`SixesApp.tsx`)

`Phase = "setup" | "handoff" | "activeTurn" | "platterTurn" | "gameOver"`. Each
round builds an `order` array — the active player's index first, then everyone
else in their original order — and `stepIndex` walks through it.
`ActiveTurnScreen` and `PlatterTurnScreen` each own their entire interaction
internally and report back exactly once: the active screen calls
`onTurnEnd(updatedPlayer, platter)` when the whole 3-cycle turn is over, and the
platter screen calls `onDone(updatedPlayer)` after a single pick (or skip).
`SixesApp` only needs to merge that one player back into `players` and call
`advanceStep()` — it never sees the roll-by-roll detail.

Both turn screens use the same two-step selection flow: clicking a die (or, for
white, a color/combo button) computes `legalBoxIndices()` for that color+value
and stores it as a `Selection { color, value, consumedDice, indices }` — this
gets passed straight through to `ScoreSheet` as `pickable={{ color, indices }}`,
which is what actually highlights the specific boxes. Nothing is written to the
player's sheet until `onPick` fires from a tap on one of those highlighted
boxes; `ActiveTurnScreen` additionally tracks `consumedDice` (one die normally,
`["white", "blue"]` for the combo) since that's what has to leave play once the
pick is confirmed, rather than just the die that was originally clicked.

`ActiveTurnScreen`'s confirm handler (`confirmPick`) is the one place that
implements the "everything lower drops to the platter" rule: it walks
`DIE_ORDER`, and for each die still in play that isn't one of `consumedDice` and
whose rolled value is strictly less than the just-placed value, moves it out of
play and appends it to a local `platter` array — which is threaded explicitly
through to `finishTurn` rather than read back out of React state, since the
state update from the same call hasn't committed yet when `finishTurn` needs it.

`Die.tsx` renders as a `<button>` when given an `onClick` (both turn screens
pass one only for dice that are currently legal to pick) and a plain `<div>`
otherwise; `ScoreSheet`'s boxes follow the same pattern (`<button>` only for the
currently-pickable ones, `<span>` otherwise) — the game-over screen and anything
not your turn never need to be interactive.

**CSS gotcha worth remembering**: `Die.module.css`'s `.sm/.md/.lg` set fixed
`padding` per size rather than a percentage. Percentage `padding` on a flex item
resolves against the _containing flex row's_ width, not the item's own width —
with all 6 dice in one row this silently blew the padding out to ~66px on a 72px
die, so `grid-template-columns` on the die itself collapsed to `0px 0px 0px` and
every pip disappeared. Caught via `getBoundingClientRect()`/`getComputedStyle()`
in a Playwright smoke test, not by looking at it.

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`.
- Import paths use the `src/` baseUrl alias for top-level dirs (`state/...`);
  relative paths within `game/`.
- Signals (`setupState.ts`) are read via `.value` in components; never
  destructured.
- Column colors are plain, generic names (`yellow`/`blue`/`green`/`orange`/
  `purple`) with their own CSS custom properties in `global.css`
  (`--die-yellow`, `--color-yellow-soft`, etc.).
