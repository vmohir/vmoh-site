import { Directive } from '@angular/core';

@Directive({
    selector: '[appTest]',
    exportAs: 'appTest',
})
export class TestDirective {
    setTrue() {}
    setFalse() {}

    constructor() {}
}
