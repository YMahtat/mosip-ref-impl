import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {MachineClientService} from '../../../shared/rest-api-client-services/machine-client.service';
import {CenterDropdown} from '../../../shared/models/center-dropdown.model';
import {MasterdataClientService} from '../../../shared/rest-api-client-services/masterdata-client.service';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';
import {MachineDto} from '../../../shared/models/machine-dto.model';
import {FilterValuesModel} from '../../../shared/models/filter-values.model';
import {OptionalFilterValuesModel} from '../../../shared/models/optional-filter-values.model';
import {FilterRequest} from '../../../shared/models/filter-request.model';
import {RequestModel} from '../../../shared/models/request.model';

@Component({
    selector: 'app-machine-single-view',
    templateUrl: './machine-single-view.component.html',
    styleUrls: ['./machine-single-view.component.scss']
})
export class MachineSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    machineSingleViewLabels: any;

    machineIdParam: string | undefined;

    dropDownValues = new CenterDropdown();
    machineSingleViewFormGroup = new FormGroup({
        machineId: new FormControl('', []),
        name: new FormControl('', []),
        serialNum: new FormControl('', []),
        macAddress: new FormControl('', []),
        ipAddress: new FormControl('', []),
        validity: new FormControl('', []),
        zoneAdministrative: new FormControl('', []),
        machineSpecId: new FormControl('', []),
        publicKey: new FormControl('', []),
        isActive: new FormControl('', [])
    });
    private machineDataSource: any;

    constructor(
        private machineClientService: MachineClientService,
        private masterdataClientService: MasterdataClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get machineSingleViewFormGroupControls(): any {
        return this.machineSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMachineSingleViewLabels(this.primaryLanguageCode);
        this.setZoneAdministrativeDropdownValues();
        this.setMachineSpecificationsDropdownValue();
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

    private setMachineSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.machineIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
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
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
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
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
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
