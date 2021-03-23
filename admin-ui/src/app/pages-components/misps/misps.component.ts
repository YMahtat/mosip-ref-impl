import {Component, OnInit} from '@angular/core';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-misps',
    templateUrl: './misps.component.html',
    styleUrls: ['./misps.component.scss']
})
export class MispsComponent implements OnInit {

    primaryLanguageCode: string;
    mispsLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMispsLabels(this.primaryLanguageCode);
    }

    private setMispsLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.mispsLabels = response.misps;
    }

}
