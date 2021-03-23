import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './pages-components/home/home.component';
import {MainContainerComponent} from './layouts-components/main-container/main-container.component';
import {MispsComponent} from './pages-components/misps/misps.component';
import {ROUTES} from './app.constants';
import {MispsViewComponent} from './pages-components/misps/misps-view/misps-view.component';
import {AuthPartnersComponent} from './pages-components/auth-partners/auth-partners.component';
import {AuthPartnersViewComponent} from './pages-components/auth-partners/auth-partners-view/auth-partners-view.component';
import {MispSingleViewComponent} from './pages-components/misps/misp-single-view/misp-single-view.component';
import {CentersComponent} from './pages-components/centers/centers.component';
import {CentersViewComponent} from './pages-components/centers/centers-view/centers-view.component';
import {CenterSingleViewComponent} from './pages-components/centers/center-single-view/center-single-view.component';
import {MachinesComponent} from './pages-components/machines/machines.component';
import {MachinesViewComponent} from './pages-components/machines/machines-view/machines-view.component';
import {MachineSingleViewComponent} from './pages-components/machines/machine-single-view/machine-single-view.component';
import {DevicesComponent} from './pages-components/devices/devices.component';
import {DevicesViewComponent} from './pages-components/devices/devices-view/devices-view.component';
import {DeviceSingleViewComponent} from './pages-components/devices/device-single-view/device-single-view.component';
import {AuthPartnerSingleViewComponent} from './pages-components/auth-partners/auth-partner-single-view/auth-partner-single-view.component';
import {PartnersRequestsComponent} from './pages-components/partners-requests/partners-requests.component';
import {PartnersRequestsViewComponent} from './pages-components/partners-requests/partners-requests-view/partners-requests-view.component';
import {PartnerRequestSingleViewComponent} from './pages-components/partners-requests/partner-request-single-view/partner-request-single-view.component';

const routes: Routes = [
    {path: '', redirectTo: `fra/${ROUTES.HOME}`, pathMatch: 'full'},
    {
        path: ':primaryLang',
        component: MainContainerComponent,
        children: [
            {path: '', pathMatch: 'full', redirectTo: '/'},
            {path: ROUTES.HOME, component: HomeComponent},
            {
                path: ROUTES.CENTERS,
                component: CentersComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: CentersViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: CenterSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: CenterSingleViewComponent}
                ]
            },
            {
                path: ROUTES.MACHINES,
                component: MachinesComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: MachinesViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: MachineSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: MachineSingleViewComponent}
                ]
            },
            {
                path: ROUTES.DEVICES,
                component: DevicesComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: DevicesViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: DeviceSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: DeviceSingleViewComponent}
                ]
            },
            {
                path: ROUTES.MISPS,
                component: MispsComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: MispsViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: MispSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: MispSingleViewComponent}
                ]
            },
            {
                path: ROUTES.AUTH_PARTNERS,
                component: AuthPartnersComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: AuthPartnersViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: AuthPartnerSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: AuthPartnerSingleViewComponent}
                ]
            },
            {
                path: ROUTES.PARTNERS_REQUESTS,
                component: PartnersRequestsComponent,
                children: [
                    {path: '', pathMatch: 'full', redirectTo: ROUTES.SUB_ROUTES.VIEW_ALL},
                    {path: ROUTES.SUB_ROUTES.VIEW_ALL, component: PartnersRequestsViewComponent},
                    {path: ROUTES.SUB_ROUTES.CREATE, component: PartnerRequestSingleViewComponent},
                    {path: `${ROUTES.SUB_ROUTES.VIEW}/:id`, component: PartnerRequestSingleViewComponent}
                ]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
