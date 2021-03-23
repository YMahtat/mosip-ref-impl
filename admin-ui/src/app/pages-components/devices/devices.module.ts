import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DevicesComponent} from './devices.component';
import {AppRoutingModule} from '../../app-routing.module';
import {NgMaterialDesignImportsModule} from '../../ng-material-design-imports/ng-material-design-imports.module';
import {ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {DevicesViewComponent} from './devices-view/devices-view.component';
import {DeviceSingleViewComponent} from './device-single-view/device-single-view.component';


@NgModule({
    declarations: [DevicesComponent, DevicesViewComponent, DeviceSingleViewComponent],
    imports: [
        CommonModule,
        AppRoutingModule,
        NgMaterialDesignImportsModule,
        ReactiveFormsModule,
        SharedModule
    ]
})
export class DevicesModule {
}
