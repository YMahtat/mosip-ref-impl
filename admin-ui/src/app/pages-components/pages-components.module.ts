import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeModule} from './home/home.module';
import {MispsModule} from './misps/misps.module';
import {AuthPartnersModule} from './auth-partners/auth-partners.module';
import {PartnersRequestsModule} from './partners-requests/partners-requests.module';
import {CentersModule} from './centers/centers.module';
import {MachinesModule} from './machines/machines.module';
import {DevicesModule} from './devices/devices.module';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HomeModule,
        CentersModule,
        MachinesModule,
        DevicesModule,
        MispsModule,
        AuthPartnersModule,
        PartnersRequestsModule
    ]
})
export class PagesComponentsModule {
}
