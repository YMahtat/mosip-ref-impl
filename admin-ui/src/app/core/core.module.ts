import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CookieService} from 'ngx-cookie-service';
import {AppInitializationService} from './services/app-initialization.service';
import {NgMaterialDesignImportsModule} from '../ng-material-design-imports/ng-material-design-imports.module';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        NgMaterialDesignImportsModule
    ],
    providers: [
        CookieService,
        AppInitializationService
    ]
})
export class CoreModule {
}
