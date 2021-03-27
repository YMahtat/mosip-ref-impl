import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {CenterClientService} from '../../../shared/rest-api-client-services/center-client.service';
import {AppPopUpDialogUtilityService} from '../../../shared/utilities/app-pop-up-dialog-utility.service';

@Component({
    selector: 'app-centers-view',
    templateUrl: './centers-view.component.html',
    styleUrls: ['./centers-view.component.scss']
})
export class CentersViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    centersViewLabels: any;
    centersDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    centersDisplayedColumns: string[] = [
        'name', 'centerTypeName',
        'users', 'devices', 'machines',
        'contactPerson', 'contactPhone',
        'isActive', 'createdDateTime'
    ];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private centerClientService: CenterClientService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setCentersViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.centersViewLabels['items-per-page-label'];
        this.centersDataSource.data = [];
        this.setCentersDataSource(0);
    }

    ngAfterViewInit(): void {
        // @ts-ignore
        this.centersDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.centersDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewCenterBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }


    onClickViewCenterBtnHandler(centerId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}/${ROUTES.SUB_ROUTES.VIEW}/${centerId}`]);
    }

    private setCentersViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.centersViewLabels = response.centers['manage-centers'];
    }

    private setCentersDataSource(pageNumber: number): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        this.centerClientService.getRegistrationCentersDetails(this.primaryLanguageCode, pageNumber).subscribe(
            (centersResponse) => {
                const centersResponseContent = (centersResponse && centersResponse.response) ? centersResponse.response : {};
                pageNumber++;
                const resultsSize = (centersResponseContent.totalRecord) ? centersResponseContent.totalRecord : undefined;
                const centers = (centersResponseContent.data) ? [...centersResponseContent.data] : [];
                this.centersDataSource.data = [...this.centersDataSource.data, ...centers];
                if (resultsSize && centers && this.centersDataSource.data.length < resultsSize) {
                    this.setCentersDataSource(pageNumber);
                }
            },
            () => {
            },
            () => {
                appLoadingMatDialogRef.close();
            }
        );
    }

}
