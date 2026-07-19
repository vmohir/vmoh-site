class: center, middle

## Angular Wrapping Up

_By: Vahid Mohammadi_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

<div class="doc-link">
    <a href="https://scotch.io/tutorials/angular-2-classes-with-ngclass-and-ngstyle">NgClass & NgStyle</a>
</div>

### NgClass

- `class` & `[class]`
- `[class.{className}]`
- `[ngClass]`
  - string
    - ternary operator
  - array of strings
  - object: `{ [string]: boolean }`

### NgStyle

- `style` & `[style]`
- `[style.{cssProperty}.{Unit}]`
  - Unit can be any of CSS Units: `px`, `%`, `em`, etc.
- `[ngStyle]`
  - object: `{ [{cssProperty}.{Unit}]: {value} }`

---

<div class="doc-link">
    <a href="https://medium.com/claritydesignsystem/four-ways-of-listening-to-dom-events-in-angular-part-2-hostlistener-1b66d45b3e3d">@HostListener</a>
    <a href="https://alligator.io/angular/hostbinding-hostlistener/">@HostBinding</a>
    <a href="https://medium.com/claritydesignsystem/angular-pseudo-events-d4e7f89247ee">Angular Pseudo Events</a>
    <a href="https://medium.com/@tomsu/typescript-tips-tricks-c8fdef998d50#73d6">Typescript Html Dom Types</a>
    <a href="https://angular.io/guide/attribute-directives">Angular Directives</a>
    <a href="https://angular.io/guide/component-styles#special-selectors">Special CSS Selectors</a>
    <a href="https://angular.io/guide/attribute-directives#pass-values-into-the-directive-with-an-input-data-binding">Directive Inputs</a>
    <a href="https://angular.io/guide/pipes">Angular Pipes</a>
</div>

### DOM Manipulation

- `@HostListener`
  - Angular pseudo-events
- `@HostBinding`
- `ElementRef<T>` & `TemplateRef<T>`
  - `HTML{WHATEVER}Element` types
- Try not to work manipulate DOM with pure JS
- CSS `host` and `host-context` selectors
- `@Input` & `@Output`

### Directives

- Creating custom directives
- `selector`
- `exportAs`

### Pipes

- Built-in pipes
- Creating custom pipes

---

<div class="doc-link">
    <a href="https://stackoverflow.com/questions/130794/what-is-dependency-injection">Dependency Injection</a>
    <a href="https://codecraft.tv/courses/angular/dependency-injection-and-providers/injectors/">Injector</a>
    <a href="https://stackoverflow.com/a/43695820/1889607">Module Injector</a>
    <a href="https://codecraft.tv/courses/angular/dependency-injection-and-providers/providers/">Providers</a>
    <a href="https://codecraft.tv/courses/angular/dependency-injection-and-providers/tokens/">InjectionToken</a>
    <a href="https://angular.io/guide/dependency-injection-providers#tree-shakable-providers">Tree-shakable Providers</a>
    <a href="https://angular.io/api/core/Inject">@Inject</a>
    <a href="https://angular.io/api/core/Optional">@Optional</a>
    <a href="https://codecraft.tv/courses/angular/dependency-injection-and-providers/ngmodule-providers-vs-component-providers-vs-component-viewproviders/#_component_providers">Component providers & viewProviders</a>
</div>

## Dependency Injection & Providers

- Dependency Injection
- Injector
  - Getting a Module Injector
- Provider
  - InjectionToken
  - Factory & Provider Depenedencies
- Injectable
- Services
- `@Inject` & `@Optional`
- `Component.providers` & `Component.viewProviders`

---

<div class="doc-link">
    <a href="https://angular.io/guide/workspace-config#project-configuration-options">App Prefix</a>
    <a href="https://angular.io/guide/workspace-config#style-preprocessor-options/">Style Preprocessor Options</a>
    <a href="https://angular.io/guide/workspace-config#complex-configuration-values">Assets, Styles, Scripts</a>
    <a href="https://medium.com/angular-in-depth/overriding-angular-schematics-322aeb11bfb0">Schematics</a>
    <a href="https://medium.com/angular-in-depth/becoming-an-angular-environmentalist-45a48f7c20d8">Environments</a>
</div>

### Angular Configurations

- angular.json configurations
  - assets, styles, scripts
  - stylePreprocessorOptions
  - schematics
  - prefix
  - environments

### Project Architecture

See project documentations [here](https://www.notion.so/Angular-Project-1f579a2de93a4853b90e96ce108e37a4)
