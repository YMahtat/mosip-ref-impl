import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule} from './core/core.module';
import {NgMaterialDesignImportsModule} from './ng-material-design-imports/ng-material-design-imports.module';
import {LayoutsComponentsModule} from './layouts-components/layouts-components.module';
import {PagesComponentsModule} from './pages-components/pages-components.module';
import {SharedModule} from './shared/shared.module';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ResponseHttpInterceptor} from './core/interceptors/response-http.interceptor';
import {CookieService} from 'ngx-cookie-service';
import {AppInitializationService} from './core/services/app-initialization.service';

const appInitialization = (appInitializationService: AppInitializationService) => {
    return () => {
        return appInitializationService.loadInitialization();
    };
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        CoreModule,
        LayoutsComponentsModule,
        PagesComponentsModule,
        SharedModule,
        NgMaterialDesignImportsModule
    ],
    providers: [
        CookieService,
        AppInitializationService,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitialization,
            multi: true,
            deps: [AppInitializationService]
        },
        {provide: HTTP_INTERCEPTORS, useClass: ResponseHttpInterceptor, multi: true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
