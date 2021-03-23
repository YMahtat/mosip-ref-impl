import {Component, OnInit} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import LanguageFactory from '../../../assets/i18n';

@Component({
    selector: 'app-centers',
    templateUrl: './centers.component.html',
    styleUrls: ['./centers.component.scss']
})
export class CentersComponent implements OnInit {

    primaryLanguageCode: string;
    centersLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setCentersLabels(this.primaryLanguageCode);
    }

    private setCentersLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.centersLabels = response.centers;
    }

}
