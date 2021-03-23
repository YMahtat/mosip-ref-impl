import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MispsComponent} from './misps.component';
import {AppRoutingModule} from '../../app-routing.module';
import {MispsViewComponent} from './misps-view/misps-view.component';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {MispSingleViewComponent} from './misp-single-view/misp-single-view.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
    declarations: [
        MispsComponent,
        MispsViewComponent,
        MispSingleViewComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class MispsModule {
}
