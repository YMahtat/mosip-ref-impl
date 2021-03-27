import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {MachineClientService} from '../../../shared/rest-api-client-services/machine-client.service';
import {CenterDropdown} from '../../../shared/models/center-dropdown.model';
import {MasterdataClientService} from '../../../shared/rest-api-client-services/masterdata-client.service';
import {MachineDto} from '../../../shared/models/machine-dto.model';
import {FilterValuesModel} from '../../../shared/models/filter-values.model';
import {OptionalFilterValuesModel} from '../../../shared/models/optional-filter-values.model';
import {FilterRequest} from '../../../shared/models/filter-request.model';
import {RequestModel} from '../../../shared/models/request.model';
import {CenterClientService} from '../../../shared/rest-api-client-services/center-client.service';
import {AppPopUpDialogUtilityService} from '../../../shared/utilities/app-pop-up-dialog-utility.service';

@Component({
    selector: 'app-machine-single-view',
    templateUrl: './machine-single-view.component.html',
    styleUrls: ['./machine-single-view.component.scss']
})
export class MachineSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    machineSingleViewLabels: any;

    machineSingleViewFormGroup = new FormGroup({
        machineId: new FormControl('', []),
        name: new FormControl('', []),
        serialNum: new FormControl('', []),
        macAddress: new FormControl('', []),
        ipAddress: new FormControl('', []),
        center: new FormControl('', []),
        validity: new FormControl('', []),
        zoneAdministrative: new FormControl('', []),
        machineSpecId: new FormControl('', []),
        publicKey: new FormControl('', []),
        isActive: new FormControl('', [])
    });

    machineIdParam: string | undefined;
    dropDownValues = new CenterDropdown();
    machineDataSource: any;
    centersDataSource: Array<any>;

    constructor(
        private machineClientService: MachineClientService,
        private centerClientService: CenterClientService,
        private masterdataClientService: MasterdataClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
        this.centersDataSource = [];
    }

    get machineSingleViewFormGroupControls(): any {
        return this.machineSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMachineSingleViewLabels(this.primaryLanguageCode);
        this.setZoneAdministrativeDropdownValues();
        this.setMachineSpecificationsDropdownValue();
        this.setCentersDataSource(0);
        this.activatedRoute.params.subscribe(params => {
            this.machineIdParam = params && params.id;
            if (this.machineIdParam) {
                this.setMachineSingleViewFormGroupControlsValuesWithViewData();
            }
        });
    }

    onClickSubmitBtnHandler(): void {
        if (this.machineSingleViewFormGroup.valid) {
            if (!this.machineIdParam) {
                this.createNewMachine();
            } else {
                this.updateMachine();
            }
        } else {
            console.table(this.machineSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}`]);
    }

    getMachineSingleViewTitleLabel(): string {
        return (this.machineIdParam) ? this.machineSingleViewLabels['update-title'] : this.machineSingleViewLabels['create-title'];
    }

    private setMachineSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.machineSingleViewLabels = response.machines['machine-single-view'];
    }


    private setZoneAdministrativeDropdownValues(): void {
        this.masterdataClientService.getZone(this.primaryLanguageCode).subscribe(response => {
            console.log(response);
            this.dropDownValues.zone.primary = response.response;
            if (this.dropDownValues.zone.primary.length === 1) {
                this.machineSingleViewFormGroup.controls.zoneAdministrative.setValue(
                    this.dropDownValues.zone.primary[0].code
                );
                this.machineSingleViewFormGroup.controls.zoneAdministrative.disable();
            }
        });
    }

    private setMachineSpecificationsDropdownValue(): void {
        const filterObject = new FilterValuesModel('name', 'unique', '');
        const optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
        const filterRequest = new FilterRequest([filterObject], this.primaryLanguageCode, [optinalFilterObject]);
        const request = new RequestModel('', null, filterRequest);
        this.masterdataClientService.getFilteredMaterDataTypes('machinespecifications', request).subscribe(response => {
            this.dropDownValues.machineTypeCode.primary = response.response.filters;
        });
    }

    private setCentersDataSource(pageNumber: number): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        this.centerClientService.getRegistrationCentersDetails(this.primaryLanguageCode, pageNumber).subscribe(
            (centersResponse) => {
                const centersResponseContent = (centersResponse && centersResponse.response) ? centersResponse.response : {};
                pageNumber++;
                const resultsSize = (centersResponseContent.totalRecord) ? centersResponseContent.totalRecord : undefined;
                const centers = (centersResponseContent.data) ? [...centersResponseContent.data] : [];
                this.centersDataSource = [...this.centersDataSource, ...centers];
                if (resultsSize && centers && this.centersDataSource.length < resultsSize) {
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

    private setMachineSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.machineIdParam) {
            const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
            this.machineClientService.getMachines(this.primaryLanguageCode, 0, this.machineIdParam).subscribe(
                (machineResponse) => {
                    const reponseContent = (machineResponse && machineResponse.response) ? machineResponse.response : {};
                    this.machineDataSource = (reponseContent.data && reponseContent.data.length > 0) ? reponseContent.data[0] : {};
                    this.machineSingleViewFormGroup.controls.machineId.setValue(this.machineIdParam);
                    this.machineSingleViewFormGroup.controls.name.setValue(this.machineDataSource.name);
                    this.machineSingleViewFormGroup.controls.zoneAdministrative.setValue(this.machineDataSource.zoneCode);
                    this.machineSingleViewFormGroup.controls.validity.setValue(this.machineDataSource.validityDateTime);
                    this.machineSingleViewFormGroup.controls.macAddress.setValue(this.machineDataSource.macAddress);
                    this.machineSingleViewFormGroup.controls.serialNum.setValue(this.machineDataSource.serialNum);
                    this.machineSingleViewFormGroup.controls.ipAddress.setValue(this.machineDataSource.ipAddress);
                    this.machineSingleViewFormGroup.controls.center.setValue(this.machineDataSource.regCenterId);
                    this.machineSingleViewFormGroup.controls.publicKey.setValue(this.machineDataSource.publicKey);
                    this.machineSingleViewFormGroup.controls.machineSpecId.setValue(this.machineDataSource.machineSpecId);
                    this.machineSingleViewFormGroup.controls.isActive.setValue(this.machineDataSource.isActive);
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewMachine(): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        const machineToCreate = new MachineDto(
            this.machineSingleViewFormGroup.controls.zoneAdministrative.value,
            null, // TODO @Youssef : à rectifier !
            this.machineSingleViewFormGroup.controls.name.value,
            this.machineSingleViewFormGroup.controls.machineSpecId.value,
            this.machineSingleViewFormGroup.controls.macAddress.value,
            this.machineSingleViewFormGroup.controls.serialNum.value,
            this.machineSingleViewFormGroup.controls.ipAddress.value,
            this.machineSingleViewFormGroup.controls.publicKey.value,
            this.primaryLanguageCode,
            '0',
            this.machineSingleViewFormGroup.controls.isActive.value,
            this.machineSingleViewFormGroup.controls.center.value
        );
        this.machineClientService.createMachine(machineToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}`]);
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

    private updateMachine(): void {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        const machineToUpdate = new MachineDto(
            this.machineSingleViewFormGroup.controls.zoneAdministrative.value,
            null, // TODO @Youssef : à rectifier !,
            this.machineSingleViewFormGroup.controls.name.value,
            this.machineSingleViewFormGroup.controls.machineSpecId.value,
            this.machineSingleViewFormGroup.controls.macAddress.value,
            this.machineSingleViewFormGroup.controls.serialNum.value,
            this.machineSingleViewFormGroup.controls.ipAddress.value,
            this.machineSingleViewFormGroup.controls.publicKey.value,
            this.primaryLanguageCode,
            this.machineDataSource.id,
            this.machineSingleViewFormGroup.controls.isActive.value,
            this.machineSingleViewFormGroup.controls.center.value
        );
        console.table(machineToUpdate);
        this.machineClientService.updateMachine(machineToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MACHINES}`]);
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
