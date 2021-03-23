import {Component, OnInit} from '@angular/core';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-auth-partners',
    templateUrl: './auth-partners.component.html',
    styleUrls: ['./auth-partners.component.scss']
})
export class AuthPartnersComponent implements OnInit {

    primaryLanguageCode: string;
    authPartnersLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setAuthPartnersLabels(this.primaryLanguageCode);
    }

    private setAuthPartnersLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.authPartnersLabels = response['auth-partners'];
    }

}
