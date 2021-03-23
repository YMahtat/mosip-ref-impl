import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../assets/i18n';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import {AuthUserDetailsEmitterService} from '../../shared/emitters/auth-user-details-emitter.service';

@Component({
    selector: 'app-top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

    @Output() toggleSideNavBarBtnOutputEmitter = new EventEmitter<any>();

    primaryLanguageCode: string;
    zone: string | undefined | null;
    userData: any;
    topNavLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private authUserDetailsEmitterService: AuthUserDetailsEmitterService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setTopNavLabels(this.primaryLanguageCode);
        this.zone = 'COUNTRY NOT SET YET';
        this.userData = {
            type: 'profile',
            profileImg: 'data:image/jpeg;base64,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',

        };
        this.authUserDetailsEmitterService.getCurrentAuthUserDetailsObservable().subscribe(userDetails => {
            this.zone = (userDetails.getZone()) ? userDetails.getZone() : 'UNDEFINED';
        });
    }

    onClickToggleSideNavBarBtnHandler(): void {
        this.toggleSideNavBarBtnOutputEmitter.emit();
    }

    private setTopNavLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.topNavLabels = response['top-nav'];
    }

}
