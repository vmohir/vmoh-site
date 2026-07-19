import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgforComponent } from './ngfor/ngfor.component';
import { NgifComponent } from './ngif/ngif.component';
import { NgcontainerComponent } from './ngcontainer/ngcontainer.component';
import { TabOneComponent } from './ngcontainer/tab-one/tab-one.component';
import { TabTwoComponent } from './ngcontainer/tab-two/tab-two.component';
import { NgcontentComponent } from './ngcontent/ngcontent.component';
import { NgcontentchildComponent } from './ngcontent/ngcontentchild/ngcontentchild.component';
import { TestDirective } from './test.directive';

@NgModule({
    declarations: [AppComponent, NgforComponent, NgifComponent, NgcontainerComponent, TabOneComponent, TabTwoComponent, NgcontentComponent, NgcontentchildComponent, TestDirective],
    entryComponents: [TabOneComponent, TabTwoComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
