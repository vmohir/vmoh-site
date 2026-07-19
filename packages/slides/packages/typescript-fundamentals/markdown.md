class: center, middle

## Typescript Fundamentals

_Sample code is available in `codes/javascript-code-samples.js`_

_By: Vahid Mohammadi_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

<div class="doc-link">
    <a href="https://devdocs.io/javascript/">DevDocs JavaScript</a>
    <a href="https://devhints.io/es6">ES6 Docs</a>
</div>

## Some JavaScript Tips

- Don't use `var`. Use `const` or `let` instead
- Use array methods: `forEach`, `map`, `reduce`, `filter`, `slice`, `find`, `findIndex`, `includes`, `some`, `every`
- Mutation
- Use backticks
- Use destructing

---

## Getting Started With Typescript

<div class="doc-link">
    <a href="http://www.typescriptlang.org/docs/handbook/tsconfig-json.html">Tsconfig Docs</a>
    <a href="http://www.typescriptlang.org/docs/handbook/compiler-options.html">CompilerOptions Docs</a>
</div>

Things to note:

- `npm i typescript` and `tsc` command
- Configuration: `tsconfig.json`
  - `files`, `include`, `exclude`
  - `extends`
  - CompilerOptions:
    - `baseUrl`
    - `paths`
    - `strict` flags
    - `noUnusedLocals`
    - `noUnusedParameters`

---

## Basic Types

<div class="doc-link">
    <a href="http://www.typescriptlang.org/docs/handbook/basic-types.html">Basic Types Docs</a>
    <a href="http://www.typescriptlang.org/docs/handbook/interfaces.html">Interfaces Docs</a>
</div>

- `boolean`, `number`, `string`
- `any`, `never`, `void`
- `null`, `undefined`
- array, [Interface](http://www.typescriptlang.org/docs/handbook/interfaces.html)
- [Index signature](http://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types)
- [Functions](http://www.typescriptlang.org/docs/handbook/interfaces.html#function-types)
- Casting
- [Enums](http://www.typescriptlang.org/docs/handbook/enums.html)
- Unions

---

## Generics

<div class="doc-link">
    <a href="http://www.typescriptlang.org/docs/handbook/generics.html">Generics Docs</a>
</div>

- Makes types, interfaces, functions and class generic
- default type: `function func<T = string>(arg: T): T {}`
- `extends` type: `function func<T extends any[]>(arg: T) {}`

---

## TSLint & ESLint

<div class="doc-link">
    <a href="https://palantir.github.io/tslint/">TSLint</a>
    <a href="https://eslint.org">ESLint</a>
    <a href="https://medium.com/palantir/tslint-in-2019-1a144c2317a9">TSLint in 2019</a>
    <a href="https://palantir.github.io/tslint/rules/">TSLint Rules</a>
    <a href="https://eslint.org/docs/rules/">ESLint Rules</a>
    <a href="http://codelyzer.com/">Codelyzer</a>
</div>

- `tslint.json` and `.eslintrc` configuration files
- IDE extentions: Install eslint and tslint extension
- Codelyzer
