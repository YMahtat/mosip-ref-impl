import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule} from 'ngx7-material-keyboard';

import {DemographicRoutingModule} from './demographic-routing.module';
import {SharedModule} from 'src/app/shared/shared.module';
import {DemographicComponent} from './demographic/demographic.component';

const customLayouts: IKeyboardLayouts = {
    ...keyboardLayouts,

};

/**
 * @description This is the feature module for the demographic module.
 * @author Shashank Agrawal
 *
 * @export
 * @class DemographicModule
 */
@NgModule({
    declarations: [DemographicComponent],
    imports: [CommonModule, DemographicRoutingModule, ReactiveFormsModule, SharedModule, MatKeyboardModule],
    providers: [
        {provide: MAT_KEYBOARD_LAYOUTS, useValue: customLayouts}
    ],
})
export class DemographicModule {
}
