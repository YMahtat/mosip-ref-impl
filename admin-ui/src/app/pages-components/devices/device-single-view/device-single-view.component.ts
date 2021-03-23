import {Component, OnInit} from '@angular/core';
import {CenterDropdown} from '../../../shared/models/center-dropdown.model';
import {FormControl, FormGroup} from '@angular/forms';
import {MasterdataClientService} from '../../../shared/rest-api-client-services/masterdata-client.service';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {FilterValuesModel} from '../../../shared/models/filter-values.model';
import {OptionalFilterValuesModel} from '../../../shared/models/optional-filter-values.model';
import {FilterRequest} from '../../../shared/models/filter-request.model';
import {RequestModel} from '../../../shared/models/request.model';
import {DeviceClientService} from '../../../shared/rest-api-client-services/device-client.service';
import {TimeUtilityService} from '../../../shared/utilities/time-utility.service';
import {DeviceDto} from '../../../shared/models/device-dto.model';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';

@Component({
    selector: 'app-device-single-view',
    templateUrl: './device-single-view.component.html',
    styleUrls: ['./device-single-view.component.scss']
})
export class DeviceSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    deviceSingleViewLabels: any;

    deviceIdParam: string | undefined;

    dropDownValues = new CenterDropdown();
    deviceSingleViewFormGroup = new FormGroup({
        deviceId: new FormControl('', []),
        name: new FormControl('', []),
        serialNum: new FormControl('', []),
        macAddress: new FormControl('', []),
        ipAddress: new FormControl('', []),
        validity: new FormControl('', []),
        zoneAdministrative: new FormControl('', []),
        deviceSpecId: new FormControl('', []),
        center: new FormControl('', []),
        isActive: new FormControl('', [])
    });
    private deviceDataSource: any;

    constructor(
        private deviceClientService: DeviceClientService,
        private masterdataClientService: MasterdataClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get deviceSingleViewFormGroupControls(): any {
        return this.deviceSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setDeviceSingleViewLabels(this.primaryLanguageCode);
        this.setZoneAdministrativeDropdownValues();
        this.setDeviceSpecificationsDropdownValue();
        this.activatedRoute.params.subscribe(params => {
            this.deviceIdParam = params && params.id;
            if (this.deviceIdParam) {
                this.setDeviceSingleViewFormGroupControlsValuesWithViewData();
            }
        });
    }

    onClickSubmitBtnHandler(): void {
        if (this.deviceSingleViewFormGroup.valid) {
            if (!this.deviceIdParam) {
                this.createNewDevice();
            } else {
                this.updateDevice();
            }
        } else {
            console.table(this.deviceSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}`]);
    }

    getDeviceSingleViewTitleLabel(): string {
        return (this.deviceIdParam) ? this.deviceSingleViewLabels['update-title'] : this.deviceSingleViewLabels['create-title'];
    }

    private setDeviceSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.deviceSingleViewLabels = response.devices['device-single-view'];
    }

    private setZoneAdministrativeDropdownValues(): void {
        this.masterdataClientService.getZone(this.primaryLanguageCode).subscribe(response => {
            console.log(response);
            this.dropDownValues.zone.primary = response.response;
            if (this.dropDownValues.zone.primary.length === 1) {
                this.deviceSingleViewFormGroup.controls.zoneAdministrative.setValue(
                    this.dropDownValues.zone.primary[0].code
                );
                this.deviceSingleViewFormGroup.controls.zoneAdministrative.disable();
            }
        });
    }

    private setDeviceSpecificationsDropdownValue(): void {
        const filterObject = new FilterValuesModel('name', 'unique', '');
        const optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
        const filterRequest = new FilterRequest([filterObject], this.primaryLanguageCode, [optinalFilterObject]);
        const request = new RequestModel('', null, filterRequest);
        this.masterdataClientService.getFilteredMaterDataTypes('devicespecifications', request).subscribe(response => {
            this.dropDownValues.deviceTypeCode.primary = response.response.filters;
        });
    }

    private setDeviceSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.deviceIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.deviceClientService.getDevices(this.primaryLanguageCode, 0, this.deviceIdParam).subscribe(
                (deviceResponse) => {
                    const reponseContent = (deviceResponse && deviceResponse.response) ? deviceResponse.response : {};
                    this.deviceDataSource = (reponseContent.data && reponseContent.data.length > 0) ? reponseContent.data[0] : {};
                    this.deviceSingleViewFormGroup.controls.deviceId.setValue(this.deviceIdParam);
                    this.deviceSingleViewFormGroup.controls.name.setValue(this.deviceDataSource.name);
                    this.deviceSingleViewFormGroup.controls.serialNum.setValue(this.deviceDataSource.serialNum);
                    this.deviceSingleViewFormGroup.controls.macAddress.setValue(this.deviceDataSource.macAddress);
                    this.deviceSingleViewFormGroup.controls.ipAddress.setValue(this.deviceDataSource.ipAddress);
                    this.deviceSingleViewFormGroup.controls.validity.setValue(
                        TimeUtilityService.formatDate(this.deviceDataSource.validityDateTime)
                    );
                    this.deviceSingleViewFormGroup.controls.isActive.setValue(this.deviceDataSource.isActive);
                    this.deviceSingleViewFormGroup.controls.zoneAdministrative.setValue(this.deviceDataSource.zoneCode);
                    this.deviceSingleViewFormGroup.controls.center.setValue(this.deviceDataSource.regCenterId);
                    this.deviceSingleViewFormGroup.controls.deviceSpecId.setValue(this.deviceDataSource.deviceSpecId);
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewDevice(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const deviceToCreate = new DeviceDto(
            this.deviceSingleViewFormGroup.controls.zoneAdministrative.value,
            null, // TODO @Youssef : à rectifier !,
            this.deviceSingleViewFormGroup.controls.name.value,
            this.deviceSingleViewFormGroup.controls.macAddress.value,
            this.deviceSingleViewFormGroup.controls.serialNum.value,
            this.deviceSingleViewFormGroup.controls.ipAddress.value,
            this.primaryLanguageCode,
            this.deviceSingleViewFormGroup.controls.deviceSpecId.value,
            '',
            this.deviceSingleViewFormGroup.controls.isActive.value,
        );
        this.deviceClientService.createDevice(deviceToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}`]);
                } else {
                    alert('error !');
                }
            },
            () => {
            },
            () => {
                appLoadingMatDialogRef.close();
            }
        );
    }

    private updateDevice(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const deviceToUpdate = new DeviceDto(
            this.deviceSingleViewFormGroup.controls.zoneAdministrative.value,
            null, // TODO @Youssef : à rectifier !,
            this.deviceSingleViewFormGroup.controls.name.value,
            this.deviceSingleViewFormGroup.controls.macAddress.value,
            this.deviceSingleViewFormGroup.controls.serialNum.value,
            this.deviceSingleViewFormGroup.controls.ipAddress.value,
            this.primaryLanguageCode,
            this.deviceSingleViewFormGroup.controls.deviceSpecId.value,
            this.deviceDataSource.id,
            this.deviceSingleViewFormGroup.controls.isActive.value,
        );
        console.table(deviceToUpdate);
        this.deviceClientService.updateDevice(deviceToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.DEVICES}`]);
                } else {
                    alert('error !');
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
