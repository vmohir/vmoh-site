import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TabOneComponent } from './tab-one/tab-one.component';
import { TabTwoComponent } from './tab-two/tab-two.component';

@Component({
    selector: 'app-ngcontainer',
    templateUrl: './ngcontainer.component.html',
})
export class NgcontainerComponent {
    arr: { id: string; value: string }[] = [{ id: 'id1', value: 'val1' }, { id: 'id2', value: 'val2' }];
    tabs = [{ title: 'tab1', content: 'content of tab 1' }, { title: 'tab2', content: 'content of tab 2' }];
    tabComponents = [{ title: 'tab1', component: TabOneComponent }, { title: 'tab2', component: TabTwoComponent }];

    @ViewChild('reuseTemplate') reuseTemplate: TemplateRef<any>;
}
