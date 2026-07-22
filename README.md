# vmoh-site

Personal site and small apps for Vahid Mohammadi, as a pnpm workspace. Each package deploys as its own Netlify site.

| Package                       | Site               |
| ------------------------------ | ------------------ |
| `packages/homepage`             | vmoh.ir            |
| `packages/split-bill`           | split.vmoh.ir      |
| `packages/chooser`              | chooser.vmoh.ir    |
| `packages/vaje-games`           | vaje.vmoh.ir       |
| `packages/slides`               | slides.vmoh.ir     |
| `packages/old-homepage`         | legacy homepage    |

## Develop

```bash
pnpm install
pnpm --filter <package-name> dev
```

## Build

```bash
pnpm build:homepage
pnpm build:split-bill
pnpm build:chooser
pnpm build:vaje-games
pnpm build:slides
```
