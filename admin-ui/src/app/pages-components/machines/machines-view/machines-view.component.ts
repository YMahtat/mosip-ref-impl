import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {MachineClientService} from '../../../shared/rest-api-client-services/machine-client.service';
import {AppPopUpDialogUtilityService} from '../../../shared/utilities/app-pop-up-dialog-utility.service';

@Component({
    selector: 'app-machines-view',
    templateUrl: './machines-view.component.html',
    styleUrls: ['./machines-view.component.scss']
})
export class MachinesViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    machinesViewLabels: any;
    machinesDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    machinesDisplayedColumns: string[] = ['name', 'machineTypeName', 'macAddress', 'serialNum', 'mapStatus', 'isActive', 'createdDateTime'];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private machineClientService: MachineClientService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMachinesViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.machinesViewLabels['items-per-page-label'];
        this.machinesDataSource.data = [];
        this.setMachinesDataSource(0);
    }

    ngAfterViewInit(): void {
        // @ts-ignore
        this.machinesDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.machinesDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewMachineBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }


    onClickViewMachineBtnHandler(machineId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}/${ROUTES.SUB_ROUTES.VIEW}/${machineId}`]);
    }

    private setMachinesViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.machinesViewLabels = response.machines['manage-machines'];
    }

    private setMachinesDataSource(pageNumber: number): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        this.machineClientService.getMachines(this.primaryLanguageCode, pageNumber).subscribe(
            (machinesResponse) => {
                const machinesResponseContent = (machinesResponse && machinesResponse.response) ? machinesResponse.response : {};
                pageNumber++;
                const resultsSize = (machinesResponseContent.totalRecord) ? machinesResponseContent.totalRecord : undefined;
                const machines = (machinesResponseContent.data) ? [...machinesResponseContent.data] : [];
                this.machinesDataSource.data = [...this.machinesDataSource.data, ...machines];
                if (resultsSize && machines && this.machinesDataSource.data.length < resultsSize) {
                    this.setMachinesDataSource(pageNumber);
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
