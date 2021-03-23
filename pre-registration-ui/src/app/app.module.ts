import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {NgxPrintModule} from 'ngx-print';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {AppConfigService} from './app-config.service';
import {BookingService} from './feature/booking/booking.service';

import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {AuthModule} from './auth/auth.module';
import {SharedModule} from './shared/shared.module';
import {ConfigService} from 'src/app/core/services/config.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import {MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from "@angular/material-moment-adapter";


const appInitialization = (appConfig: AppConfigService) => {
    return () => {
        return appConfig.loadAppConfig();
    };
};

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CoreModule,
        AuthModule,
        SharedModule,
        NgxPrintModule
    ],
    providers: [
        BookingService,
        AppConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitialization,
            multi: true,
            deps: [AppConfigService]
        },
        {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
    config: ConfigService;
}
