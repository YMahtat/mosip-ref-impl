import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppRoutingModule} from '../../app-routing.module';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {CentersComponent} from './centers.component';
import {CentersViewComponent} from './centers-view/centers-view.component';
import {CenterSingleViewComponent} from './center-single-view/center-single-view.component';


@NgModule({
    declarations: [
        CentersComponent,
        CentersViewComponent,
        CenterSingleViewComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class CentersModule {
}
