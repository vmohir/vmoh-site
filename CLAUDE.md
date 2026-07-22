# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`vmoh-site` is a pnpm workspace containing several independent, unrelated
apps for Vahid Mohammadi. There is no shared runtime code between packages —
each one is built, deployed, and versioned independently. The only thing
tying them together is this repo and the root `pnpm-workspace.yaml`.

| Package             | Site               | Stack                                    |
| -------------------- | ------------------- | ----------------------------------------- |
| `packages/homepage`   | vmoh.ir              | Static HTML, no build tool                |
| `packages/split-bill` | split.vmoh.ir        | Astro + Preact (see its own `CLAUDE.md`)  |
| `packages/chooser`    | chooser.vmoh.ir      | Astro + Preact PWA (see its own `CLAUDE.md`) |
| `packages/vaje-games` | vaje.vmoh.ir         | Astro + Preact, Farsi word games (see its own `CLAUDE.md`) |
| `packages/slides`     | slides.vmoh.ir       | Nested pnpm workspace of Slidev decks     |
| `packages/old-homepage` | legacy homepage build | Old webpack/React 15 stack, excluded from the pnpm workspace |

`packages/split-bill/CLAUDE.md`, `packages/chooser/CLAUDE.md`, and
`packages/vaje-games/CLAUDE.md` have detailed architecture notes for those
apps — read the relevant one before working in that directory.

## Deployment model

Each package is deployed as its **own, separate Netlify site**, not as one
combined build. Every deployable package has its own `netlify.toml` with an
`ignore` command (`git diff --quiet ... -- packages/<name> ...`) so Netlify
skips rebuilding a site when a commit doesn't touch its files. When adding or
moving files for one app, don't assume it affects another site's deploy.

The root `netlify.toml` builds only `homepage` + `old-homepage` into `dist/`;
`split-bill`, `chooser`, `vaje-games`, and `slides` are entirely separate
Netlify projects that happen to live in this repo.

## Commands

Install once at the repo root:

```bash
pnpm install
```

Run a single package in dev mode:

```bash
pnpm --filter <package-name> dev   # package names: @vmoh-site/homepage, splitted, chooser-online, vaje-games
cd packages/slides && pnpm dev     # slides is its own nested workspace
```

Build (from repo root, matches CI and Netlify):

```bash
pnpm run build              # homepage + old-homepage -> dist/
pnpm run build:split-bill
pnpm run build:chooser
pnpm run build:vaje-games
pnpm run build:slides
```

Format check (split-bill, chooser, and vaje-games only):

```bash
pnpm --filter splitted format:check
pnpm --filter chooser-online format:check
pnpm --filter vaje-games format:check
```

CI (`.github/workflows/ci.yml`) runs `pnpm install --frozen-lockfile`, all
five builds above, and all three format checks, on every push/PR to
`master`.

## Package notes

- **homepage**: a single `index.html` with inline CSS, no build step beyond
  `cp index.html ../../dist/`. Keep it dependency-free.
- **old-homepage**: legacy site, intentionally excluded from the pnpm
  workspace (`pnpm-workspace.yaml` has `!packages/old-homepage`) and built
  with `npm`, not `pnpm`, via its own `package.json`. Treat as frozen/legacy;
  don't migrate it onto the shared toolchain without being asked.
- **slides**: a *nested* pnpm workspace (its own `pnpm-workspace.yaml`,
  lockfile, and `packages/*` of individual Slidev decks). Each deck is a
  separate package built with `slidev build --base /packages/<deck>/ --out
  ../../dist/packages/<deck>`; the root `slides` build runs `pnpm -r
  --workspace-concurrency=1 build` to build every deck sequentially into one
  combined `dist/`.
- **split-bill**, **chooser**, and **vaje-games**: Astro + Preact + Tailwind
  v4 apps that share the same conventions (signals-based state, CSS Modules
  co-located with components). See their package-level `CLAUDE.md` files for
  domain models, state architecture, and folder layout — don't duplicate that
  detail here.

## Formatting

Root `prettier.config.mjs` sets `proseWrap: "always"` and applies repo-wide.
`split-bill`, `chooser`, and `vaje-games` each have their own `format:write` /
`format:check` scripts; `slides` uses `oxlint` in addition to Prettier.
