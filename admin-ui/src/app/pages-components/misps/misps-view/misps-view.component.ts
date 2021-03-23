import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../../assets/i18n';
import {MispClientService} from '../../../shared/rest-api-client-services/misp-client.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';

@Component({
    selector: 'app-misps-view',
    templateUrl: './misps-view.component.html',
    styleUrls: ['./misps-view.component.scss']
})
export class MispsViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    mispsViewLabels: any;
    mispsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    mispsDisplayedColumns: string[] = ['id', 'name', 'userID', 'emailId', 'address', 'contactNumber', 'isActive', 'status_code'];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private mispClientService: MispClientService,
        private matDialog: MatDialog,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMispsViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.mispsViewLabels['items-per-page-label'];
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        this.mispClientService.getRegistrationMISPsDetails().subscribe(
            (mispsResponse) => {
                const misps = mispsResponse.response.map((r: { misp: any; }) => r.misp);
                this.mispsDataSource.data = (mispsResponse && mispsResponse.response) ? [...misps] : [];
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
        this.mispsDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.mispsDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewMispBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }


    onClickViewMispBtnHandler(mispId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}/${ROUTES.SUB_ROUTES.VIEW}/${mispId}`]);
    }

    private setMispsViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.mispsViewLabels = response.misps['manage-misps'];
    }

}
