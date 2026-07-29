# vaje-games

واژه‌بازی (vaje-games) — a hub of small Farsi party games, built with Astro +
Preact. The site is Farsi-only (`lang="fa" dir="rtl"`). The home page lists
available games as buttons.

- **پانتومیم** (charades: act it out silently) and **دور** (describe it verbally
  without saying the word) are both thin configs over one shared engine,
  `src/games/wordGuessing/`, since the only thing that actually differs between
  them is the real-world instruction for how to convey the word; teams, scoring,
  timer, and the category/difficulty picker are identical.
- **عدد مخفی** (`src/games/hiddenNumber/`) is a structurally different game — no
  words, no teams, no scoring, just a rotating "one player doesn't know a
  number" mechanic — and gets its own folder rather than forcing it into the
  word-guessing shape.

When adding a game, match it to whichever of these two shapes it's actually
closer to (see "Adding a new game" below) rather than always reaching for a new
folder or always reusing `wordGuessing`.

## Stack

- **Astro 7**, no `@astrojs/preact` integration — the home page is plain Astro,
  and each game page (`src/pages/<game>.astro`) mounts its Preact app directly
  with `preact.render()` in an inline `<script>` (see
  `src/pages/pantomime.astro` and `src/pages/dor.astro`), skipping Astro's
  islands runtime entirely. This mirrors `chooser`'s pattern, not `split-bill`'s
  `client:load` islands.
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

**If it's another word-guessing variant** (like دور was added alongside پانتومیم
— same teams/scoring/timer/picker, different real-world instruction for how to
convey the word): you don't need a new folder at all.

1. Add an entry to `src/games/registry.ts` (`slug`, `title`, `description`).
2. Add `src/pages/<slug>.astro`, copying `dor.astro` and changing the
   `config: { title, instructions }` passed to `WordGuessingApp`.

That's the entire diff — `src/games/wordGuessing/` and `src/words.json` are
shared as-is.

**If it's a genuinely different game mechanic** (see `hiddenNumber` for an
example — no words, no teams, no scoring):

1. Add an entry to `src/games/registry.ts`.
2. Create `src/games/<slug>/` for the game's own components, types, and any
   content or scoring logic. Don't assume you need a full team/difficulty/
   scoring setup — `hiddenNumber` only persists a player-name list, which is
   plenty when that's all the game needs.
3. Add `src/pages/<slug>.astro`, following the direct-render pattern (mount with
   `preact.render()` in an inline `<script>`, skipping Astro islands).
4. If the game needs persisted settings, add a `src/state/<slug>State.ts` module
   with the same shape (signals + exported mutation helpers + a `localStorage`
   `effect()`) — `wordGameState.ts` for the fuller team/mode/difficulty/score
   version, `hiddenNumberState.ts` for the minimal name-list-only version.

## Word-guessing engine (`src/games/wordGuessing/`) — پانتومیم & دور

Teams take turns getting one team member to convey a word to their team, which
guesses it; a correct guess is worth the word's difficulty in points (easy=1,
medium=2, hard=3 — see `DIFFICULTIES` in `words.ts`), and skipping costs the
same amount, so skipping a hard word is riskier than skipping an easy one. Play
continues round-robin across teams until a team reaches the configured target
score. **How** the word must be conveyed is the only thing that differs between
games, and it's entirely a config string — see "Per-game config" below.

There are two turn-structure modes, chosen on the setup screen (`gameMode` in
`wordGameState.ts`):

- **`"timed"`** (default) — the player filters by difficulty once at setup; each
  turn is a fixed-length round (`roundSeconds`) cycling through many words from
  a shuffled deck.
- **`"selection"`** — no timer and no setup-time difficulty filter. Each turn,
  the current team sees **all categories and all three difficulties on one
  screen** (`CategoryPickerScreen`), picks one of each, is shown exactly one
  word for that combination, resolves it (بلد شد / رد کن), and play immediately
  passes to the next team. Modeled after a category-charades reference app the
  user showed screenshots of, but collapsed to a single picker screen instead of
  two sequential ones.

Both modes share teams, scoring, and the target-score win condition;
`TeamSetupScreen` shows/hides mode-specific fields (round length and difficulty
filter only appear for `"timed"`) via `isTimed`.

### Per-game config

`GameConfig` (`types.ts`) is just `{ title, instructions }`. Each game page
(`pantomime.astro`, `dor.astro`) mounts the same `WordGuessingApp` with its own
config literal inline in the page's `<script>` — there's no registry mapping
slug → config; the `.astro` file _is_ the config. `instructions` is shown once
on `TeamSetupScreen`, under the title:

- پانتومیم: "بدون حرف زدن، فقط با اشاره و حرکت، کلمه رو نشون بده تا تیمت حدس
  بزنه."
- دور: "کلمه رو با حرف زدن توضیح بده، بدون اینکه خود کلمه یا هم‌خانواده‌هاش رو
  بگی، تا تیمت حدس بزنه."

