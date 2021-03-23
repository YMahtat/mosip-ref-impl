import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {
    DEFAULT_PRIMARY_LANGUAGE_CODE,
    PROCESSING_TIME_END,
    PROCESSING_TIME_INTERVAL,
    PROCESSING_TIME_START,
    ROUTES,
    TIME_SLOTS_INTERVAL,
    WEEK_DAYS
} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {CenterClientService} from '../../../shared/rest-api-client-services/center-client.service';
import {CenterDropdown} from '../../../shared/models/center-dropdown.model';
import {FilterValuesModel} from '../../../shared/models/filter-values.model';
import {OptionalFilterValuesModel} from '../../../shared/models/optional-filter-values.model';
import {RequestModel} from '../../../shared/models/request.model';
import {FilterRequest} from '../../../shared/models/filter-request.model';
import {MasterdataClientService} from '../../../shared/rest-api-client-services/masterdata-client.service';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';
import {TimeUtilityService} from '../../../shared/utilities/time-utility.service';
import {UpdateCenterDto} from '../../../shared/models/update-center-dto.model';
import {CreateCenterDto} from '../../../shared/models/create-center-dto.model';

@Component({
    selector: 'app-center-single-view',
    templateUrl: './center-single-view.component.html',
    styleUrls: ['./center-single-view.component.scss']
})
export class CenterSingleViewComponent implements OnInit, AfterViewChecked {

    primaryLanguageCode: string;
    centerSingleViewLabels: any;

    centerIdParam: string | undefined;

    dropDownValues = new CenterDropdown();
    allTimeSlots: Array<string> = [];
    weekDays: Array<any> = [];
    centerSingleViewFormGroup = new FormGroup({
        centerId: new FormControl('', []),
        name: new FormControl('', []),
        centerType: new FormControl('', []),
        contactPerson: new FormControl('', []),
        contactPhone: new FormControl('', []),
        longitude: new FormControl('', []),
        latitude: new FormControl('', []),
        addressLine1: new FormControl('', []),
        addressLine2: new FormControl('', []),
        addressLine3: new FormControl('', []),
        region: new FormControl('', []),
        province: new FormControl('', []),
        zone: new FormControl('', []),
        zoneAdministrative: new FormControl('', []),
        city: new FormControl('', []),
        postalCode: new FormControl('', []),
        holidayLocation: new FormControl('', []),
        numberOfKiosks: new FormControl('', []),
        perKioskProcessTime: new FormControl('', []),
        centerStartTime: new FormControl('', []),
        centerEndTime: new FormControl('', []),
        workingHours: new FormControl('', []),
        lunchStartTime: new FormControl('', []),
        lunchEndTime: new FormControl('', []),
        workingDays: new FormControl('', []),
        exceptionalHoliday: new FormControl('', []),
        isActive: new FormControl('', []),
    });
    private centerDataSource: any;
    private oldRegionValue: string | undefined;
    private oldProvinceValue: string | undefined;
    private oldCityValue: string | undefined;

