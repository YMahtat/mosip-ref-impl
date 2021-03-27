import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';

@Component({
    selector: 'app-auth-partner-api-keys-view',
    templateUrl: './auth-partner-api-keys-view.component.html',
    styleUrls: ['./auth-partner-api-keys-view.component.scss']
})
export class AuthPartnerApiKeysViewComponent implements OnInit, AfterViewInit {

    @Input() authPartnerSingleViewLabels: any;
    @Input() authPartnerApiKeys: Array<any> | undefined;

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    authPartnerApiKeysViewLabels: any;
    authPartnerApiKeysDatasource: MatTableDataSource<any> = new MatTableDataSource<any>();
    authPartnerApiKeysDisplayedColumns = [
        'apiKeyReqID', 'apiKeyRequestStatus', 'partnerApiKey', 'validityTill'
    ];

    constructor(
        private cdr: ChangeDetectorRef
    ) {
    }

    ngOnInit(): void {
        this.setAuthPartnerApiKeysViewLabels();
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.authPartnerApiKeysViewLabels['items-per-page-label'];
        if (this.authPartnerApiKeys) {
            this.authPartnerApiKeysDatasource.data = [...this.authPartnerApiKeys];
        }
    }

    ngAfterViewInit(): void {
        // @ts-ignore
        this.authPartnerApiKeysDatasource.paginator = this.paginator;
    }

    private setAuthPartnerApiKeysViewLabels(): void {
        this.authPartnerApiKeysViewLabels = this.authPartnerSingleViewLabels['manage-auth-partner-api-keys'];
    }

}
