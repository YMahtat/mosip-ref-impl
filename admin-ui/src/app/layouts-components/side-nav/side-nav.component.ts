import {Component, OnInit} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../assets/i18n';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../app.constants';
import {Router} from '@angular/router';

@Component({
    selector: 'app-side-nav',
    templateUrl: './side-nav.component.html',
    styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit {

    primaryLanguageCode: string;
    sideNavLabels: any;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setSideNavLabels(this.primaryLanguageCode);
    }

    onClickNavigateTHomeHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.HOME}`]);
    }

    onClickNavigateToCentersServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}`]);
    }

    onClickNavigateToMachinesServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}`]);
    }

    onClickNavigateToDevicesServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}`]);
    }

    onClickNavigateToMispsServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}`]);
    }

    onClickNavigateToAuthPartnersServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}`]);
    }

    onClickNavigateToRequestsServicesHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}`]);
    }

    private setSideNavLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.sideNavLabels = response['side-nav'];
    }

}
