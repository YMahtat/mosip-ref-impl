import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {AuthPartnerClientService} from '../../../shared/rest-api-client-services/auth-partner-client.service';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';
import {AuthPartnerDto} from '../../../shared/models/auth-partner-dto.model';

@Component({
    selector: 'app-auth-partner-single-view',
    templateUrl: './auth-partner-single-view.component.html',
    styleUrls: ['./auth-partner-single-view.component.scss']
})
export class AuthPartnerSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    authPartnerSingleViewLabels: any;

    partnerIdParam: string | undefined;

    authPartnerSingleViewFormGroup = new FormGroup({
        partnerId: new FormControl('', []),
        organizationName: new FormControl('', []),
        partnerType: new FormControl('', []),
        policyGroup: new FormControl('', []),
        emailId: new FormControl('', []),
        contactNumber: new FormControl('', []),
        address: new FormControl('', []),
    });

    constructor(
        private authPartnerClientService: AuthPartnerClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get authPartnerSingleViewFormGroupControls(): any {
        return this.authPartnerSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setAuthPartnerSingleViewLabels(this.primaryLanguageCode);
        this.activatedRoute.params.subscribe(params => {
            this.partnerIdParam = params && params.id;
            if (this.partnerIdParam) {
                this.setAuthPartnerSingleViewFormGroupControlsValuesWithViewData();
            }
        });
    }

    onClickSubmitBtnHandler(): void {
        if (this.authPartnerSingleViewFormGroup.valid) {
            if (!this.partnerIdParam) {
                this.createNewAuthPartner();
            } else {
                this.updateAuthPartner();
            }
        } else {
            console.table(this.authPartnerSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}`]);
    }

    getAuthPartnerSingleViewTitleLabel(): string {
        return (this.partnerIdParam) ? this.authPartnerSingleViewLabels['update-title'] : this.authPartnerSingleViewLabels['create-title'];
    }

    private setAuthPartnerSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.authPartnerSingleViewLabels = response['auth-partners']['auth-partner-single-view'];
    }


    private setAuthPartnerSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.partnerIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.authPartnerClientService.getAuthPartnerDetailsById(this.partnerIdParam).subscribe(
                (partnerResponse) => {
                    const partnerReponseContent = (partnerResponse && partnerResponse.response) ? partnerResponse.response : {};
                    this.authPartnerSingleViewFormGroup.controls.partnerId.setValue(partnerReponseContent.partnerID);
                    this.authPartnerSingleViewFormGroup.controls.partnerType.setValue(partnerReponseContent.partnerType);
                    this.authPartnerSingleViewFormGroup.controls.policyGroup.setValue(partnerReponseContent.policyGroup);
                    this.authPartnerSingleViewFormGroup.controls.organizationName.setValue(partnerReponseContent.organizationName);
                    this.authPartnerSingleViewFormGroup.controls.emailId.setValue(partnerReponseContent.emailId);
                    this.authPartnerSingleViewFormGroup.controls.contactNumber.setValue(partnerReponseContent.contactNumber);
                    this.authPartnerSingleViewFormGroup.controls.address.setValue(partnerReponseContent.address);
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewAuthPartner(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const authPartnerToCreate = new AuthPartnerDto(
            this.authPartnerSingleViewFormGroup.controls.partnerId.value,
            this.authPartnerSingleViewFormGroup.controls.partnerType.value,
            this.authPartnerSingleViewFormGroup.controls.policyGroup.value,
            this.authPartnerSingleViewFormGroup.controls.organizationName.value,
            this.authPartnerSingleViewFormGroup.controls.emailId.value,
            this.authPartnerSingleViewFormGroup.controls.contactNumber.value,
            this.authPartnerSingleViewFormGroup.controls.address.value
        );
        this.authPartnerClientService.createAuthPartner(authPartnerToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}`]);
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

    private updateAuthPartner(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const authPartnerToUpdate = new AuthPartnerDto(
            this.authPartnerSingleViewFormGroup.controls.partnerId.value,
            null,
            null,
            null,
            null,
            this.authPartnerSingleViewFormGroup.controls.contactNumber.value,
            this.authPartnerSingleViewFormGroup.controls.address.value,
        );
        console.table(authPartnerToUpdate);
        this.authPartnerClientService.updateAuthPartner(authPartnerToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.AUTH_PARTNERS}`]);
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
