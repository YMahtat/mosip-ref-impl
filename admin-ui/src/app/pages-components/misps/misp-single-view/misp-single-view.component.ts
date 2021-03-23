import {Component, OnInit} from '@angular/core';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import LanguageFactory from '../../../../assets/i18n';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MispDto} from '../../../shared/models/misp-dto.model';
import {MispClientService} from '../../../shared/rest-api-client-services/misp-client.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';

@Component({
    selector: 'app-misp-single-view',
    templateUrl: './misp-single-view.component.html',
    styleUrls: ['./misp-single-view.component.scss']
})
export class MispSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    mispSingleViewLabels: any;

    mispIdParam: string | undefined;
    mispLicenceKey: string | undefined;
    mispIsActiveStatus = false;
    isMispApprobationInProgress = false;

    mispSingleViewFormGroup = new FormGroup({
        mispId: new FormControl('', []),
        userID: new FormControl('', []),
        organizationName: new FormControl('', [Validators.required]),
        emailId: new FormControl('', [Validators.required]),
        contactNumber: new FormControl('', [Validators.required]),
        address: new FormControl('', [Validators.required]),
        status: new FormControl('', []),
        approbation: new FormControl('', []),
        mispLicenseKey: new FormControl('', []),
        mispLicenseKeyExpiry: new FormControl('', []),
        mispLicenseStatus: new FormControl('', []),
    });

    constructor(
        private mispClientService: MispClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get mispSingleViewFormGroupControls(): any {
        return this.mispSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setMispSingleViewLabels(this.primaryLanguageCode);
        this.activatedRoute.params.subscribe(params => {
            this.mispIdParam = params && params.id;
            if (this.mispIdParam) {
                this.setMispSingleViewFormGroupControlsValuesWithViewData();
            }
        });
    }

    onClickSubmitBtnHandler(): void {
        if (this.mispSingleViewFormGroup.valid) {
            if (!this.mispIdParam) {
                this.createNewMosip();
            } else {
                this.updateMosip();
            }
        } else {
            console.table(this.mispSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}`]);
    }

    getMispSingleViewTitleLabel(): string {
        return (this.mispIdParam) ? this.mispSingleViewLabels['update-title'] : this.mispSingleViewLabels['create-title'];
    }

    private setMispSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.mispSingleViewLabels = response.misps['misp-single-view'];
    }

    private setMispSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.mispIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.mispClientService.getRegistrationMISPDetailById(this.mispIdParam).subscribe(
                (mispResponse) => {
                    // tslint:disable-next-line:max-line-length
                    const mispReponseContent = (mispResponse && mispResponse.response && mispResponse.response.misp) ? mispResponse.response.misp : {};
                    this.mispSingleViewFormGroup.controls.mispId.setValue(this.mispIdParam);
                    this.mispSingleViewFormGroup.controls.userID.setValue(mispReponseContent.userID);
                    this.mispSingleViewFormGroup.controls.organizationName.setValue(mispReponseContent.name);
                    this.mispSingleViewFormGroup.controls.emailId.setValue(mispReponseContent.emailId);
                    this.mispSingleViewFormGroup.controls.contactNumber.setValue(mispReponseContent.contactNumber);
                    this.mispSingleViewFormGroup.controls.address.setValue(mispReponseContent.address);
                    this.mispIsActiveStatus = mispReponseContent.isActive;
                    this.mispSingleViewFormGroup.controls.status.setValue((mispReponseContent.isActive) ? 'Active' : 'Desactive');
                    this.isMispApprobationInProgress = (mispReponseContent.status_code === 'Inprogress');
                    this.mispSingleViewFormGroup.controls.approbation.setValue(mispReponseContent.status_code);
                    this.setMispSingleViewFormGroupControlsValuesWithMispLicenceData();
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private setMispSingleViewFormGroupControlsValuesWithMispLicenceData(): void {
        if (this.mispIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.mispClientService.getRegistrationMISPLicencesDetails(this.mispIdParam).subscribe(
                (mispLicenceResponse) => {
                    // tslint:disable-next-line:max-line-length
                    const mispLicenceReponseContent = (mispLicenceResponse && mispLicenceResponse.response) ? mispLicenceResponse.response : {};
                    this.mispLicenceKey = mispLicenceReponseContent.licenseKey;
                    this.mispSingleViewFormGroup.controls.mispLicenseKey.setValue(mispLicenceReponseContent.licenseKey);
                    this.mispSingleViewFormGroup.controls.mispLicenseKeyExpiry.setValue(mispLicenceReponseContent.licenseKeyExpiry);
                    this.mispSingleViewFormGroup.controls.mispLicenseStatus.setValue(mispLicenceReponseContent.licenseKeyStatus);
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewMosip(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const mispToCreate = new MispDto(
            this.mispSingleViewFormGroup.controls.organizationName.value,
            this.mispSingleViewFormGroup.controls.emailId.value,
            this.mispSingleViewFormGroup.controls.contactNumber.value,
            this.mispSingleViewFormGroup.controls.address.value
        );
        this.mispClientService.createMisp(mispToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    appLoadingMatDialogRef.close();
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}`]);
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

    private updateMosip(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const mispToUpdate = new MispDto(
            null,
            this.mispSingleViewFormGroup.controls.emailId.value,
            this.mispSingleViewFormGroup.controls.contactNumber.value,
            this.mispSingleViewFormGroup.controls.address.value,
            this.mispIdParam,
            this.mispSingleViewFormGroup.controls.organizationName.value,
        );
        console.table(mispToUpdate);
        this.mispClientService.updateMisp(mispToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    appLoadingMatDialogRef.close();
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.MISPS}`]);
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
