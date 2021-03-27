import {Component, OnInit} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    primaryLanguageCode: string;
    homeLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setHomeLabels(this.primaryLanguageCode);
    }

    private setHomeLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.homeLabels = response['home'];
    }

}
