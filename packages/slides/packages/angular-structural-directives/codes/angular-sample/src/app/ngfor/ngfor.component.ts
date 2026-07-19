import { Component } from '@angular/core';

@Component({
    selector: 'app-ngfor',
    templateUrl: './ngfor.component.html',
    styleUrls: ['./ngfor.component.sass'],
})
export class NgforComponent {
    arr: { id: string; value: string }[] = [{ id: 'id1', value: 'val1' }, { id: 'id2', value: 'val2' }];

    trackByFunc(index: number, item: { id: string; value: string }) {
        return item.id;
    }

    changeArr() {
        this.arr = [{ ...this.arr[0], value: 'new Value' }, { ...this.arr[1] }];
    }
}
