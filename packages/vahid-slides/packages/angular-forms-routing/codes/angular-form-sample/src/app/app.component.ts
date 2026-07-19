import { Component } from '@angular/core';
import { FormBuilder, Validators, FormArray } from '@angular/forms';

type FormType = {
    username: string;
    sites: string[];
    financialInfo: {
        financialId: string;
    };
};

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    constructor(private formBuilder: FormBuilder) {}

    userInfoForm = this.formBuilder.group<FormType>({
        username: [, [Validators.required]],
        sites: this.formBuilder.array([]),
        financialInfo: this.formBuilder.group<FormType['financialInfo']>({ financialId: [''] }),
    });

    x() {
        // this.userInfoForm.get('username')
        // this.userInfoForm.get('sites')
        // (this.userInfoForm.get('sites') as FormArray<string[]>).push(this.formBuilder.control(undefined));
    }
    test(event) {
        console.log('TCL: AppComponent -> test -> event', event);
        this.userInfoForm.reset();
    }
}
