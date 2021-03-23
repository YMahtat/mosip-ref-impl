import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../../assets/i18n';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {AuthPartnerClientService} from '../../../shared/rest-api-client-services/auth-partner-client.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';

@Component({
    selector: 'app-auth-partners-view',
    templateUrl: './auth-partners-view.component.html',
    styleUrls: ['./auth-partners-view.component.scss']
})
export class AuthPartnersViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    authPartersViewLabels: any;
    authPartersDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    authPartersDisplayedColumns: string[] = [
        'partnerID', 'organizationName', 'partnerType', 'emailId', 'address', 'contactNumber', 'status'
    ];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private authPartnerClientService: AuthPartnerClientService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setAuthPartnersViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.authPartersViewLabels['items-per-page-label'];
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        this.authPartnerClientService.getRegistrationAuthPartnersDetails().subscribe(
            (authPartersResponse) => {
                const authParterns = (authPartersResponse && authPartersResponse.response) ? authPartersResponse.response.partners : [];
                this.authPartersDataSource.data = [...authParterns];
            },
            () => {
            },
            () => {
                appLoadingMatDialogRef.close();
            }
        );
    }

    ngAfterViewInit(): void {
        // @ts-ignore
        this.authPartersDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.authPartersDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewAuthPatrnerBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }

    onClickViewAuthPartnerBtnHandler(authPartnerId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}/${ROUTES.SUB_ROUTES.VIEW}/${authPartnerId}`]);
    }

    private setAuthPartnersViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.authPartersViewLabels = response['auth-partners']['manage-auth-partners'];
    }

}
