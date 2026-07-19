import { Component, ContentChildren, QueryList, ContentChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-ngcontentchild',
    templateUrl: './ngcontentchild.component.html',
    styleUrls: ['./ngcontentchild.component.scss'],
})
export class NgcontentchildComponent {
    @ContentChildren('[ngc-footer]') wefklj: QueryList<HTMLElement>;
}
