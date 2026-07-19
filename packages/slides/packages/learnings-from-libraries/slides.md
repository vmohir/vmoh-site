---
# try also 'default' to start simple
theme: default
# some information about your slides (markdown enabled)
title: Creating NPM libraries key takeaways
# apply UnoCSS classes to the current slide
layout: intro
class: text-center
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
# duration of the presentation
duration: 10min
transition: slide-left
hideInToc: true
---

# Understanding Node as a Frontend Engineer

---
layout: two-cols
layoutClass: gap-16
hideInToc: true
---

## We use Node daily

TypeScript, Vite, Jest, ESLint, Prettier, etc.

It's important to Understand the differences between Node and browser
environments.

<v-click>

```
my-package/
├── src/
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

</v-click>

<v-click>

```json
{
  "file": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

</v-click>

::right::

### **Table of Contents**

<br>

<Toc text-md minDepth="1" maxDepth="1" listClass="my-toc" />

---
layout: intro
---

# Node vs Browser

---
layout: two-cols-header
layoutClass: gap-8
transition: slide-up
---

::left::

## Browser

<br>

The environment is the browser which is dynamic and unknown.

Access to Window, Document, DOM, Fetch API, etc.

::right::

## Node

<br>

The environment uses the Node runtime. A fixed Node version is used (unless
creating libraries).

Access to File System, Path, HTTP modules, etc.

---
layout: two-cols-header
layoutClass: gap-8
transition: slide-up
---

::left::

## Browser

<br>

````md magic-move
```html
<script src="./script.js" />
```

```html
<script src="./script.js" type="module" />
```
````

````md magic-move
```js
var script = document.createElement("script");
script.src = "module.js";
document.head.appendChild(script);
```

```js
import "./module.js";
```
````

::right::

## Node

<br>

````md magic-move
```js
$ node ./script.cjs

// let everything = require('./module.cjs');
```

```js
$ node ./script.mjs

// import { one } from './module.js';
```

```js
$ node ./script.js // with {"type": "module"}
```

```js
$ node ./script.js // with {"type": "module"}

// Otherwise node determines the module type
// based on its content and gives a warning
```

```js
$ node ./script.ts // supports erasable TypeScript
```
````

---
layout: two-cols-header
layoutClass: gap-8
---

::left::

## Browser

Different browsers and versions.

Widely available baseline: features supported by core browsers (Chrome, Firefox,
Safari, Edge)<br>for 30 months.

::right::

## Node

Versions:
[nodejs.org/en/about/previous-releases](https://nodejs.org/en/about/previous-releases)

Even-numbered releases (20, 22, 24, etc.) are moved to Active LTS and critical
bugs are fixed<br>for 30 months.

---
layout: intro
---

# Creating NPM Libraries

---

## Choose What to Bundle Carefully

````md magic-move
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
```

```ts
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.peerDependencies || {}),
        ...Object.keys(packageJson.dependencies || {}),
      ],
    },
  },
});
```

```ts
import { builtinModules } from "module";
import packageJson from "./package.json" with { type: "json" };

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.peerDependencies || {}),
        ...Object.keys(packageJson.dependencies || {}),
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
  },
});
```
````

---

## Provide type definitions

Prefer a single `.d.ts` file

- Faster Type Checking
- Smaller package size

Tools:

- `vite-plugin-dts`
- API Extractor: More advanced
- `tsc --declaration`

---
layout: two-cols-header
layoutClass: gap-8
---

## Provide both ESM and CJS builds if needed

::left::

vite.config.ts

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: [
        {
          entryFileNames: "[name].js",
          format: "es",
          exports: "named",
        },
        {
          entryFileNames: "[name].cjs",
          format: "cjs",
          exports: "named",
          interop: "compat",
        },
      ],
    },
  },
});
```

::right::

package.json

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "require": "./dist/index.cjs",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  }
}
```

---

## Vite is getting better with tsdown

https://vite.dev/guide/rolldown

https://www.youtube.com/watch?v=w3OkbgK5s68

<Youtube id="w3OkbgK5s68" />
