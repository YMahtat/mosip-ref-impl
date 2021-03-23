import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MachinesComponent} from './machines.component';
import {MachinesViewComponent} from './machines-view/machines-view.component';
import {AppRoutingModule} from '../../app-routing.module';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {MachineSingleViewComponent} from './machine-single-view/machine-single-view.component';


@NgModule({
    declarations: [
        MachinesComponent,
        MachinesViewComponent,
        MachineSingleViewComponent
    ],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class MachinesModule {
}