    constructor(
        private centerClientService: CenterClientService,
        private masterdataClientService: MasterdataClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private cdr: ChangeDetectorRef
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get centerSingleViewFormGroupControls(): any {
        return this.centerSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        // @ts-ignore
        this.weekDays = WEEK_DAYS[this.primaryLanguageCode];
        this.allTimeSlots = [];
        this.setCenterSingleViewLabels(this.primaryLanguageCode);
        this.activatedRoute.params.subscribe(params => {
            this.centerIdParam = params && params.id;
            if (this.centerIdParam) {
                this.setCenterSingleViewFormGroupControlsValuesWithViewData();
            }
        });
        this.setDropdownInitValues();
    }

    ngAfterViewChecked(): void {
        this.setDropdownVariableValues();
        this.calculateWorkingHours();
        this.cdr.detectChanges();
    }

    onClickSubmitBtnHandler(): void {
        if (this.centerSingleViewFormGroup.valid) {
            if (!this.centerIdParam) {
                this.createNewCenter();
            } else {
                this.updateCenter();
            }
        } else {
            console.table(this.centerSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}`]);
    }

    getCenterSingleViewTitleLabel(): string {
        return (this.centerIdParam) ? this.centerSingleViewLabels['update-title'] : this.centerSingleViewLabels['create-title'];
    }

    private setCenterSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.centerSingleViewLabels = response.centers['center-single-view'];
    }

    private setDropdownInitValues(): void {
        this.setLocationDropdownValues('MOR', 'region');
        this.setDropdownVariableValues();
        this.setCenterTypeDropdownValues();
        this.setZoneAdministrativeDropdownValues();
        this.setHolidayZoneDropdownValues();
        this.setProcessingTimeDropdownValues();
        this.setTimeSlotsDropdownValues();
    }

    private setDropdownVariableValues(): void {
        const newRegionValue = this.centerSingleViewFormGroup.controls.region.value;
        if (newRegionValue && this.oldRegionValue !== newRegionValue) {
            this.oldRegionValue = newRegionValue;
            this.setLocationDropdownValues(newRegionValue, 'province');
        }
        const newProvinceValue = this.centerSingleViewFormGroup.controls.province.value;
        if (newProvinceValue && this.oldProvinceValue !== newProvinceValue) {
            this.oldProvinceValue = newProvinceValue;
            this.setLocationDropdownValues(newProvinceValue, 'city');
        }
        const newCityValue = this.centerSingleViewFormGroup.controls.city.value;
        if (newCityValue && this.oldCityValue !== newCityValue) {
            this.oldCityValue = newCityValue;
            this.setLocationDropdownValues(newCityValue, 'postalCode');
        }
        this.validateAndSetLunchTimeSlotsDropdownValues('lunchStartTime');
        this.validateAndSetLunchTimeSlotsDropdownValues('lunchEndTime');
    }


    private setLocationDropdownValues(locationCode: string, fieldName: string): void {
        this.masterdataClientService.getLocationImmediateChildrens(locationCode, this.primaryLanguageCode).subscribe(response => {
            // @ts-ignore
            this.dropDownValues[fieldName].primary = response.response.locations;
        });
    }


    private setCenterTypeDropdownValues(): void {
        const filterObject = new FilterValuesModel('name', 'unique', '');
        const optinalFilterObject = new OptionalFilterValuesModel('isActive', 'equals', 'true');
        const filterRequest = new FilterRequest([filterObject], this.primaryLanguageCode, [optinalFilterObject]);
        const request = new RequestModel('', null, filterRequest);
        this.masterdataClientService.getFilteredMaterDataTypes(
            'registrationcentertypes',
            request
        ).subscribe(response => {
            this.dropDownValues.centerTypeCode.primary = response.response.filters;
        });
    }


    private setZoneAdministrativeDropdownValues(): void {
        this.masterdataClientService.getZone(this.primaryLanguageCode).subscribe(response => {
            console.log(response);
            this.dropDownValues.zone.primary = response.response;
            if (this.dropDownValues.zone.primary.length === 1) {
                this.centerSingleViewFormGroup.controls.zoneAdministrative.setValue(
                    this.dropDownValues.zone.primary[0].code
                );
                this.centerSingleViewFormGroup.controls.zoneAdministrative.disable();
            }
        });
    }

    private setHolidayZoneDropdownValues(): void {
        this.masterdataClientService.getHolidaysZone(this.primaryLanguageCode).subscribe(response => {
            const locations = (response.response) ? response.response.locations : {};
            this.dropDownValues.holidayZone.primary = locations;
        });
    }

    private setProcessingTimeDropdownValues(): void {
        this.dropDownValues.processingTime = TimeUtilityService.minuteIntervals(
            PROCESSING_TIME_START,
            PROCESSING_TIME_END,
            PROCESSING_TIME_INTERVAL
        );
    }

    private setTimeSlotsDropdownValues(): void {
        const slots = TimeUtilityService.getTimeSlots(TIME_SLOTS_INTERVAL);
        this.dropDownValues.startTime = slots;
        this.dropDownValues.endTime = slots;
        this.allTimeSlots = slots;
    }

    private validateAndSetLunchTimeSlotsDropdownValues(fieldName: string): void {
        if (this.centerSingleViewFormGroup.controls.centerStartTime.valid && this.centerSingleViewFormGroup.controls.centerEndTime.valid) {
            if (fieldName === 'lunchStartTime') {
                const x = [...this.allTimeSlots];
                const startIndex = x.indexOf(this.centerSingleViewFormGroup.controls.centerStartTime.value) + 1;
                if (this.centerSingleViewFormGroup.controls.lunchEndTime.value !== '') {
                    const endIndex = x.indexOf(this.centerSingleViewFormGroup.controls.lunchEndTime.value);
                    this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
                } else {
                    const endIndex = x.indexOf(this.centerSingleViewFormGroup.controls.centerEndTime.value);
                    this.dropDownValues.lunchStartTime = x.slice(startIndex, endIndex);
                }
            } else if (fieldName === 'lunchEndTime') {
                const x = [...this.allTimeSlots];
                const endIndex = x.indexOf(this.centerSingleViewFormGroup.controls.centerEndTime.value);
                if (this.centerSingleViewFormGroup.controls.lunchStartTime.value !== '') {
                    const startIndex = x.indexOf(this.centerSingleViewFormGroup.controls.lunchStartTime.value) + 1;
                    this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);
                } else {
                    const startIndex = x.indexOf(this.centerSingleViewFormGroup.controls.centerStartTime.value) + 1;
                    this.dropDownValues.lunchEndTime = x.slice(startIndex, endIndex);
                }
            }
        } else {
            alert('error !');
        }
    }

    private calculateWorkingHours(): void {
        if (
            this.centerSingleViewFormGroup.controls.centerStartTime.value &&
            this.centerSingleViewFormGroup.controls.centerEndTime.value
        ) {
            const x =
                TimeUtilityService.getTimeInSeconds(this.centerSingleViewFormGroup.controls.centerEndTime.value) -
                TimeUtilityService.getTimeInSeconds(this.centerSingleViewFormGroup.controls.centerStartTime.value);
            this.centerSingleViewFormGroup.controls.workingHours.setValue(x / 3600);
        }
    }

    private setCenterSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.centerIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.centerClientService.getRegistrationCentersDetails(
                this.primaryLanguageCode,
                0,
                this.centerIdParam
            ).subscribe(
                (centersResponse) => {
                    const centersResponseContent = (centersResponse && centersResponse.response) ? centersResponse.response : {};
                    this.centerDataSource = (
                        centersResponseContent && centersResponseContent.data && centersResponseContent.data.length > 0
                    ) ? centersResponseContent.data[0] : {};
                    this.centerSingleViewFormGroup.controls.centerId.setValue(this.centerIdParam);
                    this.centerSingleViewFormGroup.controls.name.setValue(this.centerDataSource.name);
                    this.centerSingleViewFormGroup.controls.centerType.setValue(this.centerDataSource.centerTypeCode);
                    this.centerSingleViewFormGroup.controls.contactPerson.setValue(this.centerDataSource.contactPerson);
                    this.centerSingleViewFormGroup.controls.contactPhone.setValue(this.centerDataSource.contactPhone);
                    this.centerSingleViewFormGroup.controls.longitude.setValue(this.centerDataSource.longitude);
                    this.centerSingleViewFormGroup.controls.latitude.setValue(this.centerDataSource.latitude);
                    this.centerSingleViewFormGroup.controls.addressLine1.setValue(this.centerDataSource.addressLine1);
                    this.centerSingleViewFormGroup.controls.addressLine2.setValue(this.centerDataSource.addressLine2);
                    this.centerSingleViewFormGroup.controls.addressLine3.setValue(this.centerDataSource.addressLine3);
                    this.centerSingleViewFormGroup.controls.region.setValue(this.centerDataSource.regionCode);
                    this.centerSingleViewFormGroup.controls.province.setValue(this.centerDataSource.provinceCode);
                    this.centerSingleViewFormGroup.controls.zoneAdministrative.setValue(this.centerDataSource.zoneCode);
                    this.centerSingleViewFormGroup.controls.city.setValue(this.centerDataSource.cityCode);
                    this.centerSingleViewFormGroup.controls.zone.setValue(this.centerDataSource.locationCode);
                    this.centerSingleViewFormGroup.controls.holidayLocation.setValue(this.centerDataSource.holidayLocationCode);
                    this.centerSingleViewFormGroup.controls.numberOfKiosks.setValue(this.centerDataSource.numberOfKiosks);
                    this.centerSingleViewFormGroup.controls.perKioskProcessTime.setValue(
                        Number(this.centerDataSource.perKioskProcessTime.split(':')[1])
                    );
                    this.centerSingleViewFormGroup.controls.centerStartTime.setValue(
                        TimeUtilityService.convertTimeTo12Hours(this.centerDataSource.centerStartTime)
                    );
                    this.centerSingleViewFormGroup.controls.centerEndTime.setValue(
                        TimeUtilityService.convertTimeTo12Hours(this.centerDataSource.centerEndTime)
                    );
                    this.centerSingleViewFormGroup.controls.lunchStartTime.setValue(
                        TimeUtilityService.convertTimeTo12Hours(this.centerDataSource.lunchStartTime)
                    );
                    this.centerSingleViewFormGroup.controls.lunchEndTime.setValue(
                        TimeUtilityService.convertTimeTo12Hours(this.centerDataSource.lunchEndTime)
                    );
                    this.centerSingleViewFormGroup.controls.isActive.setValue(this.centerDataSource.isActive);
                    this.centerSingleViewFormGroup.controls.workingDays.setValue(
                        this.centerDataSource.workingNonWorkingDays ?
                            this.reverseFormatWorkingDays(this.centerDataSource.workingNonWorkingDays) : []
                    );
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewCenter(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const centerToCreate = new CreateCenterDto(
            this.centerSingleViewFormGroup.controls.addressLine1.value,
            this.centerSingleViewFormGroup.controls.addressLine2.value,
            this.centerSingleViewFormGroup.controls.addressLine3.value,
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.centerEndTime.value),
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.centerStartTime.value),
            this.centerSingleViewFormGroup.controls.centerType.value,
            this.centerSingleViewFormGroup.controls.contactPerson.value,
            this.centerSingleViewFormGroup.controls.contactPhone.value,
            this.centerSingleViewFormGroup.controls.holidayLocation.value,
            this.primaryLanguageCode,
            this.centerSingleViewFormGroup.controls.latitude.value,
            this.centerSingleViewFormGroup.controls.zoneAdministrative.value,
            this.centerSingleViewFormGroup.controls.longitude.value,
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.lunchEndTime.value),
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.lunchStartTime.value),
            this.centerSingleViewFormGroup.controls.name.value,
            '00:' + this.centerSingleViewFormGroup.controls.perKioskProcessTime.value + ':00',
            '(GTM+01:00) CENTRAL EUROPEAN TIME', // TODO : à rectifier !
            this.centerSingleViewFormGroup.controls.workingHours.value,
            this.centerSingleViewFormGroup.controls.zoneAdministrative.value,
            '',
            false,
            this.formatWorkingDays(this.centerSingleViewFormGroup.controls.workingDays.value),
            [],
        );
        console.table(centerToCreate);
        this.centerClientService.createCenter(centerToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}`]);
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

    private updateCenter(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const centerToUpdate = new UpdateCenterDto(
            this.centerSingleViewFormGroup.controls.addressLine1.value,
            this.centerSingleViewFormGroup.controls.addressLine2.value,
            this.centerSingleViewFormGroup.controls.addressLine3.value,
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.centerEndTime.value),
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.centerStartTime.value),
            this.centerSingleViewFormGroup.controls.centerType.value,
            this.centerSingleViewFormGroup.controls.contactPerson.value,
            this.centerSingleViewFormGroup.controls.contactPhone.value,
            this.centerSingleViewFormGroup.controls.holidayLocation.value,
            this.primaryLanguageCode,
            this.centerSingleViewFormGroup.controls.latitude.value,
            this.centerSingleViewFormGroup.controls.zone.value,
            this.centerSingleViewFormGroup.controls.longitude.value,
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.lunchEndTime.value),
            TimeUtilityService.convertTime(this.centerSingleViewFormGroup.controls.lunchStartTime.value),
            this.centerSingleViewFormGroup.controls.name.value,
            '00:' + this.centerSingleViewFormGroup.controls.perKioskProcessTime.value + ':00',
            this.centerDataSource.timeZone,
            this.centerSingleViewFormGroup.controls.workingHours.value,
            this.centerSingleViewFormGroup.controls.zoneAdministrative.value,
            this.centerDataSource.id,
            this.centerSingleViewFormGroup.controls.isActive.value,
            this.centerSingleViewFormGroup.controls.numberOfKiosks.value,
            this.formatWorkingDays(this.centerSingleViewFormGroup.controls.workingDays.value),
            [],
        );
        console.table(centerToUpdate);
        this.centerClientService.updateCenter(centerToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.CENTERS}`]);
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

    private formatWorkingDays(selectedDays: string[]): any {
        const selectedWorkingDays = {
            sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false
        };
        this.weekDays.forEach(day => {
            // @ts-ignore
            selectedWorkingDays[day.code] = Boolean(selectedDays.indexOf(day.code) >= 0);
        });
        console.log(selectedWorkingDays);
        return selectedWorkingDays;
    }

    private reverseFormatWorkingDays(days: any): any[] {
        const keys = Object.keys(days);
        const selectedDays: any[] = [];
        keys.forEach(key => {
            if (days[key]) {
                selectedDays.push(key);
            }
        });
        return selectedDays;
    }

}
