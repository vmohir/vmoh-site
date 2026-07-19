class: center, middle

## Angular Forms

_By: Vahid Mohammadi_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

<div class="doc-link">
    <a href="https://angular.io/guide/reactive-forms">Reactive forms doc</a>
    <a href="https://angular.io/guide/reactive-forms#generating-form-controls-with-formbuilder">FormBuilder</a>
    <a href="https://angular.io/guide/reactive-forms#creating-nested-form-groups">Nested Form Groups</a>
    <a href="https://angular.io/guide/reactive-forms#dynamic-controls-using-form-arrays">Form Arrays</a>
</div>

## Basics

-   `FromControl`, `FormGroup`, `FormArray`, `AbstractControl`
-   `FormBuilder`
-   `[formGroup]`, `[formControl]`
-   `formControlName`, `fromGroupName`, `formArrayName`

---

## Validation

<div class="doc-link">
    <a href="https://angular.io/api/forms/Validators">Built-in Validators</a>
    <a href="https://angular.io/guide/form-validation#custom-validators">Custom Validators</a>
    <a href="https://angular.io/guide/form-validation#cross-field-validation">Form Group Validators</a>
</div>

-   Angular built-in `Validators`
-   Custom Validators
-   Form Group Validators
-   `updateOn`
    -   Use `updateOn` in FormGroup and FormArray to apply to all child FormControls

---

## Submiting and Resetting Form

<div class="doc-link">
    <a href="https://stackoverflow.com/a/48217303/1889607">FormGroupDirective</a>
</div>

-   `<button>` type attribute can be button, submit, reset. Default is `submit`. Change it when you don't want to submit the form
-   Don't use `(click)` on submit button
-   Resetting form
    - `formGroup.reset()` will not remove Material errors. User `FormGroupDirective.resetForm()`

---

## Material Form Controls

<div class="doc-link">
    <a href="https://material.angular.io/components/categories/forms">Material Form Controls</a>
    <a href="https://material.angular.io/components/form-field">MatFormField</a>
</div>

Learn about Material Form Controls

### Our Simple Form Components

Use `Simple{Input|select|...}Component`s

---

class: center, middle

## Angular Routing

_By: Vahid Mohammadi_

---

## Routing

<div class="doc-link">
    <a href="https://angular.io/guide/router#router-outlet">Router Outlet</a>
    <a href="https://blog.angularindepth.com/angular-router-series-secondary-outlets-primer-139206595e2">Secondary Outlet</a>
    <a href="https://angular.io/guide/router#activated-route">ActivatedRoute</a>
    <a href="https://angular.io/guide/router#router-events">Router Events</a>
    <a href="https://angular.io/guide/router#define-a-wildcard-route">Wildcard Route</a>
    <a href="https://angular.io/api/router/Route">Route</a>
    <a href="https://angular.io/guide/router#route-parameters">Route Parameters</a>
    <a href="https://angular.io/guide/router#integrate-routing-with-your-app">AngularCli Routing Options</a>
    <a href="https://angular.io/api/router/ExtraOptions">Router Extra Options</a>
</div>

- `<router-outlet>`
    - Secondary Outlet
- ActivatedRoute
- Router Events
    - `snapshot`
- Route:
    - path:
        - Route params
        - wildcard
- AngularCli `--routing`
- Router extra options

---

## Navigation

<div class="doc-link">
    <a href="https://angular.io/api/router/RouterLink">RouterLink</a>
    <a href="https://angular.io/api/router/RouterLinkActive">RouterLinkActive</a>
    <a href="https://angular.io/api/router/Router#navigate">Router.navigate()</a>
    <a href="https://angular.io/guide/router#relative-navigation">Relative Navigation</a>
    <a href="https://angular.io/api/common/Location">Location</a>
</div>

- `routerLink`, `routerLinkActive`
- `Router.navigate()`
    - `NavigationExtras`
- Relative navigation
- Location

---

## Guards

<div class="doc-link">
    <a href="https://angular.io/guide/router#milestone-5-route-guards">Route Guard Doc</a>
    <a href="https://angular.io/guide/router#milestone-6-asynchronous-routing">Lazy Loading</a>
</div>

- Angular Guards
    - CanActivate
    - CanActivateChild
    - CanDeactivate
    - Resolve
    - CanLoad
- LazyLoading