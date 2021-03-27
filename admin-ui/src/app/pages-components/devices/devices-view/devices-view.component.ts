import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {DeviceClientService} from '../../../shared/rest-api-client-services/device-client.service';
import {AppPopUpDialogUtilityService} from '../../../shared/utilities/app-pop-up-dialog-utility.service';

@Component({
    selector: 'app-devices-view',
    templateUrl: './devices-view.component.html',
    styleUrls: ['./devices-view.component.scss']
})
export class DevicesViewComponent implements OnInit, AfterViewInit {

    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | undefined;

    primaryLanguageCode: string;
    devicesViewLabels: any;
    devicesDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
    devicesDisplayedColumns: string[] = ['name', 'deviceTypeName', 'macAddress', 'serialNum', 'mapStatus', 'isActive', 'createdDateTime'];

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private deviceClientService: DeviceClientService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService,
        private router: Router
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setDevicesViewLabels(this.primaryLanguageCode);
        // @ts-ignore
        this.paginator._intl.itemsPerPageLabel = this.devicesViewLabels['items-per-page-label'];
        this.devicesDataSource.data = [];
        this.setDevicesDataSource(0);
    }

    ngAfterViewInit(): void {
        // @ts-ignore
        this.devicesDataSource.paginator = this.paginator;
    }

    onChangeFilterValueHandler(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.devicesDataSource.filter = filterValue.trim().toLowerCase();
    }

    onClickCreateNewDeviceBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}/${ROUTES.SUB_ROUTES.CREATE}`]);
    }


    onClickViewDeviceBtnHandler(deviceId: string): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}/${ROUTES.SUB_ROUTES.VIEW}/${deviceId}`]);
    }

    private setDevicesViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.devicesViewLabels = response.devices['manage-devices'];
    }

    private setDevicesDataSource(pageNumber: number): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        this.deviceClientService.getDevices(this.primaryLanguageCode, pageNumber).subscribe(
            (devicesResponse) => {
                const devicesResponseContent = (devicesResponse && devicesResponse.response) ? devicesResponse.response : {};
                pageNumber++;
                const resultsSize = (devicesResponseContent.totalRecord) ? devicesResponseContent.totalRecord : undefined;
                const devices = (devicesResponseContent.data) ? [...devicesResponseContent.data] : [];
                this.devicesDataSource.data = [...this.devicesDataSource.data, ...devices];
                if (resultsSize && devices && this.devicesDataSource.data.length < resultsSize) {
                    this.setDevicesDataSource(pageNumber);
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
