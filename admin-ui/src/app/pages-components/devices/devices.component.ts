import {Component, OnInit} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-devices',
    templateUrl: './devices.component.html',
    styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit {

    primaryLanguageCode: string;
    devicesLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setDevicessLabels(this.primaryLanguageCode);
    }

    private setDevicessLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.devicesLabels = response.devices;
    }

}
