# vaje-games

واژه‌بازی (vaje-games) — a hub of small Farsi word games, built with Astro +
Preact. The site is Farsi-only (`lang="fa" dir="rtl"`). The home page lists
available games as buttons; each game is its own self-contained flow under
`src/games/<name>/`. First (and currently only) game: **پانتومیم** (charades).

## Stack

- **Astro 7**, no `@astrojs/preact` integration — the home page is plain Astro,
  and each game page (`src/pages/<game>.astro`) mounts its Preact app directly
  with `preact.render()` in an inline `<script>` (see
  `src/pages/pantomime.astro`), skipping Astro's islands runtime entirely. This
  mirrors `chooser`'s pattern, not `split-bill`'s `client:load` islands.
- **Preact + @preact/signals** for state. No React.
- **Tailwind v4** via `@tailwindcss/vite`. Component styles use CSS Modules
  (`*.module.css`) co-located with components; Tailwind utility classes for
  one-offs.
- **@fontsource-variable/vazirmatn** self-hosted variable font for Farsi text,
  imported in `src/styles/global.css`.
- **TypeScript strict**, `noUncheckedIndexedAccess`, JSX → `preact`,
  `baseUrl: src`.
- Static build deployed to Netlify (`dist/`). No PWA/offline support (v1 is a
  plain static site, unlike `chooser`).

## Commands

| Command             | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Astro dev server at `localhost:4321` |
| `pnpm build`        | Production build to `dist/`          |
| `pnpm preview`      | Preview built site                   |
| `pnpm format:write` | Prettier write                       |
| `pnpm format:check` | Prettier check                       |
| `npx tsc --noEmit`  | Type-check                           |

## Adding a new game

1. Add an entry to `src/games/registry.ts` (`slug`, `title`, `description`) — it
   drives the button on the home page automatically.
2. Create `src/games/<slug>/` for the game's components, types, and any word
   data or scoring logic.
3. Add `src/pages/<slug>.astro`, following `pantomime.astro`'s direct-render
   pattern.
4. If the game needs persisted settings, add a `src/state/<slug>State.ts` module
   following `pantomimeState.ts`'s shape (signals + exported mutation helpers +
   a `localStorage` `effect()`).

## پانتومیم (charades) architecture

Pass-the-phone, timed-round charades: teams take turns acting out a word for
their team to guess; a correct guess is worth the word's difficulty in points
(easy=1, medium=2, hard=3 — see `DIFFICULTIES` in `words.ts`), and skipping
costs the same amount, so skipping a hard word is riskier than skipping an easy
one. Play continues round-robin across teams until a team reaches the configured
target score. Categories are content-only — every category always plays; there
is no category picker in the UI, only a difficulty filter.

- **`src/words.json`** — the word bank content, and the only file you need to
  touch to add/remove/re-tag words or add a whole new category. Shape:
  `{ categories: [{id, label}], words: [{text, category, difficulty}] }`.
  `category` just groups words for your own editing sanity (there's no in-game
  filter by it); `difficulty` is `"easy" | "medium" | "hard"` and does drive
  scoring. Lives at the `src/` root (not under `games/pantomime/`) since it's
  fetched as a standalone asset, not bundled JS — see the loading model below.
  Currently ~475 words across 11 categories (movies/TV, cartoons, proverbs,
  professions, actions, animals, objects, celebrities, sports, food, places).
- **Loading model**: `words.json` is _not_ statically imported (that would
  inline ~500 words into the JS bundle). `src/games/pantomime/words.ts` imports
  it as `import wordsUrl from "../../words.json?url"`, which makes Vite emit it
  as its own hashed asset and gives back its URL. `words.ts` then
  `fetch(wordsUrl)`s it lazily via `loadWords()` (memoized promise), kicked off
  eagerly the moment the module evaluates. `pantomime.astro` imports the same
  `?url` value and passes it to `Layout`'s `preloadJsonHref` prop, which renders
  `<link rel=preload as=fetch crossorigin=anonymous>` in `<head>` — so the
  browser starts downloading the JSON the instant the HTML is parsed, in
  parallel with the JS bundle, well before the player finishes team setup. The
  `crossorigin` attribute is required even though the resource is same-origin:
  without it the preloaded request and the later `fetch()` don't share a cache
  entry and the browser downloads it twice. (Verified in both dev and a
  production build that this results in exactly one network request.) `words.ts`
  also defines the fixed (code-level, not content) `DIFFICULTIES` metadata:
  Farsi label + point value per tier.
- **`src/state/pantomimeState.ts`** — persisted _settings only_: team names,
  selected difficulties, round length, target score. Signals + exported mutators
  (`addTeam`, `removeTeam`, `renameTeam`, `toggleDifficulty`, `setRoundSeconds`,
  `setTargetScore`); persisted to `localStorage` under
  `vaje-games-pantomime-settings` via an `effect()`. On load, any stored
  difficulty ids that no longer exist are dropped (falls back to "all"). Live
  game progress (scores, deck, current phase) is **not** persisted — a refresh
  mid-game drops back to setup with the previous settings prefilled,
  intentionally, to avoid the complexity of serializing in-flight game state.
- **`src/games/pantomime/scoring.ts`** — `buildDeck(words, difficulties)`
  (shuffle words matching the difficulty filter — categories aren't filtered,
  all always included), `pointsForWord()` (difficulty → points),
  `applyScoreDelta()` (score change, clamped at 0), `findWinner()`.
- **`src/games/pantomime/PantomimeApp.tsx`** — the orchestrator. Holds all
  ephemeral game state (`allWords`, `phase`, `teams`, `currentTeamIndex`,
  `deck`, `currentWord`, `timeLeft`, `roundStats`) in `useState`/`useEffect`
  (not signals — this is single-component, high-churn state, same rationale as
  `chooser`'s `ChooserApp.tsx`). Calls `loadWords()` on mount into `allWords`;
  `freshDeck()`/`nextWord()` are defined inside the component so they can close
  over the current `allWords` state. Renders one of five screens based on
  `phase`:
  - `setup` → `TeamSetupScreen` (edits the persisted settings signals directly;
    receives `wordsReady={allWords !== null}` and disables/relabels the start
    button until the fetch resolves — in practice near-instant thanks to the
    preload, but still handled honestly since it's genuinely async)
  - `ready` → `ReadyScreen` (pass-the-phone prompt before each team's turn)
  - `playing` → `RoundScreen` (word + timer + بلد شد / رد کن)
  - `roundEnd` → `ResultsScreen` (`mode="round"`, per-round stats + running
    scoreboard, advances to the next team or to `gameOver`)
  - `gameOver` → `ResultsScreen` (`mode="gameOver"`, winner + final scoreboard,
    replay or back to setup)
- **Deck mechanics**: `deck` holds words not yet guessed correctly _this game_.
  "بلد شد" removes the word permanently; "رد کن" moves it to the back of the
  deck (it can resurface later the same game). If the deck empties mid-game,
  `nextWord()` reshuffles a fresh deck from `allWords` filtered by the selected
  difficulties, rather than ending the game.
- **`RoundScreen`** shows a small colored badge (green/amber/red for
  easy/medium/hard) with the word's point value, so players know the stakes
  before deciding whether to skip.

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`.
- Import paths use the `src/` baseUrl alias for top-level dirs; relative paths
  within a feature folder.
- Signals are read via `.value` in components; never destructured.
- Everything is Farsi/RTL — don't add English UI strings without a reason.
