import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthPartnersComponent} from './auth-partners.component';
import {AppRoutingModule} from '../../app-routing.module';
import {AuthPartnersViewComponent} from './auth-partners-view/auth-partners-view.component';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {AuthPartnerSingleViewComponent} from './auth-partner-single-view/auth-partner-single-view.component';


@NgModule({
    declarations: [
        AuthPartnersComponent,
        AuthPartnersViewComponent,
        AuthPartnerSingleViewComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class AuthPartnersModule {
}
