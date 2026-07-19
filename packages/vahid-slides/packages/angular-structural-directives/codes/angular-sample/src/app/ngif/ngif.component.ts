import { Component } from '@angular/core';

@Component({
    selector: 'app-ngif',
    templateUrl: './ngif.component.html',
    styleUrls: ['./ngif.component.sass'],
})
export class NgifComponent {
    isLoggedIn = false;

    bigObject = {
        deep: {
            data: {
                userInfo: {
                    name: 'Vahid',
                },
            },
        },
    };
}
