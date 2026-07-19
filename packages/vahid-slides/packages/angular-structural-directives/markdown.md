class: center, middle

## Angular Structural Directives

_By: Vahid Mohammadi_

_Sample code is available in `angular-sample/src/app`_

<div class="fz-14">
    <i>Created with: <a href="https://github.com/gnab/remark">RemarkJS</a></i>
</div>

---

<div class="doc-link">
    <a href="https://malcoded.com/posts/angular-ngfor/">*ngFor Everything</a>
    <a href="https://angular.io/api/common/NgForOf">Angular Docs</a>
    <a href="https://angular.io/api/common/KeyValuePipe">keyvalue Pipe Docs</a>
</div>

## \*ngFor

Get `index`, `first`, `last`, `even`, `odd` of current element

### When are changes propagated to the DOM?

- When an element is added to the array
- When an element is removed from the array
- When items are reordered

### Optimizing \*ngFor

By default ngFor is optimized by array elements reference, But sometimes we have immutable data.

> Use `trackBy`

### Use objects in \*ngFor

You can use `keyvalue` pipe

---

## \*ngIf

<div class="doc-link">
    <a href="https://ultimatecourses.com/blog/angular-ngif-else-then">*ngIf Everything</a>
    <a href="https://alligator.io/angular/ngif-new-features-angular4/">*ngIf Other Features</a>
    <a href="https://angular.io/guide/template-syntax#the-safe-navigation-operator----and-null-property-paths">Safe Navigation</a>
</div>

- Try not to call functions!
  - Performance
  - It may not detect changes
- `else` and `then else`
- Create scoped variables with `*ngIf`
- `*ngIf` vs `[hidden]`: \*ngIf is for null check but [hidden] is not. You can also use `?.` and `!.` in Angular template files

---

## ng-template and ng-container

<div class="doc-link">
    <a href="https://blog.angular-university.io/angular-ng-template-ng-container-ngtemplateoutlet/">ng-container ng-template Everything</a>
    <a href="https://medium.com/@symposia/dynamic-component-rendering-in-angular-5-with-ngcomponentoutlet-410bec3ece75">Dynamic Components</a>
    <a href="https://blog.angular-university.io/angular-ng-content/">ng-content Everything</a>
    <a href="https://medium.com/@tkssharma/understanding-viewchildren-viewchild-contentchildren-and-contentchild-b16c9e0358e">View & Content Children</a>
    <a href="https://netbasal.com/angular-2-take-advantage-of-the-exportas-property-81374ce24d26">Directive exportAs</a>
</div>

- use `*` directives without creating an element (ex. `<tr>`)
- use multiple `*` directives
- display `ng-templates`
- dispaly dynamic components
  - How can we have `@Input()`s? [Use custom injectors](https://stackoverflow.com/questions/42056828/pass-an-input-value-into-a-ngcomponentoutlet-created-component)

> Being “virtual” means the <ng-template> contents won’t actually exist in the compiled DOM

### ng-content

- selector can be `tag`, `[attribute]` or `.css-class`

### View & Content Children

- `@ViewChild()` and `@ViewChildren()`
- `@ContentChild()` and `@ContentChildren()`

### Directives exportAs

You can export directives to a `#template`
