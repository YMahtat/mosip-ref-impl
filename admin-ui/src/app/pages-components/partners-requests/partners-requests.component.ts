import {Component, OnInit} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-partners-requests',
    templateUrl: './partners-requests.component.html',
    styleUrls: ['./partners-requests.component.scss']
})
export class PartnersRequestsComponent implements OnInit {

    primaryLanguageCode: string;
    requestsLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setRequestsLabels(this.primaryLanguageCode);
    }

    private setRequestsLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.requestsLabels = response['partners-requests'];
    }

}
