import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgforComponent } from './ngfor/ngfor.component';
import { NgifComponent } from './ngif/ngif.component';
import { NgcontainerComponent } from './ngcontainer/ngcontainer.component';
import { NgcontentComponent } from './ngcontent/ngcontent.component';

const routes: Routes = [
    { path: 'ngfor', component: NgforComponent },
    { path: 'ngif', component: NgifComponent },
    { path: 'ngcontainer', component: NgcontainerComponent },
    { path: 'ngcontent', component: NgcontentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
