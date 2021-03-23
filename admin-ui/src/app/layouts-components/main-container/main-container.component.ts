import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';

@Component({
    selector: 'app-main-container',
    templateUrl: './main-container.component.html',
    styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {

    primaryLanguageCode: string;

    constructor(
        private route: ActivatedRoute,
        private appLanguageStorageService: AppLanguageStorageService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.getPrimaryLangCodeFromRoutingParam();
        this.appLanguageStorageService.setAppPrimaryLanguageCode(this.primaryLanguageCode);
    }

    toggleSideNavBarBtnOutputEmitterHandler($event: any, drawer: any): void {
        drawer.toggle();
    }

    private getPrimaryLangCodeFromRoutingParam(): string {
        if (this.route.snapshot.paramMap.get('primaryLang')) {
            return String(this.route.snapshot.paramMap.get('primaryLang'));
        } else {
            return DEFAULT_PRIMARY_LANGUAGE_CODE;
        }
    }

}
