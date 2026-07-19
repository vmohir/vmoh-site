# Vahid's Slide Presentations

This is a monorepo containing all of Vahid's slide presentations built with [Slidev](https://sli.dev/).

## Structure

This repository uses pnpm workspaces to manage multiple slide decks:

```
vahid-slides/
├── packages/
│   └── learnings-from-libraries/    # First slide deck
└── package.json                      # Workspace root
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Installation

```bash
pnpm install
```

### Development

Run any slide deck in development mode:

```bash
# Run the default slide deck
pnpm dev

# Or run a specific deck
pnpm dev:learnings
```

Visit <http://localhost:3030> to view the slides.

### Building

```bash
# Build the default slide deck
pnpm build

# Or build a specific deck
pnpm build:learnings
```

## Adding a New Slide Deck

1. Create a new package directory:
   ```bash
   mkdir -p packages/your-new-deck
   ```

2. Initialize the package with a `package.json`:
   ```json
   {
     "name": "your-new-deck",
     "type": "module",
     "private": true,
     "scripts": {
       "build": "slidev build",
       "dev": "slidev --open",
       "export": "slidev export"
     },
     "dependencies": {
       "@slidev/cli": "^52.9.1",
       "@slidev/theme-default": "latest",
       "vue": "^3.5.24"
     }
   }
   ```

3. Create your `slides.md` file in the new package directory

4. Add convenience scripts to the root `package.json`:
   ```json
   "scripts": {
     "dev:your-deck": "pnpm --filter your-new-deck dev",
     "build:your-deck": "pnpm --filter your-new-deck build"
   }
   ```

5. Install dependencies:
   ```bash
   pnpm install
   ```

## Available Slide Decks

- **learnings-from-libraries**: Learnings from creating libraries

## Learn More

- [Slidev Documentation](https://sli.dev/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
