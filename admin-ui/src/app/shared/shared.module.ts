import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MispClientService} from './rest-api-client-services/misp-client.service';
import {HttpClientModule} from '@angular/common/http';
import {AppLoadingComponent} from './components/app-loading/app-loading.component';
import {NgMaterialDesignImportsModule} from '../ng-material-design-imports/ng-material-design-imports.module';
import {RnpSectionHeaderComponent} from './components/rnp-section-header/rnp-section-header.component';
import {CenterClientService} from './rest-api-client-services/center-client.service';
import {AuthPartnerClientService} from './rest-api-client-services/auth-partner-client.service';
import {AuthUserDetailsEmitterService} from './emitters/auth-user-details-emitter.service';
import {AuthUserClientService} from './rest-api-client-services/auth-user-client.service';
import {DeviceClientService} from './rest-api-client-services/device-client.service';
import {MachineClientService} from './rest-api-client-services/machine-client.service';
import {MasterdataClientService} from './rest-api-client-services/masterdata-client.service';
import {AppLanguageStorageService} from './storage-services/app-language-storage.service';


@NgModule({
    declarations: [
        AppLoadingComponent,
        RnpSectionHeaderComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        NgMaterialDesignImportsModule
    ],
    exports: [
        RnpSectionHeaderComponent
    ],
    providers: [
        AuthUserDetailsEmitterService,
        AuthPartnerClientService,
        AuthUserClientService,
        CenterClientService,
        DeviceClientService,
        MachineClientService,
        MasterdataClientService,
        MispClientService,
        AuthPartnerClientService,
        AppLanguageStorageService
    ]
})
export class SharedModule {
}
