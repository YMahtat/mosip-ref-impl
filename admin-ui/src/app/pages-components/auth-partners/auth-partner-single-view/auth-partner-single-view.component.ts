import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
    DEFAULT_PRIMARY_LANGUAGE_CODE,
    RNP_MOSIP_AUTH_PARTNER_ACTIVE_STATUS,
    RNP_MOSIP_AUTH_PARTNER_DESACTIVE_STATUS,
    ROUTES
} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {AuthPartnerClientService} from '../../../shared/rest-api-client-services/auth-partner-client.service';
import {AuthPartnerDto} from '../../../shared/models/auth-partner-dto.model';
import {UdpateAuthPartnerStatusDto} from '../../../shared/models/udpate-auth-partner-status-dto.model';
import {AppPopUpDialogUtilityService} from '../../../shared/utilities/app-pop-up-dialog-utility.service';

@Component({
    selector: 'app-auth-partner-single-view',
    templateUrl: './auth-partner-single-view.component.html',
    styleUrls: ['./auth-partner-single-view.component.scss']
})
export class AuthPartnerSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    authPartnerSingleViewLabels: any;

    authPartnerSingleViewFormGroup = new FormGroup({
        partnerId: new FormControl('', []),
        organizationName: new FormControl('', []),
        partnerType: new FormControl('', []),
        policyGroup: new FormControl('', []),
        emailId: new FormControl('', []),
        contactNumber: new FormControl('', []),
        address: new FormControl('', []),
        status: new FormControl('', []),
    });

    partnerIdParam: string | undefined;
    authPartnerApiKeys: Array<any> | undefined;
    isActiveAuthPartner: boolean | undefined;
    isDesactiveAuthPartner: boolean | undefined;

    constructor(
        private authPartnerClientService: AuthPartnerClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService,
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

    getAuthPartnerSingleViewTitleLabel(): string {
        return (this.partnerIdParam) ? this.authPartnerSingleViewLabels['update-title'] : this.authPartnerSingleViewLabels['create-title'];
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

    onClickActiveAuthPartnerBtnHandler(): void {
        if (!this.isActiveAuthPartner) {
            this.updateAuthPartnerStatus(RNP_MOSIP_AUTH_PARTNER_ACTIVE_STATUS);
        }
    }


    onClickDesactiveAuthPartnerBtnHandler(): void {
        if (!this.isDesactiveAuthPartner) {
            this.updateAuthPartnerStatus(RNP_MOSIP_AUTH_PARTNER_DESACTIVE_STATUS);
        }
    }

    private setAuthPartnerSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.authPartnerSingleViewLabels = response['auth-partners']['auth-partner-single-view'];
    }


    private setAuthPartnerSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.partnerIdParam) {
            const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
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
                    this.authPartnerSingleViewFormGroup.controls.status.setValue(partnerReponseContent.status);
                    this.isActiveAuthPartner = (partnerReponseContent.status === RNP_MOSIP_AUTH_PARTNER_ACTIVE_STATUS);
                    this.isDesactiveAuthPartner = !this.isActiveAuthPartner;
                    this.setAuthPartnerApiKeysViewValuesWithViewData();
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private setAuthPartnerApiKeysViewValuesWithViewData(): void {
        if (this.partnerIdParam) {
            const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
            this.authPartnerClientService.getRegistrationAuthPartnersApiKeysDetails(this.partnerIdParam).subscribe(
                (partnerApiKeysResponse) => {
                    // tslint:disable-next-line:max-line-length
                    this.authPartnerApiKeys = (partnerApiKeysResponse && partnerApiKeysResponse.response) ? partnerApiKeysResponse.response : {};
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
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
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
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
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


    private updateAuthPartnerStatus(authPartnerStatus: string): void {
        if (this.partnerIdParam) {
            const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
            const updateAuthPartnerStatusRequest = new UdpateAuthPartnerStatusDto(this.partnerIdParam, authPartnerStatus);
            this.authPartnerClientService.updateAuthPartnerStatus(updateAuthPartnerStatusRequest).subscribe(
                updateResponse => {
                    console.table(updateResponse);
                    if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                        appLoadingMatDialogRef.close();
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

}
