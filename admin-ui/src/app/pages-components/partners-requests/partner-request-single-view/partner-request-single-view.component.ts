import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AppLanguageStorageService} from '../../../shared/storage-services/app-language-storage.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, ROUTES} from '../../../app.constants';
import LanguageFactory from '../../../../assets/i18n';
import {AppLoadingComponent} from '../../../shared/components/app-loading/app-loading.component';
import {PartnerRequestClientService} from '../../../shared/rest-api-client-services/partner-request-client.service';
import {PartnerRequestDto} from '../../../shared/models/partner-request-dto.model';

@Component({
    selector: 'app-partner-request-single-view',
    templateUrl: './partner-request-single-view.component.html',
    styleUrls: ['./partner-request-single-view.component.scss']
})
export class PartnerRequestSingleViewComponent implements OnInit {

    primaryLanguageCode: string;
    partnerRequestSingleViewLabels: any;

    requestIdParam: string | undefined;

    partnerRequestSingleViewFormGroup = new FormGroup({
        requestId: new FormControl('', []),
        partnerID: new FormControl('', []),
        policyName: new FormControl('', []),
        policyDesc: new FormControl('', [])
    });

    constructor(
        private partnerRequestClientService: PartnerRequestClientService,
        private appLanguageStorageService: AppLanguageStorageService,
        private matDialog: MatDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    get requestSingleViewFormGroupControls(): any {
        return this.partnerRequestSingleViewFormGroup.controls;
    }

    ngOnInit(): void {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        this.setRequestSingleViewLabels(this.primaryLanguageCode);
        this.activatedRoute.params.subscribe(params => {
            this.requestIdParam = params && params.id;
            if (this.requestIdParam) {
                this.setRequestSingleViewFormGroupControlsValuesWithViewData();
            }
        });
    }

    onClickSubmitBtnHandler(): void {
        if (this.partnerRequestSingleViewFormGroup.valid) {
            if (!this.requestIdParam) {
                this.createNewPartnerRequest();
            } else {
                this.updatePartnerRequest();
            }
        } else {
            console.table(this.partnerRequestSingleViewFormGroup);
        }
    }

    onClickCancelBtnHandler(): void {
        this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}`]);
    }

    getPartnerRequestSingleViewTitleLabel(): string {
        return (this.requestIdParam) ? this.partnerRequestSingleViewLabels['update-title'] : this.partnerRequestSingleViewLabels['create-title'];
    }

    private setRequestSingleViewLabels(primaryLanguageCode: string): void {
        const factory = new LanguageFactory(primaryLanguageCode);
        const response = factory.getCurrentlanguage();
        this.partnerRequestSingleViewLabels = response['partners-requests']['partner-request-single-view'];
    }

    private setRequestSingleViewFormGroupControlsValuesWithViewData(): void {
        if (this.requestIdParam) {
            const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
            this.partnerRequestClientService.getRegistrationRequestDetailById(this.requestIdParam).subscribe(
                (requestResponse) => {
                    // tslint:disable-next-line:max-line-length
                    const requestReponseContent = (requestResponse && requestResponse.response) ? requestResponse.response : {};
                    this.partnerRequestSingleViewFormGroup.controls.requestId.setValue(this.requestIdParam);
                    this.partnerRequestSingleViewFormGroup.controls.userID.setValue(requestReponseContent.userID);
                    this.partnerRequestSingleViewFormGroup.controls.organizationName.setValue(requestReponseContent.name);
                    this.partnerRequestSingleViewFormGroup.controls.emailId.setValue(requestReponseContent.emailId);
                    this.partnerRequestSingleViewFormGroup.controls.contactNumber.setValue(requestReponseContent.contactNumber);
                    this.partnerRequestSingleViewFormGroup.controls.address.setValue(requestReponseContent.address);
                    this.partnerRequestSingleViewFormGroup.controls.status.setValue((requestReponseContent.isActive) ? 'Active' : 'Desactive');
                    this.partnerRequestSingleViewFormGroup.controls.approbation.setValue(requestReponseContent.status_code);
                },
                () => {
                },
                () => {
                    appLoadingMatDialogRef.close();
                }
            );
        }
    }

    private createNewPartnerRequest(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const requestToCreate = new PartnerRequestDto(
        );
        this.partnerRequestClientService.createRequest(requestToCreate).subscribe(
            createResponse => {
                console.table(createResponse);
                if (!createResponse.errors || !createResponse.errors.size || createResponse.errors.size === 0) {
                    appLoadingMatDialogRef.close();
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}`]);
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

    private updatePartnerRequest(): void {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
        const requestToUpdate = new PartnerRequestDto(
        );
        console.table(requestToUpdate);
        this.partnerRequestClientService.updateRequest(requestToUpdate).subscribe(
            updateResponse => {
                console.table(updateResponse);
                if (!updateResponse.errors || !updateResponse.errors.size || updateResponse.errors.size === 0) {
                    appLoadingMatDialogRef.close();
                    this.router.navigate([`${this.primaryLanguageCode}/${ROUTES.PARTNERS_REQUESTS}`]);
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
