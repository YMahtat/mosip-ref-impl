import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserHamburgerComponent} from './user-hamburger-menu/user-hamburger-menu.component';
import {NgMaterialDesignImportsModule} from '../ng-material-design-imports/ng-material-design-imports.module';
import {TopNavComponent} from './top-nav/top-nav.component';
import {SideNavComponent} from './side-nav/side-nav.component';
import {MainContainerComponent} from './main-container/main-container.component';
import {AppRoutingModule} from '../app-routing.module';
import {NgxWebstorageModule} from 'ngx-webstorage';


@NgModule({
    declarations: [
        TopNavComponent,
        SideNavComponent,
        UserHamburgerComponent,
        MainContainerComponent
    ],
    exports: [
        TopNavComponent,
        SideNavComponent
    ],
    imports: [
        CommonModule,
        NgMaterialDesignImportsModule,
        AppRoutingModule,
        NgxWebstorageModule.forRoot(),
    ]
})
export class LayoutsComponentsModule {
}
