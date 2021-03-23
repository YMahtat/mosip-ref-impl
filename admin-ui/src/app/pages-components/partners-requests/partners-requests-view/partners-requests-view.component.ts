import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {PartnerRequestClientService} from '../../../shared/rest-api-client-services/partner-request-client.service';
import {MatDialog} from '@angular/material/dialog';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';

@Component({
    selector: 'app-partners-requests-view',
    templateUrl: './partners-requests-view.component.html',
    styleUrls: ['./partners-requests-view.component.scss']
})
export class PartnersRequestsViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    requestsViewLabels: any;
    requestsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    requestsDisplayedColumns: string[] = [
        'apiKeyReqNo', 'partnerID', 'organizationName', 'policyName', 'policyDesc', 'status'
    ];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private partnerRequestClientService: PartnerRequestClientService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setRequestsViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.requestsViewLabels['items-per-page-label'];
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        this.partnerRequestClientService.getRegistrationRequestsDetails().subscribe(
            (requestsResponse) => {
                const requests = (requestsResponse && requestsResponse.response && requestsResponse.response.apikeyRequests) ?
                    requestsResponse.response.apikeyRequests : [];
                this.requestsDataSource.data = [...requests];
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
        this.requestsDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.requestsDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewRequestBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }

    onClickViewRequestBtnHandler(requestId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}/${ROUTES.SUB_ROUTES.VIEW}/${requestId}`]);
    }

    private setRequestsViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.requestsViewLabels = response['partners-requests']['manage-partners-requests'];
    }

}