Everything else — teams, difficulty/target-score settings, the category picker,
the timer, the بلد شد/رد کن buttons, results — is identical between games, which
is exactly why this is config rather than a second copy of the engine.

- **`src/words.json`** — the word bank content, and the only file you need to
  touch to add/remove/re-tag words or add a whole new category. Shared by every
  word-guessing game. Shape:
  `{ categories: [{id, label}], words: [{text, category, difficulty}] }`. In
  `"timed"` mode `category` is just a grouping for your own editing sanity; in
  `"selection"` mode it's what the player actually picks from, using
  `categories[].label` for the button text. `difficulty` is
  `"easy" | "medium" | "hard"` and drives scoring in both modes. Lives at the
  `src/` root (not under `games/wordGuessing/`) since it's fetched as a
  standalone asset, not bundled JS — see the loading model below. Currently ~475
  words across 11 categories (movies/TV, cartoons, proverbs, professions,
  actions, animals, objects, celebrities, sports, food, places).
- **Loading model**: `words.json` is _not_ statically imported (that would
  inline ~500 words into the JS bundle). `src/games/wordGuessing/words.ts`
  imports it as `import wordsUrl from "../../words.json?url"`, which makes Vite
  emit it as its own hashed asset and gives back its URL. `words.ts` then
  `fetch(wordsUrl)`s it lazily via `loadWordBank()` (memoized promise, resolving
  `{ words, categories }` together), kicked off eagerly the moment the module
  evaluates. Each game page imports the same `?url` value and passes it to
  `Layout`'s `preloadJsonHref` prop, which renders
  `<link rel=preload as=fetch crossorigin=anonymous>` in `<head>` — so the
  browser starts downloading the JSON the instant the HTML is parsed, in
  parallel with the JS bundle, well before the player finishes team setup. The
  `crossorigin` attribute is required even though the resource is same-origin:
  without it the preloaded request and the later `fetch()` don't share a cache
  entry and the browser downloads it twice. (Verified in both dev and a
  production build that this results in exactly one network request, for both
  `/pantomime` and `/dor`.) `words.ts` also defines the fixed (code-level, not
  content) `DIFFICULTIES` metadata: Farsi label + point value per tier.
- **`src/state/wordGameState.ts`** — persisted _settings only_, shared by every
  word-guessing game (switching from پانتومیم to دور in the same session keeps
  your teams and settings — deliberate, not an oversight): team names,
  `gameMode`, selected difficulties (timed mode), round length, target score.
  Signals + exported mutators (`addTeam`, `removeTeam`, `renameTeam`,
  `setGameMode`, `toggleDifficulty`, `setRoundSeconds`, `setTargetScore`);
  persisted to `localStorage` under `vaje-games-word-guessing-settings` via an
  `effect()`. On load, any stored difficulty ids or an invalid `gameMode` fall
  back to defaults. Live game progress (scores, deck, current phase) is **not**
  persisted — a refresh mid-game drops back to setup with the previous settings
  prefilled, intentionally, to avoid the complexity of serializing in-flight
  game state.
- **`src/games/wordGuessing/scoring.ts`** — `buildDeck(words, difficulties)`
  (timed mode: shuffle words matching the difficulty filter, all categories
  included), `pickOne(words, category, difficulty, seen)` (selection mode: one
  random word for an exact category+difficulty, avoiding ids in `seen` until
  that combination is exhausted this game), `pointsForWord()` (difficulty →
  points), `applyScoreDelta()` (score change, clamped at 0), `findWinner()`.
