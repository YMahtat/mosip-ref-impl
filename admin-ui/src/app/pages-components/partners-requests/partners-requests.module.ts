import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PartnersRequestsComponent} from './partners-requests.component';
import {AppRoutingModule} from '../../app-routing.module';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {PartnersRequestsViewComponent} from './partners-requests-view/partners-requests-view.component';
import {PartnerRequestSingleViewComponent} from './partner-request-single-view/partner-request-single-view.component';


@NgModule({
    declarations: [
        PartnersRequestsComponent,
        PartnersRequestsViewComponent,
        PartnerRequestSingleViewComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class PartnersRequestsModule {
}
