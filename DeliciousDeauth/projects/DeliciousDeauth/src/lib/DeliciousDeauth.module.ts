import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeliciousDeauthComponent } from './components/DeliciousDeauth.component';
import { RouterModule, Routes } from '@angular/router';

import {MaterialModule} from './modules/material/material.module';
import {FlexLayoutModule} from '@angular/flex-layout';

import {FormsModule} from '@angular/forms';

const routes: Routes = [
    { path: '', component: DeliciousDeauthComponent }
];

@NgModule({
    declarations: [DeliciousDeauthComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MaterialModule,
        FlexLayoutModule,
        FormsModule,
    ],
    exports: [DeliciousDeauthComponent]
})
export class DeliciousDeauthModule { }