- **`src/games/wordGuessing/WordGuessingApp.tsx`** (`{ config: GameConfig }`) —
  the orchestrator. Holds all ephemeral game state (`allWords`, `categories`,
  `phase`, `teams`, `currentTeamIndex`, `deck`, `seenWordIds`, `currentWord`,
  `timeLeft`, `roundStats`) in `useState`/`useEffect` (not signals — this is
  single-component, high-churn state, same rationale as `chooser`'s
  `ChooserApp.tsx`). Calls `loadWordBank()` on mount. Renders one of five
  screens based on `phase`, branching on
  `isSelectionMode = gameMode.value === "selection"`:
  - `setup` → `TeamSetupScreen` (receives `title`/`instructions` from `config`
    and `wordsReady={allWords !== null}`, which disables/relabels the start
    button until the fetch resolves — in practice near-instant thanks to the
    preload, but still handled honestly since it's genuinely async)
  - `ready`, timed → `ReadyScreen` (pass-the-phone prompt, then `startRound()`
    starts the timer and draws from `deck`)
  - `ready`, selection → `CategoryPickerScreen` (`onPick(category, difficulty)`
    calls `pickWordForTurn`, which draws via `pickOne` and jumps straight to
    `playing` — no separate "ready" tap needed)
  - `playing` → `RoundScreen` (word + بلد شد / رد کن; `timeLeft` prop is omitted
    in selection mode, which hides the timer display entirely)
  - `roundEnd` (timed only) → `ResultsScreen` (`mode="round"`, per-round stats +
    running scoreboard, advances to the next team or to `gameOver`). Selection
    mode has no equivalent screen: `gotIt`/`skip` call
    `advanceAfterSelectionTurn` directly after scoring, which checks the win
    condition and moves straight to the next team's picker (or `gameOver`) with
    no interstitial — matches the fast "see word, play, done, next player" loop
    the mode is for.
  - `gameOver` → `ResultsScreen` (`mode="gameOver"`, winner + final scoreboard,
    replay or back to setup)
- **Timed-mode deck mechanics**: `deck` holds words not yet guessed correctly
  _this game_. "بلد شد" removes the word permanently; "رد کن" moves it to the
  back of the deck (it can resurface later the same game). If the deck empties
  mid-game, `nextWord()` reshuffles a fresh deck from `allWords` filtered by the
  selected difficulties, rather than ending the game.
- **Synchronous score check**: `updateCurrentTeamScore()` returns the current
  team's new score value directly (via a variable assigned inside the `setTeams`
  updater) rather than making the caller re-read `teams` state afterwards —
  `teams` wouldn't reflect the update yet within the same event handler.
  Selection mode's immediate win-check (`advanceAfterSelectionTurn`) depends on
  this; timed mode's `continueAfterRound` doesn't need it since it runs from a
  later, separate click after state has settled.
- **`RoundScreen`** shows a small colored badge (green/amber/red for
  easy/medium/hard) with the word's point value, so players know the stakes
  before deciding whether to skip.

## عدد مخفی (`src/games/hiddenNumber/`)

Not a word game — no `words.json`, no teams, no scoring. Each round one player
(rotating round-robin, `currentIndex` into `players`) is "it" and must guess a
number 1–100 that everyone else can see. The number is shown **alone, once**;
after that, the group cycles through as many spectrum-style prompts as they want
(e.g. "اگه {n} نفر تو خیابون باشن، چقدر نگران می‌شی؟") — always with the number
blanked out — reacting to each so the guesser can pick up clues from the
discussion without anyone stating the number. Purely conversational: there's no
captured guess and no win condition, just assign → show the number → cycle
questions → reveal-the-answer → next player.

- **`src/games/hiddenNumber/questions.json`** — `{ questions: string[] }`, each
  a template containing the literal token `{n}` (e.g.
  `"اگه {n} نفر تو خیابون باشن، چقدر نگران می‌شی؟"`). Unlike `words.json` this
  is small enough (~45 short strings) to statically import rather than fetch —
  no preload dance needed here, that optimization is only worth it for the
  ~500-entry word bank.
- **`src/games/hiddenNumber/logic.ts`** — `questionText(template)` always
  substitutes `{n}` → `"؟"`; the raw number-filled form of a template is never
  rendered anywhere, by design (the number only ever appears alone, on
  `ShowNumberScreen`). `randomNumber()` draws 1–100; `freshQuestionDeck()`
  shuffles all templates so they don't repeat until exhausted — same no-repeat
  pattern as the word-guessing decks, and reused for **both** "start of round"
  and "سوال بعدی" draws, since both just want "the next not-yet-seen question."
- **`src/state/hiddenNumberState.ts`** — persisted player _names_ only
  (`playerNames`, `MIN_PLAYERS = 3`), under `vaje-games-hidden-number-settings`.
  No difficulty/mode/score settings exist for this game.
- **`src/games/hiddenNumber/HiddenNumberApp.tsx`** — the orchestrator.
  `Phase = "setup" | "handoff" | "showNumber" | "discuss" | "result"`:
  - `setup` → `PlayerSetupScreen` (name list, no mode/settings)
  - `handoff` → `HandoffScreen`: "پاس بده به یکی غیر از {guesser}" — the point
    where the phone physically changes hands
  - `showNumber` → `ShowNumberScreen`: shown to whoever is holding the phone
    (not the guesser) — **just** the number, big, plus a "don't show this to
    {guesser}" warning. No question here.
  - `discuss` → `DiscussScreen`: now safe to show the guesser too — one question
    at a time via `questionText()` (number always blanked); "سوال بعدی" calls
    `nextQuestion()` to swap in another one from the same game-long deck without
    touching `number`; "حدس زد، عدد رو نشون بده" moves to `result`
  - `result` → `ResultScreen`: reveals the real number, "نفر بعد" advances
    `currentIndex` round-robin, draws a new number _and_ the next question, and
    loops back to `handoff` — indefinitely, until "پایان بازی" returns to
    `setup`

## Conventions

- Co-locate `Component.tsx` with `Component.module.css`.
- Import paths use the `src/` baseUrl alias for top-level dirs; relative paths
  within a feature folder.
- Signals are read via `.value` in components; never destructured.
- Everything is Farsi/RTL — don't add English UI strings without a reason.
