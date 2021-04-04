import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewChildren,
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AbstractControl, FormControl, FormGroup, ValidatorFn, Validators,} from "@angular/forms";
import {MatDialog} from "@angular/material";
import {TranslateService} from "@ngx-translate/core";

import {DataStorageService} from "src/app/core/services/data-storage.service";
import {RegistrationService} from "src/app/core/services/registration.service";

import {UserModel} from "src/app/shared/models/demographic-model/user.modal";
import {CodeValueModal} from "src/app/shared/models/demographic-model/code.value.modal";
import * as appConstants from "../../../app.constants";
import Utils from "src/app/app.util";
import {DialougComponent} from "src/app/shared/dialoug/dialoug.component";
import {ConfigService} from "src/app/core/services/config.service";
import {AttributeModel} from "src/app/shared/models/demographic-model/attribute.modal";
import {FilesModel} from "src/app/shared/models/demographic-model/files.model";
import {MatKeyboardComponent, MatKeyboardRef, MatKeyboardService,} from "ngx7-material-keyboard";
import {LogService} from "src/app/shared/logger/log.service";
import LanguageFactory from "src/assets/i18n";
import {FormDeactivateGuardService} from "src/app/shared/can-deactivate-guard/form-guard/form-deactivate-guard.service";
import {Subscription} from "rxjs";
import {DEFAULT_LTR_LANGUAGE_CODE, DEFAULT_RTL_LANGUAGE_CODE} from "../../../app.constants";

/**
 * @description This component takes care of the demographic page.
 * @author Shashank Agrawal
 *
 * @export
 * @class DemographicComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
    selector: "app-demographic",
    templateUrl: "./demographic.component.html",
    styleUrls: ["./demographic.component.css"],
})
export class DemographicComponent extends FormDeactivateGuardService implements OnInit, AfterViewChecked, OnDestroy {

    // textDir = localStorage.getItem("dir");
    // secTextDir = localStorage.getItem("secondaryDir");

    primaryLanguage = localStorage.getItem("langCode");
    primaryLeftToRightLanguage = DEFAULT_LTR_LANGUAGE_CODE;
    secondaryLanguage = localStorage.getItem("secondaryLangCode");
    secondaryRightToLeftLanguage = DEFAULT_RTL_LANGUAGE_CODE;
    languages = [this.primaryLeftToRightLanguage, this.secondaryRightToLeftLanguage];

    files: FilesModel;
    DOB_PATTERN: string;
    date: string = "";
    month: string = "";
    year: string = "";
    dayOfBirth = "";
    dayOfBirthForSecondaryRightToLeftForm = "";
    currentAge: string = "";
    isNewApplicant = false;
    checked = true;
    dataUploadComplete = true;
    hasError = false;
    dataModification: boolean;
    showPreviewButton = false;
    canDeactivateFlag = true;
    isConsentMessage = false;
    isReadOnly = false;
    id: number;
    oldKeyBoardIndex: number;
    leftToRightUserForm = new FormGroup({});
    rightToLeftUserForm = new FormGroup({});
    preRegId = "";
    loginId = "";
    user: UserModel = new UserModel();
    demographicPrimaryLeftToRightLanguageLabels: any;
    demographicSecondaryRightToLeftLanguagelabels: any;
    errorlabels: any;
    uppermostLocationHierarchy: any;
    genders: any;
    residenceStatus: any;
    message = {};
    config = {};
    consentMessage: any;
    titleOnError = "";
    yesterdayDate: string;

    @ViewChild("age") age: ElementRef;
    regionsInPrimaryLeftToRightLanguage: CodeValueModal[] = [];
    regionsInSecondaryRightToLeftLanguage: CodeValueModal[] = [];
    regions: CodeValueModal[][] = [
        this.regionsInPrimaryLeftToRightLanguage,
        this.regionsInSecondaryRightToLeftLanguage,
    ];
    provincesInPrimaryLeftToRightLanguage: CodeValueModal[] = [];
    provincesInSecondaryRightToLeftLanguage: CodeValueModal[] = [];
    provinces: CodeValueModal[][] = [
        this.provincesInPrimaryLeftToRightLanguage,
        this.provincesInSecondaryRightToLeftLanguage,
    ];
    citiesInPrimaryLeftToRightLanguage: CodeValueModal[] = [];
    citiesInSecondaryRightToLeftLanguage: CodeValueModal[] = [];
    cities: CodeValueModal[][] = [
        this.citiesInPrimaryLeftToRightLanguage,
        this.citiesInSecondaryRightToLeftLanguage,
    ];
    zonesInPrimaryLeftToRightLanguage: CodeValueModal[] = [];
    zonesInSecondaryRightToLeftLanguage: CodeValueModal[] = [];
    zones: CodeValueModal[][] = [
        this.zonesInPrimaryLeftToRightLanguage,
        this.zonesInSecondaryRightToLeftLanguage,
    ];
    locations = [this.regions, this.provinces, this.cities, this.zones];
    codeValue: CodeValueModal[] = [];
    subscriptions: Subscription[] = [];
    identityData = [];
    uiFields = [];
    uiFieldsGroups = [];
    uiFieldsGroupsErrorStatus = [];
    invalidFields = [];
    uiFieldsGroupsPanelsOpenStates = {};
    isPrimaryLeftToRightLanguageUserForm = false;
    isSecondaryRightToLeftLanguageUserForm = false;
    primaryLeftToRightLanguagDropDownFields = {};
    secondaryRightToLeftLanguageDropDownLabels = {};
    locationHeirarchy = [];
    civilRegistryNumbersConditionsToShow = [];
    citizenConditionsToShow = [];
    foriegnerIdentityCardConditionsToShow = [];
    placeOfBirthConditionsToShow = []
    referenceCNIENumberConditionsToShow = [];
    guardianConditionsToShow = [];
    validationMessage: any;
    dynamicFields = [];
    private _keyboardRef: MatKeyboardRef<MatKeyboardComponent>;
    @ViewChildren("keyboardRef", {read: ElementRef})
    private _attachToElementMesOne: any;


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * @description HighMinarets : attributs added for feature Custom Demographics-Details Visibility & Requiredness Rules.
     */
    oldFlagidcsInFormForShowingCivilRegisterNumberInput;
    oldDateOfBirthInFormForShowingCivilRegisterNumberInput;
    oldResidenceStatusValueInFormForShowingReferenceCNIENumberInput;
    oldAgeValueInFormForShowingReferenceCNIENumberInput;
    oldResidenceStatusValueInFormForShowingCitizenFields;
    oldResidenceStatusValueInFormForShowingForiegnerIdentityCardFields;
    oldFlagForiegnerIdentityCardValueInFormForShowingForiegnerIdentityCardFields;
    oldflagbValueInFormForShowingPlaceOfBirth;
    oldAgeValueInFormForShowingGuardianFields;


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * @description Creates an instance of DemographicComponent.
     * @param {Router} router
     * @param {RegistrationService} regService
     * @param {DataStorageService} dataStorageService
     * @param {BookingService} bookingService
     * @param {ConfigService} configService
     * @param {TranslateService} translate
     * @param {MatDialog} dialog
     * @memberof DemographicComponent
     */
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private regService: RegistrationService,
        private dataStorageService: DataStorageService,
        private configService: ConfigService,
        private translate: TranslateService,
        public dialog: MatDialog,
        private matKeyboardService: MatKeyboardService,
        private loggerService: LogService, // private errorService: ErrorService
        private cdr: ChangeDetectorRef
    ) {
        super(dialog);
        this.translate.use(localStorage.getItem("langCode"));
        this.subscriptions.push(
            this.regService
                .getMessage()
                .subscribe((message) => (this.message = message))
        );
    }

    /**
     * @description This is the angular life cycle hook called upon loading the component.
     *
     * @memberof DemographicComponent
     */
    async ngOnInit() {
        this.yesterdayDate = this.getYesterdayDate();
        this.initialization();
        await this.getIdentityJsonFormat();
        this.config = this.configService.getConfig();
        this.getPrimaryLeftToRightLabels();
        await this.getConsentMessage();
        this.validationMessage = appConstants.errorMessages;
        let factory = new LanguageFactory(this.secondaryRightToLeftLanguage);
        let response = factory.getCurrentlanguage();
        this.demographicSecondaryRightToLeftLanguagelabels = response["demographic"];
        this.initForm();
        await this.setFormControlValues();
        if (!this.dataModification) {
            if (this.isConsentMessage) this.consentDeclaration();
        }
        /**
         * @description HighMinarets : added for feature Custom Demographics-Details Visibility & Requiredness Rules.
         */
        this.initAttributsOfOldValuesInFormForImplementCustomVisibilityRequirednessRulesToNull();
        this.leftToRightUserForm.get('civilRegistryNumber').valueChanges.subscribe((value) => {
            if (this.leftToRightUserForm.get('civilRegistryNumber').value && this.leftToRightUserForm.get('parentOrGuardianUIN').value) {
                const isNotSameCivilRegistryNumberAsParentOrGuardianUIN = (this.leftToRightUserForm.get('civilRegistryNumber').value !== this.leftToRightUserForm.get('parentOrGuardianUIN').value);
                if ((isNotSameCivilRegistryNumberAsParentOrGuardianUIN && !this.leftToRightUserForm.get('parentOrGuardianUIN').valid) || (!isNotSameCivilRegistryNumberAsParentOrGuardianUIN && this.leftToRightUserForm.get('parentOrGuardianUIN').valid)) {
                    this.leftToRightUserForm.get('parentOrGuardianUIN').updateValueAndValidity();
                    this.rightToLeftUserForm.get('parentOrGuardianUIN').updateValueAndValidity();
                    this.rightToLeftUserForm.get('civilRegistryNumber').updateValueAndValidity();
                }
            }
        });
        this.leftToRightUserForm.get('parentOrGuardianUIN').valueChanges.subscribe((value) => {
            if (this.leftToRightUserForm.get('civilRegistryNumber').value && this.leftToRightUserForm.get('parentOrGuardianUIN').value) {
                const isNotSameCivilRegistryNumberAsParentOrGuardianUIN = (this.leftToRightUserForm.get('civilRegistryNumber').value !== this.leftToRightUserForm.get('parentOrGuardianUIN').value);
                if ((isNotSameCivilRegistryNumberAsParentOrGuardianUIN && !this.leftToRightUserForm.get('civilRegistryNumber').valid) || (!isNotSameCivilRegistryNumberAsParentOrGuardianUIN && this.leftToRightUserForm.get('civilRegistryNumber').valid)) {
                    this.leftToRightUserForm.get('civilRegistryNumber').updateValueAndValidity();
                    this.rightToLeftUserForm.get('civilRegistryNumber').updateValueAndValidity();
                    this.rightToLeftUserForm.get('parentOrGuardianUIN').updateValueAndValidity();
                }
            }
        });
        this.setInitIsErrorInUiFieldsGroups();
    }

    /**
     * TODO @Youssef : à documenter !
     * @description HighMinarets : added for feature Custom Demographics-Details Visibility & Requiredness Rules.
     */
    ngAfterViewChecked(): void {
        this.setIsShownCivilRegisterNumberInputInFormIfValuesInFormChange();
        this.setIsShownCitizenFieldsInputsInFormIfValuesInFormChange();
        this.setIsShownPlaceOfBirthInputsInFormIfValuesInFormChange();
        this.setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfValuesInFormChange();
        this.setIsShownGuardianFieldsInputsInFormIfValuesInFormChange();
        this.setIsShownForiegnerIdentityCardInFormIfValuesInFormChange();
        this.setRequirednessToAllFields();
        this.setIsErrorInUiFieldsGroups();
        this.setFieldsOfBirthDateFromReactiveForm();
        this.cdr.detectChanges();
    }

    getPreRegId() {
        return new Promise((resolve) => {
            this.activatedRoute.params.subscribe((param) => {
                this.preRegId = param["appId"];
                resolve(true);
            });
        });
    }

    getUserInfo(preRegId) {
        return new Promise((resolve) => {
            this.dataStorageService.getUser(preRegId).subscribe((response) => {
                if (response[appConstants.RESPONSE]) {
                    this.user.request = response[appConstants.RESPONSE];
                    resolve(response[appConstants.RESPONSE]);
                }
            });
        });
    }

    /**
     * @description This method will get the Identity Schema Json
     *
     *
     */

    async getIdentityJsonFormat() {
        return new Promise((resolve, reject) => {
            this.dataStorageService.getIdentityJson().subscribe((response) => {
                // this.identityData = response["identity"];
                // this.locationHeirarchy = [...response["locationHierarchy"]];
                this.identityData = response["response"]["idSchema"]["identity"];
                this.locationHeirarchy = [...response["response"]["idSchema"]["locationHierarchy"],];
                this.civilRegistryNumbersConditionsToShow = response["response"]["idSchema"]["civilRegistryNumberConditionsToShow"];
                this.citizenConditionsToShow = response["response"]["idSchema"]["citizenConditionsToShow"];
                this.foriegnerIdentityCardConditionsToShow = response["response"]["idSchema"]["foriegnerIdentityCardConditionsToShow"];
                this.placeOfBirthConditionsToShow = response["response"]["idSchema"]["placeOfBirthConditionsToShow"];
                this.referenceCNIENumberConditionsToShow = response["response"]["idSchema"]["referenceCNIENumberConditionsToShow"];
                this.guardianConditionsToShow = response["response"]["idSchema"]["guardianConditionsToShow"];
                localStorage.setItem("locationHierarchy", JSON.stringify(this.locationHeirarchy));
                this.identityData.forEach((obj) => {
                    if (
                        obj.inputRequired === true &&
                        obj.controlType !== null &&
                        !(obj.controlType === "fileupload")
                    ) {
                        this.uiFields.push(obj);
                    }
                });
                this.dynamicFields = this.uiFields.filter(
                    (fields) =>
                        fields.controlType === "dropdown" && fields.fieldType === "dynamic"
                );
                this.setDropDownArrays();
                this.setLocations();
                this.setGender();
                this.setResident();
                this.setDynamicFieldValues();
                this.uiFieldsGroups = Array.from(new Set(this.uiFields.map(field => field.group)));
                this.uiFieldsGroups.forEach(group => {
                    this.uiFieldsGroupsPanelsOpenStates[group] = false;
                });
                resolve(true);
            });
        });
    }

    /**
     * @description This will initialize the demographic form and
     * if update set the inital values of the attributes.
     *
     *
     * @memberof DemographicComponent
     */
    async initForm() {
        this.uiFields.forEach((control, index) => {
            this.leftToRightUserForm.addControl(control.id, new FormControl(""));
            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                this.rightToLeftUserForm.addControl(control.id, new FormControl(""));
            }
            if (control.required) {
                this.leftToRightUserForm.controls[`${control.id}`].setValidators(
                    Validators.required
                );
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${control.id}`].setValidators(
                        Validators.required
                    );
                }
            }
            if (control.validators !== null && control.validators.length > 0) {
                this.leftToRightUserForm.controls[`${control.id}`].setValidators([
                    Validators.pattern(control.validators[0].validator),
                ]);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${control.id}`].setValidators([
                        Validators.pattern(control.validators[0].validator),
                    ]);
                }
            }
            // TODO @Youssef : à rectifier la condition !!!
            if (control.checksum) {
                this.leftToRightUserForm.controls[`${control.id}`].setValidators([this.validateVerhoeffChecksumValidatorFn()]);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${control.id}`].setValidators([this.validateVerhoeffChecksumValidatorFn()]);
                }
            }
            if (control.required &&
                control.validators !== null &&
                control.validators.length > 0 &&
                control.controlType === 'date'
            ) {
                this.leftToRightUserForm.controls[`${control.id}`].setValidators([
                    Validators.required,
                ]);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${control.id}`].setValidators([
                        Validators.required,
                    ]);
                }
            } else if (
                control.required &&
                control.validators !== null &&
                control.validators.length > 0
            ) {
                this.leftToRightUserForm.controls[`${control.id}`].setValidators([
                    Validators.required,
                    Validators.pattern(control.validators[0].validator),
                ]);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${control.id}`].setValidators([
                        Validators.required,
                        Validators.pattern(control.validators[0].validator),
                    ]);
                }
            }
            if (this.uiFields.length === index + 1) {
                this.isPrimaryLeftToRightLanguageUserForm = true;
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.isSecondaryRightToLeftLanguageUserForm = true;
                }
            }
            if (control.controlType === 'date') {
                this.leftToRightUserForm.addControl('dayOfBirth', new FormControl(""));
                this.leftToRightUserForm.controls['dayOfBirth'].setValidators(null);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.addControl('dayOfBirth', new FormControl(""));
                    this.rightToLeftUserForm.controls['dayOfBirth'].setValidators(null);
                }
                this.leftToRightUserForm.addControl('monthOfBirth', new FormControl(""));
                this.leftToRightUserForm.controls['monthOfBirth'].setValidators(null);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.addControl('monthOfBirth', new FormControl(""));
                    this.rightToLeftUserForm.controls['monthOfBirth'].setValidators(null);
                }
                this.leftToRightUserForm.addControl('yearOfBirth', new FormControl(""));
                this.leftToRightUserForm.controls['yearOfBirth'].setValidators(
                    Validators.required
                );
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.addControl('yearOfBirth', new FormControl(""));
                    this.rightToLeftUserForm.controls['yearOfBirth'].setValidators(
                        Validators.required
                    );
                }
                this.leftToRightUserForm.controls['dateOfBirth'].setValidators(null);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls['dateOfBirth'].setValidators(null);
                }
            }
        });
    }

    /**
     * @description sets the dropdown arrays for primary and secondary forms.
     */
    setDropDownArrays() {
        this.getIntialDropDownArrays();
    }

    /**
     * @description this method initialise the primary and secondary dropdown array for the
     *  dropdown fields.
     */
    getIntialDropDownArrays() {
        this.uiFields.forEach((control) => {
            if (control.controlType === "dropdown") {
                this.primaryLeftToRightLanguagDropDownFields[control.id] = [];
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.secondaryRightToLeftLanguageDropDownLabels[control.id] = [];
                }
            }
        });
    }

    /**

     *
     * @description this method is to make dropdown api calls
     *
     * @param controlObject is Identity Type Object
     *  ex: { id : 'region',controlType: 'dropdown' ...}
     */
    dropdownApiCall(controlObject: any) {
        if (this.locationHeirarchy.includes(controlObject.id)) {
            if (this.locationHeirarchy.indexOf(controlObject.id) !== 0) {
                this.primaryLeftToRightLanguagDropDownFields[controlObject.id] = [];
                const location = this.locationHeirarchy.indexOf(controlObject.id);
                let parentLocation = this.locationHeirarchy[location - 1];
                let locationCode = this.leftToRightUserForm.get(`${parentLocation}`).value;
                if (controlObject.id === 'commun') {
                    parentLocation = 'province';
                    locationCode = `COM${this.leftToRightUserForm.get(parentLocation).value}`;
                }
                this.loadLocationData(locationCode, controlObject.id);
            }
        }
    }

    /**
     * @description this method will copy dropdown values from its
     * respective dropdown inputs to it's ssecondary input
     *
     * @param fieldName input field
     * @param fieldValue input field value
     */
    copyDataToSecondaryForm(fieldName: string, fieldValue: string) {
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            this.secondaryRightToLeftLanguageDropDownLabels[fieldName].forEach((element) => {
                if (element.valueCode === fieldValue) {
                    this.rightToLeftUserForm.controls[fieldName].setValue(fieldValue);
                }
            });
        }
    }

    /**

     * @description This method will copy non dropdown field values
     * from primary form to secondary form
     *
     * @param fieldName input field name
     * @param event event type
     */
    copyToSecondaryFormNonDropDown(fieldName: string, event: Event) {
        const transliterate = [...appConstants.TRANSLITERATE_FIELDS];
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            if (transliterate.includes(fieldName)) {
                // if (event.type === "focusout") {
                //     this.onTransliteration(fieldName, fieldName);
                // }
            } else {
                this.rightToLeftUserForm.controls[`${fieldName}`].setValue(
                    this.leftToRightUserForm.controls[`${fieldName}`].value
                );
            }
        }
    }

    /**
     * @description This is to reset the input values
     * when the parent input value is changed
     *
     * @param fieldName location dropdown control Name
     */
    resetLocationFields(fieldName: string) {
        if (this.locationHeirarchy.includes(fieldName)) {
            const locationFields = [...this.locationHeirarchy];
            const index = locationFields.indexOf(fieldName);
            for (let i = index + 1; i < locationFields.length; i++) {
                this.leftToRightUserForm.controls[locationFields[i]].setValue("");
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[locationFields[i]].setValue("");
                }
                this.leftToRightUserForm.controls[locationFields[i]].markAsUntouched();
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[locationFields[i]].markAsUntouched();
                }
            }
        }
    }

    /**
     * @description This is get the location the input values
     *
     * @param fieldName location dropdown control Name
     * @param locationCode location code of parent location
     */
    loadLocationData(locationCode: string, fieldName: string) {
        if (fieldName && fieldName.length > 0) {
            this.dataStorageService
                .getLocationImmediateHierearchy(this.primaryLeftToRightLanguage, locationCode)
                .subscribe(
                    (response) => {
                        if (response[appConstants.RESPONSE]) {
                            response[appConstants.RESPONSE][
                                appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                                ].forEach((element) => {
                                let codeValueModal: CodeValueModal = {
                                    valueCode: element.code,
                                    valueName: element.name,
                                    languageCode: this.primaryLeftToRightLanguage,
                                };

                                this.primaryLeftToRightLanguagDropDownFields[`${fieldName}`].push(codeValueModal);
                            });
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                this.dataStorageService
                    .getLocationImmediateHierearchy(this.secondaryRightToLeftLanguage, locationCode)
                    .subscribe(
                        (response) => {
                            if (response[appConstants.RESPONSE]) {
                                response[appConstants.RESPONSE][
                                    appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                                    ].forEach((element) => {
                                    let codeValueModal: CodeValueModal = {
                                        valueCode: element.code,
                                        valueName: element.name,
                                        languageCode: this.secondaryRightToLeftLanguage,
                                    };
                                    this.secondaryRightToLeftLanguageDropDownLabels[`${fieldName}`].push(
                                        codeValueModal
                                    );
                                });
                            }
                        },
                        (error) => {
                            console.log(error);
                        }
                    );
            }
        }
    }

    getDynamicFieldValues(lang) {
        return new Promise((resolve) => {
            this.dataStorageService
                .getDynamicFieldsandValues(lang)
                .subscribe((response) => {
                    let dynamicField = response[appConstants.RESPONSE]["data"];
                    this.dynamicFields.forEach((field) => {
                        dynamicField.forEach((res) => {
                            if (field.id === res.name && res.langCode === this.primaryLeftToRightLanguage) {
                                this.filterOnLangCode(
                                    this.primaryLeftToRightLanguage,
                                    res.name,
                                    res["fieldVal"]
                                );
                            }
                            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                                if (
                                    field.id === res.name &&
                                    res.langCode === this.secondaryRightToLeftLanguage
                                ) {
                                    this.filterOnLangCode(
                                        this.secondaryRightToLeftLanguage,
                                        res.name,
                                        res["fieldVal"]
                                    );
                                }
                            }
                        });
                    });
                });
            resolve(true);
        });
    }

    /**
     * @description This set the initial values for the form attributes.
     *
     * @memberof DemographicComponent
     */
    async setFormControlValues() {
        if (this.primaryLeftToRightLanguage === this.secondaryRightToLeftLanguage) {
            this.languages.pop();
            this.isReadOnly = true;
        }
        if (!this.dataModification) {
            this.uiFields.forEach((control) => {
                this.leftToRightUserForm.controls[control.id].setValue("");
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[control.id].setValue("");
                }
            });
        } else {
            let index = 0;
            let secondaryIndex = 1;
            this.loggerService.info("user", this.user);
            if (this.user.request === undefined) {
                await this.getUserInfo(this.preRegId);
            }
            /*if (
              this.user.request.demographicDetails.identity.fullName[0].language !==
              this.primaryLang
            ) {
              index = 1;
              secondaryIndex = 0;
            }*/
            if (this.primaryLeftToRightLanguage === this.secondaryRightToLeftLanguage) {
                index = 0;
                secondaryIndex = 0;
            }
            this.uiFields.forEach((control) => {
                if (
                    control.controlType !== "dropdown" &&
                    !appConstants.TRANSLITERATE_FIELDS.includes(control.id)
                ) {
                    if (control.id === "dateOfBirth") {
                        this.setDateOfBirth();
                    } else {
                        if (typeof (this.user.request.demographicDetails.identity[`${control.id}`]) == "object") {
                            this.leftToRightUserForm.controls[`${control.id}`].setValue(
                                this.user.request.demographicDetails.identity[`${control.id}`][0].value
                            );
                        } else {
                            this.leftToRightUserForm.controls[`${control.id}`].setValue(
                                this.user.request.demographicDetails.identity[`${control.id}`]
                            );
                        }
                        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                            this.rightToLeftUserForm.controls[`${control.id}`].setValue(
                                this.user.request.demographicDetails.identity[`${control.id}`]
                            );
                        }
                    }
                } else if (appConstants.TRANSLITERATE_FIELDS.includes(control.id)) {
                    if (this.user.request.demographicDetails.identity[control.id]) {
                        this.leftToRightUserForm.controls[`${control.id}`].setValue(
                            this.user.request.demographicDetails.identity[control.id][index]
                                .value
                        );
                    }
                    if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage && this.user.request.demographicDetails.identity[control.id]) {
                        this.rightToLeftUserForm.controls[`${control.id}`].setValue(
                            this.user.request.demographicDetails.identity[control.id][secondaryIndex].value
                        );
                    }
                } else if (control.controlType === "dropdown") {
                    if (this.locationHeirarchy.includes(control.id)) {
                        this.dropdownApiCall(control);
                        if (control.type === "string") {
                            this.leftToRightUserForm.controls[`${control.id}`].setValue(
                                this.user.request.demographicDetails.identity[`${control.id}`]
                            );
                            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                                this.rightToLeftUserForm.controls[`${control.id}`].setValue(
                                    this.user.request.demographicDetails.identity[`${control.id}`]
                                );
                            }
                        } else if (control.type === 'simpleType') {
                            this.leftToRightUserForm.controls[`${control.id}`].setValue(
                                this.user.request.demographicDetails.identity[control.id][index]
                                    .value
                            );
                            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                                this.rightToLeftUserForm.controls[`${control.id}`].setValue(
                                    this.user.request.demographicDetails.identity[control.id][
                                        secondaryIndex
                                        ].value
                                );
                            }
                        }
                    } else {
                        this.leftToRightUserForm.controls[`${control.id}`].setValue(
                            (this.user.request.demographicDetails.identity[control.id]) ?
                                this.user.request.demographicDetails.identity[control.id][index]
                                    .value : null
                        );
                        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                            this.rightToLeftUserForm.controls[`${control.id}`].setValue(
                                (this.user.request.demographicDetails.identity[control.id]) ?
                                    this.user.request.demographicDetails.identity[control.id][secondaryIndex].value : null
                            );
                        }
                    }
                }
            });
        }
    }

    setDateOfBirth() {
        this.dayOfBirth = this.user.request.demographicDetails.identity["dateOfBirth"];
        this.year = this.user.request.demographicDetails.identity["yearOfBirth"];
        this.month = this.user.request.demographicDetails.identity["monthOfBirth"];
        this.date = this.user.request.demographicDetails.identity["dayOfBirth"];
        this.currentAge = this.calculateAge(this.dayOfBirth).toString();
        this.leftToRightUserForm.controls[`yearOfBirth`].setValue(this.year);
        this.leftToRightUserForm.controls[`monthOfBirth`].setValue(this.month);
        this.leftToRightUserForm.controls[`dayOfBirth`].setValue(this.date);
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            this.dayOfBirthForSecondaryRightToLeftForm = `${this.month}/${this.date}/${this.year}`
            this.rightToLeftUserForm.controls[`yearOfBirth`].setValue(this.year);
            this.rightToLeftUserForm.controls[`monthOfBirth`].setValue(this.month);
            this.rightToLeftUserForm.controls[`dayOfBirth`].setValue(this.date);
        }
    }

    // setDateOfBirthFromReactiveForm() {
    //     const dateOfBirthConrolValue = this.userForm.get(`dateOfBirth`).value;
    //     if ((typeof dateOfBirthConrolValue) === 'object') {
    //         const dateOfBirthObject = (dateOfBirthConrolValue as Date);
    //         this.year = dateOfBirthObject.getFullYear().toString();
    //         const month = (dateOfBirthObject.getMonth() + 1);
    //         this.month = (month < 10) ? `0${month.toString()}` : month.toString();
    //         const day = dateOfBirthObject.getDate();
    //         this.date = (day < 10) ? `0${day.toString()}` : day.toString();
    //     } else {
    //         [this.year, this.month, this.date] = dateOfBirthConrolValue.split('-');
    //     }
    //     this.dayOfBirth = `${this.year}/${this.month}/${this.date}`;
    //     this.currentAge = this.calculateAge(this.dayOfBirth).toString();
    //     if (this.primaryLang !== this.secondaryLang) {
    //         this.dayOfBirthForsecondaryForm = `${this.date}/${this.month}/${this.year}`
    //         this.transUserForm.controls[`dateOfBirth`].setValue(
    //             this.userForm.get(`dateOfBirth`).value
    //         );
    //     }
    // }


    /**
     * @description This is called whenever there is a change in Date of birth field and accordingly age
     * will get calculate.
     *
     * @memberof DemographicComponent
     */
    onDOBChange() {
        this.DOB_PATTERN = this.config[appConstants.CONFIG_KEYS.mosip_regex_DOB];
        if (!this.year) {
            this.currentAge = null;
            return;
        }
        const selectedMonth = (this.month && this.month.replace(' ', '')) ? this.month : '01';
        const selectedDay = (this.date && this.date.replace(' ', '')) ? this.date : '01';
        this.dayOfBirth = this.year + "/" + selectedMonth + "/" + selectedDay;
        const dobRegex = new RegExp(this.DOB_PATTERN);
        if (dobRegex.test(this.dayOfBirth)) {
            this.currentAge = this.calculateAge(this.dayOfBirth).toString();
            this.age.nativeElement.value = this.currentAge;
            if (this.dataModification) {
                this.hasDobChanged();
            }
        } else {
            this.leftToRightUserForm.controls["dateOfBirth"].markAsTouched();
            this.leftToRightUserForm.controls["dateOfBirth"].setErrors({
                incorrect: true,
            });
            this.currentAge = "";
            this.age.nativeElement.value = "";
        }
    }

    /**
     * @description This method calculates the age for the given date.
     *
     * @param {Date} bDay
     * @returns
     * @memberof DemographicComponent
     */

    calculateAge(bDay) {
        const now = new Date();
        const born = new Date(bDay);
        const years = Math.floor(
            (now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (years > 150) {
            this.leftToRightUserForm.controls["dateOfBirth"].markAsTouched();
            this.leftToRightUserForm.controls["dateOfBirth"].setErrors({
                incorrect: true,
            });
            this.date = "";
            this.month = "";
            this.year = "";
            return "";
        } else {
            return (years === 0 || (years && !isNaN(years))) ? years : '';
        }
    }

    /**
     * @description This is to get the top most location Hierarchy, i.e. `Country Code`
     *
     * @returns
     * @memberof DemographicComponent
     */
    getLocationMetadataHirearchy() {
        return new Promise((resolve) => {
            const uppermostLocationHierarchy = this.dataStorageService.getLocationMetadataHirearchy();
            this.uppermostLocationHierarchy = uppermostLocationHierarchy;
            resolve(this.uppermostLocationHierarchy);
        });
    }

    /**
     * @description On click of back button the user will be navigate to dashboard.
     *
     * @memberof DemographicComponent
     */
    onBack() {
        let url = "";
        url = Utils.getURL(this.router.url, "dashboard", 2);
        this.router.navigate([url]);
    }

    /**
     * @description This method is to format the date event to yyyy/mm/dd format
     *
     * @param event date event
     */
    dateEvent(event) {
        const date = new Date(event.value);
        const year = date.getFullYear();
        let month = date.getMonth() + 1;
        const datee = date.getDate();

        let monthOfYear = "";
        let dateOfMonth = "";
        if (month < 10) {
            monthOfYear = "0" + month;
        } else {
            monthOfYear = month.toString();
        }

        if (datee < 10) {
            dateOfMonth = "0" + datee;
        } else {
            dateOfMonth = datee.toString();
        }

        const formattedDate = `${year}/${monthOfYear}/${dateOfMonth}`;
        this.leftToRightUserForm.controls["dateOfBirth"].setValue(formattedDate);
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            this.rightToLeftUserForm.controls["dateOfBirth"].setValue(formattedDate);
        }
        if (this.dataModification) {
            this.hasDobChanged();
        }
    }

    /**
     * @description To mark a input as readonly or not
     *
     *
     * @param field Input control name
     */

    getReadOnlyfields(field: string) {
        const transliterate = [...appConstants.TRANSLITERATE_FIELDS];
        if (transliterate.includes(field)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * @description This is used for the tranliteration.
     *
     * @param {FormControl} fromControl
     * @param {*} toControl
     * @memberof DemographicComponent
     */

    onTransliteration(fromControl: any, toControl: any) {
        if (this.leftToRightUserForm.controls[`${fromControl}`].value) {
            const request: any = {
                from_field_lang: this.primaryLeftToRightLanguage,
                from_field_value: this.leftToRightUserForm.controls[`${fromControl}`].value,
                to_field_lang: this.secondaryRightToLeftLanguage,
            };
            if (this.primaryLeftToRightLanguage === this.secondaryRightToLeftLanguage) {
                this.rightToLeftUserForm.controls[toControl].patchValue(
                    this.leftToRightUserForm.controls[`${fromControl}`].value
                );
                return;
            }

            this.subscriptions.push(
                this.dataStorageService.getTransliteration(request).subscribe(
                    (response) => {
                        if (response[appConstants.RESPONSE])
                            this.rightToLeftUserForm.controls[`${toControl}`].patchValue(
                                response[appConstants.RESPONSE].to_field_value
                            );
                        else {
                            this.onError(this.errorlabels.error, "");
                        }
                    },
                    (error) => {
                        this.onError(this.errorlabels.error, error);
                        this.loggerService.error(error);
                    }
                )
            );
        } else {
            this.rightToLeftUserForm.controls[`${toControl}`].patchValue("");
        }
    }

    /**
     * @description This is called to submit the user form in case od modify or create.
     *
     * @memberof DemographicComponent
     */
    onSubmit() {
        this.uiFields.forEach((element) => {
            this.leftToRightUserForm.controls[`${element.id}`].markAsTouched();
            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                this.rightToLeftUserForm.controls[`${element.id}`].markAsTouched();
            }
        });
        const isCorrectGuardienIdentity = this.verifyAndSetErrornesToGuardienIdentity();
        if (this.leftToRightUserForm.valid && this.rightToLeftUserForm.valid && isCorrectGuardienIdentity) {
            this.leftToRightUserForm.get('dateOfBirth').setValue(this.dayOfBirth);
            this.rightToLeftUserForm.get('dateOfBirth').setValue(this.dayOfBirth);
            const identity = this.createIdentityJSONDynamic();
            const request = this.createRequestJSON(identity);
            request.demographicDetails.identity.yearOfBirth = (this.year) ? this.year : null;
            request.demographicDetails.identity.monthOfBirth = (this.month && this.month.replace(' ', '')) ? this.month : null;
            request.demographicDetails.identity.dayOfBirth = (this.date && this.date.replace(' ', '')) ? this.date : null;
            const responseJSON = this.createResponseJSON(identity);
            this.dataUploadComplete = false;
            if (this.dataModification) {
                this.subscriptions.push(
                    this.dataStorageService.updateUser(request, this.preRegId).subscribe(
                        (response) => {
                            if (
                                (response[appConstants.NESTED_ERROR] === null &&
                                    response[appConstants.RESPONSE] === null) ||
                                response[appConstants.NESTED_ERROR] !== null
                            ) {
                                let message = "";
                                if (
                                    response[appConstants.NESTED_ERROR][0][
                                        appConstants.ERROR_CODE
                                        ] === appConstants.ERROR_CODES.invalidPin
                                ) {
                                    message = this.formValidation(response);
                                } else message = this.errorlabels.error;
                                this.onError(message, "");
                                return;
                            }
                            this.onSubmission();
                        },
                        (error) => {
                            this.loggerService.error(error);
                            this.onError(this.errorlabels.error, error);
                        }
                    )
                );
            } else {
                this.subscriptions.push(
                    this.dataStorageService.addUser(request).subscribe(
                        (response) => {
                            if (
                                (response[appConstants.NESTED_ERROR] === null &&
                                    response[appConstants.RESPONSE] === null) ||
                                response[appConstants.NESTED_ERROR] !== null
                            ) {
                                this.loggerService.error(JSON.stringify(response));
                                let message = "";
                                if (
                                    response[appConstants.NESTED_ERROR] &&
                                    response[appConstants.NESTED_ERROR][0][
                                        appConstants.ERROR_CODE
                                        ] === appConstants.ERROR_CODES.invalidPin
                                ) {
                                    message = this.formValidation(response);
                                } else message = this.errorlabels.error;
                                this.onError(message, "");
                                return;
                            } else {
                                this.preRegId =
                                    response[appConstants.RESPONSE].preRegistrationId;
                            }
                            this.onSubmission();
                        },
                        (error) => {
                            this.loggerService.error(error);
                            this.onError(this.errorlabels.error, error);
                        }
                    )
                );
            }
        } else {
            this.setInvalidFieldsInAllGroups();
            this.dialog.open(DialougComponent, {
                width: "350px",
                data: {
                    case: "ERROR",
                    title: this.demographicPrimaryLeftToRightLanguageLabels['invalidFormPopupTitle'],
                    message: this.demographicPrimaryLeftToRightLanguageLabels['invalidFormPopupMessage']
                },
            });
        }
    }


    formValidation(response: any) {
        const str = response[appConstants.NESTED_ERROR][0]["message"];
        const attr = str.substring(str.lastIndexOf("/") + 1);
        let message = this.errorlabels[attr];
        this.leftToRightUserForm.controls[attr].setErrors({
            incorrect: true,
        });
        return message;
    }

    /**
     * @description After sumission of the form, the user is route to file-upload or preview page.
     *
     * @memberof DemographicComponent
     */
    onSubmission() {
        this.canDeactivateFlag = false;
        this.checked = true;
        this.dataUploadComplete = true;
        let url = "";
        if (localStorage.getItem("modifyUserFromPreview") === "true") {
            url = Utils.getURL(this.router.url, "summary");
            localStorage.setItem("modifyUserFromPreview", "false");
            this.router.navigateByUrl(url + `/${this.preRegId}/preview`);
        } else {
            url = Utils.getURL(this.router.url, "file-upload");
            localStorage.removeItem("addingUserFromPreview");
            this.router.navigate([url, this.preRegId]);
        }
    }

    hasDobChanged() {
        const currentDob = this.user.request.demographicDetails.identity
            .dateOfBirth;
        const changedDob = this.leftToRightUserForm.controls["dateOfBirth"].value;
        const currentDobYears = this.calculateAge(currentDob);
        const changedDobYears = this.calculateAge(changedDob);
        const ageToBeAdult = this.config[appConstants.CONFIG_KEYS.mosip_adult_age];
        if (this.showPreviewButton) {
            if (
                (currentDobYears < ageToBeAdult && changedDobYears < ageToBeAdult) ||
                (currentDobYears > ageToBeAdult && changedDobYears > ageToBeAdult)
            ) {
                this.showPreviewButton = true;
            } else {
                this.showPreviewButton = false;
                localStorage.setItem("modifyUserFromPreview", "false");
            }
        }
    }

    /**
     * @description This method is called to open a virtual keyvboard in the specified languaged.
     *
     * @param {string} formControlName
     * @param {number} index
     * @memberof DemographicComponent
     */
    onKeyboardDisplay(formControlName: string, index: number) {
        let control: AbstractControl;
        let lang: string;
        if (this.leftToRightUserForm.controls[formControlName]) {
            control = this.leftToRightUserForm.controls[formControlName];
            lang = appConstants.virtual_keyboard_languages[this.primaryLeftToRightLanguage];
        } else {
            control = this.rightToLeftUserForm.controls[formControlName];
            lang = appConstants.virtual_keyboard_languages[this.secondaryRightToLeftLanguage];
        }
        if (this.oldKeyBoardIndex == index && this.matKeyboardService.isOpened) {
            this.matKeyboardService.dismiss();
        } else {
            let el: ElementRef;
            this.oldKeyBoardIndex = index;
            el = this._attachToElementMesOne._results[index];
            el.nativeElement.focus();
            this._keyboardRef = this.matKeyboardService.open(lang);
            this._keyboardRef.instance.setInputInstance(el);
            this._keyboardRef.instance.attachControl(control);
        }
    }

    scrollUp(ele: HTMLElement) {
        ele.scrollIntoView({behavior: "smooth"});
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    /**

     * @description This will return the json object of label of demographic in the primary language.
     *
     * @private
     * @returns the `Promise`
     * @memberof DemographicComponent
     */
    private getPrimaryLeftToRightLabels() {
        let factory = new LanguageFactory(this.primaryLeftToRightLanguage);
        let response = factory.getCurrentlanguage();
        this.demographicPrimaryLeftToRightLanguageLabels = response["demographic"];
        this.errorlabels = response["error"];
    }

    private getConsentMessage() {
        return new Promise((resolve, reject) => {
            this.subscriptions.push(
                this.dataStorageService.getGuidelineTemplate("consent").subscribe(
                    (response) => {
                        this.isConsentMessage = true;
                        if (response && response[appConstants.RESPONSE])
                            this.consentMessage = response["response"][
                                "templates"
                                ][0].fileText.split("\n");
                        else if (response[appConstants.NESTED_ERROR])
                            this.onError(this.errorlabels.error, "");
                        resolve(true);
                    },
                    (error) => {
                        this.isConsentMessage = false;
                        this.onError(this.errorlabels.error, error);
                    }
                )
            );
        });
    }

    /**
     * @description This method do the basic initialization,
     * if user is opt for updation or creating the new applicaton
     *
     * @private
     * @memberof DemographicComponent
     */
    private async initialization() {
        if (localStorage.getItem("newApplicant") === "true") {
            this.isNewApplicant = true;
        }
        if (localStorage.getItem("modifyUser") === "true") {
            this.dataModification = true;
            await this.getPreRegId();
            await this.getUserInfo(this.preRegId);
            if (localStorage.getItem("modifyUserFromPreview") === "true") {
                this.showPreviewButton = true;
            }
            this.loginId = localStorage.getItem("loginId");
        }
    }

    /**
     * @description This is the consent form, which applicant has to agree upon to proceed forward.
     *
     * @private
     * @memberof DemographicComponent
     */
    private consentDeclaration() {
        let demographicLabels = this.demographicPrimaryLeftToRightLanguageLabels;
        if (this.primaryLanguage === this.secondaryRightToLeftLanguage) {
            demographicLabels = this.demographicSecondaryRightToLeftLanguagelabels;
        }
        if (demographicLabels) {
            const data = {
                case: "CONSENTPOPUP",
                title: demographicLabels.consent.title,
                subtitle: demographicLabels.consent.subtitle,
                message: this.consentMessage,
                checkCondition: demographicLabels.consent.checkCondition,
                acceptButton: demographicLabels.consent.acceptButton,
                alertMessageFirst: demographicLabels.consent.alertMessageFirst,
                alertMessageSecond: demographicLabels.consent.alertMessageSecond,
                alertMessageThird: demographicLabels.consent.alertMessageThird,
            };
            this.dialog.open(DialougComponent, {
                width: "50%",
                data: data,
                disableClose: true,
                direction: this.getOriginalPrimaryDirection()
            });
        }
    }

    /**
     * @description This sets the top location hierachy,
     * if update set the regions also.
     *
     * @private
     * @memberof DemographicComponent
     */
    private async setLocations() {
        await this.getLocationMetadataHirearchy();
        this.loadLocationData(
            this.uppermostLocationHierarchy,
            this.locationHeirarchy[0]
        );
    }

    /**
     * @description This is to get the list of gender available in the master data.
     *
     * @private
     * @memberof DemographicComponent
     */
    private async setGender() {
        await this.getGenderDetails();
        await this.filterOnLangCode(
            this.primaryLeftToRightLanguage,
            appConstants.controlTypeGender,
            this.genders
        );
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            await this.filterOnLangCode(
                this.secondaryRightToLeftLanguage,
                appConstants.controlTypeGender,
                this.genders
            );
        }
    }

    private async setDynamicFieldValues() {
        await this.getDynamicFieldValues(this.primaryLeftToRightLanguage);
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            await this.getDynamicFieldValues(this.secondaryRightToLeftLanguage);
        }
    }

    /**
     * @description This is to get the list of gender available in the master data.
     *
     * @private
     * @memberof DemographicComponent
     */
    private async setResident() {
        await this.getResidentDetails();
        await this.filterOnLangCode(
            this.primaryLeftToRightLanguage,
            appConstants.controlTypeResidenceStatus,
            this.residenceStatus
        );
        if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
            await this.filterOnLangCode(
                this.secondaryRightToLeftLanguage,
                appConstants.controlTypeResidenceStatus,
                this.residenceStatus
            );
        }
    }

    /**
     * @description This will get the gender details from the master data.
     *
     * @private
     * @returns
     * @memberof DemographicComponent
     */
    private getGenderDetails() {
        return new Promise((resolve) => {
            this.subscriptions.push(
                this.dataStorageService.getGenderDetails().subscribe(
                    (response) => {
                        if (response[appConstants.RESPONSE]) {
                            this.genders =
                                response[appConstants.RESPONSE][
                                    appConstants.DEMOGRAPHIC_RESPONSE_KEYS.genderTypes
                                    ];
                            resolve(true);
                        } else {
                            this.onError(this.errorlabels.error, "");
                        }
                    },
                    (error) => {
                        this.loggerService.error("Unable to fetch gender");
                        this.onError(this.errorlabels.error, error);
                    }
                )
            );
        });
    }

    /**
     * @description This will get the residenceStatus
     * details from the master data.
     *
     * @private
     * @returns
     * @memberof DemographicComponent
     */
    private getResidentDetails() {
        return new Promise((resolve) => {
            this.subscriptions.push(
                this.dataStorageService.getResidentDetails().subscribe(
                    (response) => {
                        if (response[appConstants.RESPONSE]) {
                            this.residenceStatus =
                                response[appConstants.RESPONSE][
                                    appConstants.DEMOGRAPHIC_RESPONSE_KEYS.residentTypes
                                    ];
                            resolve(true);
                        } else {
                            this.onError(this.errorlabels.error, "");
                        }
                    },
                    (error) => {
                        this.loggerService.error("Unable to fetch Resident types");
                        this.onError(this.errorlabels.error, error);
                    }
                )
            );
        });
    }

    /**
     * @description This will filter the gender on the basis of langugae code.
     *
     * @private
     * @param {string} langCode
     * @param {*} [genderEntity=[]]
     * @param {*} entityArray
     * @memberof DemographicComponent
     */
    private filterOnLangCode(langCode: string, field: string, entityArray: any) {
        return new Promise((resolve, reject) => {
            if (entityArray) {
                entityArray.filter((element: any) => {
                    if (element.langCode === langCode) {
                        let codeValue: CodeValueModal;
                        if (element.genderName) {
                            codeValue = {
                                valueCode: element.code,
                                valueName: element.genderName,
                                languageCode: element.langCode,
                            };
                        } else if (element.name) {
                            codeValue = {
                                valueCode: element.code,
                                valueName: element.name,
                                languageCode: element.langCode,
                            };
                        } else {
                            codeValue = {
                                valueCode: element.code,
                                valueName: element.value,
                                languageCode: element.langCode,
                            };
                        }
                        if (langCode === this.primaryLeftToRightLanguage) {
                            this.primaryLeftToRightLanguagDropDownFields[field].push(codeValue);
                        } else {
                            this.secondaryRightToLeftLanguageDropDownLabels[field].push(codeValue);
                        }
                        resolve(true);
                    }
                });
            }
        });
    }

    /**
     * @description This is a custom validator, which check for the white spaces.
     *
     * @private
     * @param {FormControl} control
     * @returns
     * @memberof DemographicComponent
     */
    private noWhitespaceValidator(control: FormControl) {
        const isWhitespace = (control.value || "").trim().length === 0;
        const isValid = !isWhitespace;
        return isValid ? null : {whitespace: true};
    }

    /**
     * @description THis is to create the attribute array for the Identity modal.
     *
     * @private
     * @param {string} element
     * @param {IdentityModel} identity
     * @memberof DemographicComponent
     */
    private createAttributeArray(element: string, identity) {
        let attr: any;
        if (typeof identity[element] === "object") {
            let forms = [];
            let formControlNames = "";
            const transliterateField = [...appConstants.TRANSLITERATE_FIELDS];
            if (transliterateField.includes(element)) {
                forms = ["leftToRightUserForm", "rightToLeftUserForm"];
                formControlNames = element;
            } else {
                forms = ["rightToLeftUserForm", "rightToLeftUserForm"];
                formControlNames = element;
            }
            attr = [];
            for (let index = 0; index < this.languages.length; index++) {
                const languageCode = this.languages[index];
                const form = forms[index];
                const controlName = formControlNames;
                attr.push(
                    new AttributeModel(
                        languageCode,
                        this[form].controls[`${controlName}`].value
                    )
                );
            }
        } else if (typeof identity[element] === "string") {
            if (element === appConstants.IDSchemaVersionLabel) {
                attr = this.config[appConstants.CONFIG_KEYS.mosip_idschema_version];
            } else {
                attr = this.leftToRightUserForm.controls[`${element}`].value;
            }
        }
        identity[element] = attr;
    }

    /**
     * @description This method mark all the form control as touched
     *
     * @private
     * @param {FormGroup} formGroup
     * @memberof DemographicComponent
     */
    private markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            if (control.controls) {
                this.markFormGroupTouched(control);
            }
        });
    }

    /**
     * @description This is to create the identity modal
     *
     * @private
     * @returns
     * @memberof DemographicComponent
     */
    private createIdentityJSONDynamic() {
        const identityObj = {IDSchemaVersion: ""};
        this.identityData.forEach((field) => {
            if (
                field.inputRequired === true &&
                !(field.controlType === "fileupload")
            ) {
                if (!field.inputRequired) {
                    identityObj[field.id] = "";
                } else {
                    if (field.type === 'simpleType') {
                        identityObj[field.id] = [];
                    } else if (field.type === 'string') {
                        identityObj[field.id] = "";
                    }
                }
            }
        });

        let keyArr: any[] = Object.keys(identityObj);
        for (let index = 0; index < keyArr.length; index++) {
            const element = keyArr[index];
            this.createAttributeArray(element, identityObj);
        }
        const identityRequest = {identity: identityObj};
        return identityRequest;
    }

    /**
     * @description This is to create the request modal.
     *
     * @private
     * @param {IdentityModel} identity
     * @returns
     * @memberof DemographicComponent
     */
    private createRequestJSON(identity) {
        let langCode = this.primaryLeftToRightLanguage;
        if (this.user.request) {
            langCode = this.user.request.langCode;
        }
        const request = {
            langCode: langCode,
            demographicDetails: identity,
        };
        return request;
    }

    /**
     * @description This is the response modal.
     *
     * @private
     * @param {IdentityModel} identity
     * @returns
     * @memberof DemographicComponent
     */
    private createResponseJSON(identity) {
        let preRegistrationId = "";
        let createdBy = this.loginId;
        let createdDateTime = Utils.getCurrentDate();
        let updatedDateTime = "";
        let langCode = this.primaryLeftToRightLanguage;
        if (this.user.request) {
            preRegistrationId = this.preRegId;
            createdBy = this.user.request.createdBy;
            createdDateTime = this.user.request.createdDateTime;
            updatedDateTime = Utils.getCurrentDate();
            langCode = this.user.request.langCode;
        }
        const req = {
            preRegistrationId: this.preRegId,
            createdBy: createdBy,
            createdDateTime: createdDateTime,
            updatedDateTime: updatedDateTime,
            langCode: langCode,
            demographicDetails: identity,
        };
        return req;
    }

    /**
     * @description This is a dialoug box whenever an erroe comes from the server, it will appear.
     *
     * @private
     * @memberof DemographicComponent
     */
    private onError(message: string, error: any) {
        this.dataUploadComplete = true;
        this.hasError = true;
        this.titleOnError = this.errorlabels.errorLabel;
        if (
            error &&
            error[appConstants.ERROR] &&
            error[appConstants.ERROR][appConstants.NESTED_ERROR] &&
            error[appConstants.ERROR][appConstants.NESTED_ERROR][0].errorCode ===
            appConstants.ERROR_CODES.tokenExpired
        ) {
            message = this.errorlabels.tokenExpiredLogout;
            this.titleOnError = "";
        }
        const body = {
            case: "ERROR",
            title: this.titleOnError,
            message: message,
            yesButtonText: this.errorlabels.button_ok,
        };
        this.dialog.open(DialougComponent, {
            width: "250px",
            data: body,
        });
    }

    @HostListener("blur", ["$event"])
    @HostListener("focusout", ["$event"])
    private _hideKeyboard() {
        if (this.matKeyboardService.isOpened) {
            this.matKeyboardService.dismiss();
        }
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * START OF ALL FEATURES @HighMinarets : Modifications of feature Custom Demographics-Details Visibility & Requiredness Rules.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    * FEATURE @HighMinarets :
    *   Init Attributs Of Old Values in formular to null,
    *   for handling Custom Visibility & Requiredness Rules if concerned values in formular changed.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    initAttributsOfOldValuesInFormForImplementCustomVisibilityRequirednessRulesToNull(): void {
        // this.oldResidenceStatusValueInFormForShowingCivilRegisterNumberInput = null;
        this.oldFlagidcsInFormForShowingCivilRegisterNumberInput = null;
        this.oldDateOfBirthInFormForShowingCivilRegisterNumberInput = null;
        this.oldResidenceStatusValueInFormForShowingReferenceCNIENumberInput = null;
        this.oldAgeValueInFormForShowingReferenceCNIENumberInput = null;
        this.oldResidenceStatusValueInFormForShowingCitizenFields = null;
        this.oldAgeValueInFormForShowingGuardianFields = null;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   TODO @Youssef : à documenter !
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     *
     */
    setVisibilityToField(field, visibilty): void {
        field.visible = visibilty;
        field.inputRequired = visibilty;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   set visibility of civilRegisterNumber input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     *
     */
    setIsShownCivilRegisterNumberInputInFormIfValuesInFormChange(): void {
        const flagidcs = (this.leftToRightUserForm.get('flagidcs')) ? this.leftToRightUserForm.get('flagidcs').value : null;
        if ((this.oldFlagidcsInFormForShowingCivilRegisterNumberInput != flagidcs)) {
            this.oldFlagidcsInFormForShowingCivilRegisterNumberInput = flagidcs;
            this.setIsShownCivilRegisterNumberInputInFormIfFieldsFoundedAndConditionsAreMet(flagidcs);
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownCivilRegisterNumberInputInFormIfValuesInFormChange()
     */
    setIsShownCivilRegisterNumberInputInFormIfFieldsFoundedAndConditionsAreMet(flagidcs): void {
        const resultSearchFieldOfCivilRegisterNumber = this.uiFields.filter(field => field.id === 'birthCertificateNumber');
        const resultSearchFieldOfDigitizedCivilRegisterNumber = this.uiFields.filter(field => field.id === 'civilRegistryNumber');
        if (resultSearchFieldOfDigitizedCivilRegisterNumber.length > 0 && resultSearchFieldOfDigitizedCivilRegisterNumber.length > 0) {
            const fieldOfCivilRegisterNumber = resultSearchFieldOfCivilRegisterNumber[0];
            const fieldOfDigitizedCivilRegisterNumber = resultSearchFieldOfDigitizedCivilRegisterNumber[0];
            if (!flagidcs) {
                this.setVisibilityToField(fieldOfCivilRegisterNumber, false);
                this.setVisibilityToField(fieldOfDigitizedCivilRegisterNumber, false);
            } else {
                this.setIsShownCivilRegisterNumberInputInFormIfConditionsAreMet(
                    fieldOfCivilRegisterNumber,
                    fieldOfDigitizedCivilRegisterNumber,
                    flagidcs
                );
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownCivilRegisterNumberInputInFormIfFieldsFoundedAndConditionsAreMet(...)
     */
    setIsShownCivilRegisterNumberInputInFormIfConditionsAreMet(
        fieldOfCivilRegisterNumber,
        fieldOfDigitizedCivilRegisterNumber,
        flagidcs
    ): void {
        this.civilRegistryNumbersConditionsToShow.forEach(conditionRow => {
            const verifiedFlagidcs = flagidcs === conditionRow.flagidcs;
            if (verifiedFlagidcs) {
                this.setVisibilityToField(fieldOfCivilRegisterNumber, false);
                this.setVisibilityToField(fieldOfDigitizedCivilRegisterNumber, true);
            } else {
                this.setVisibilityToField(fieldOfCivilRegisterNumber, true);
                this.setVisibilityToField(fieldOfDigitizedCivilRegisterNumber, false);
            }
        });
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   set visibility of referenceCNIENumber input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfValuesInFormChange(): void {
        const residenceStatusValueInForm = (this.leftToRightUserForm.get('residenceStatus')) ? this.leftToRightUserForm.get('residenceStatus').value : null;
        const ageInForm = this.currentAge;
        if ((this.oldResidenceStatusValueInFormForShowingReferenceCNIENumberInput != residenceStatusValueInForm) || (this.oldAgeValueInFormForShowingReferenceCNIENumberInput != ageInForm)) {
            this.oldResidenceStatusValueInFormForShowingReferenceCNIENumberInput = residenceStatusValueInForm;
            this.oldAgeValueInFormForShowingReferenceCNIENumberInput = ageInForm;
            this.setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm, ageInForm);
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfValuesInFormChange()
     */
    setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm, ageInForm): void {
        const resultSearchFieldOfReferenceCNIENumber = this.uiFields.filter(field => field.id === 'referenceCNIENumber');
        if (resultSearchFieldOfReferenceCNIENumber.length > 0) {
            const fieldOfReferenceCNIENumber = resultSearchFieldOfReferenceCNIENumber[0];
            if (!this.setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfConditionsAreMet(fieldOfReferenceCNIENumber, residenceStatusValueInForm, ageInForm)) {
                this.setVisibilityToField(fieldOfReferenceCNIENumber, false);
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfFieldsFoundedAndConditionsAreMet()
     */
    setIsShownAndIsRequiredReferenceCNIENumberInputInFormIfConditionsAreMet(fieldOfReferenceCNIENumber, residenceStatusValueInForm, ageInForm): boolean {
        let verifyOneOfRules = false;
        this.referenceCNIENumberConditionsToShow.forEach(conditionRow => {
            const verifiedResidenceStatus = residenceStatusValueInForm === conditionRow.residenceStatus;
            const verifiedAgeMin = (conditionRow.ageMin == null || conditionRow.ageMin == undefined) || (ageInForm >= conditionRow.ageMin);
            const verifiedAgeMax = (conditionRow.ageMax == null || conditionRow.ageMax == undefined) || (ageInForm <= conditionRow.ageMax);
            if (verifiedResidenceStatus && verifiedAgeMin && verifiedAgeMax) {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfReferenceCNIENumber, true);
                fieldOfReferenceCNIENumber.required = conditionRow.required;
                if (fieldOfReferenceCNIENumber.required) {
                    this.leftToRightUserForm.get('referenceCNIENumber').setValidators(Validators.required);
                } else {
                    this.leftToRightUserForm.get('referenceCNIENumber').setValidators(null);
                }
            }
        });
        return verifyOneOfRules;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   set visibility of Citizen-Fields (as groupment) input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setIsShownCitizenFieldsInputsInFormIfValuesInFormChange(): void {
        const residenceStatusValueInForm = (this.leftToRightUserForm.get('residenceStatus')) ? this.leftToRightUserForm.get('residenceStatus').value : null;
        if (residenceStatusValueInForm && (this.oldResidenceStatusValueInFormForShowingCitizenFields != residenceStatusValueInForm)) {
            this.oldResidenceStatusValueInFormForShowingCitizenFields = residenceStatusValueInForm;
            this.setIsShownCitizenFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm);
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownCitizenFieldsInputsInFormIfValuesInFormChange()
     */
    setIsShownCitizenFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm): void {
        const resultSearchFieldOfReferenceCNIENumber = this.uiFields.filter(field => field.id === 'referenceCNIENumber');
        const resultSearchFieldOfNationality = this.uiFields.filter(field => field.id === 'nationality');
        const resultSearchFieldOfFlagForiegnerIdentityCard = this.uiFields.filter(field => field.id === 'resOuPass');
        // const resultSearchFieldOfPlaceOfBirth = this.uiFields.filter(field => field.id === 'placeOfBirth');
        const fieldsFounded = (resultSearchFieldOfReferenceCNIENumber.length > 0)
            && (resultSearchFieldOfNationality.length > 0)
            && (resultSearchFieldOfFlagForiegnerIdentityCard.length > 0);
        if (fieldsFounded) {
            const fieldOfReferenceCNIENumber = resultSearchFieldOfReferenceCNIENumber[0];
            const fieldOfNationality = resultSearchFieldOfNationality[0];
            const fieldOfFlagForiegnerIdentityCard = resultSearchFieldOfFlagForiegnerIdentityCard[0];
            const verifyOneOfRules = this.setIsShownCitizenFieldsInputsInFormIfConditionsAreMet(
                fieldOfReferenceCNIENumber,
                fieldOfNationality,
                fieldOfFlagForiegnerIdentityCard,
                residenceStatusValueInForm
            );
            if (!verifyOneOfRules) {
                this.setVisibilityToField(fieldOfReferenceCNIENumber, false);
                this.setVisibilityToField(fieldOfNationality, false);
                this.setVisibilityToField(fieldOfFlagForiegnerIdentityCard, false);
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownCitizenFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(...)
     */
    setIsShownCitizenFieldsInputsInFormIfConditionsAreMet(
        fieldOfReferenceCNIENumber,
        fieldOfNationality,
        fieldOfFlagForiegnerIdentityCard,
        residenceStatusValueInForm
    ): boolean {
        let verifyOneOfRules = false;
        this.citizenConditionsToShow.forEach(conditionRow => {
            if (residenceStatusValueInForm === conditionRow.residenceStatus) {
                this.setVisibilityToField(fieldOfReferenceCNIENumber, true);
                this.setVisibilityToField(fieldOfNationality, false);
                this.setVisibilityToField(fieldOfFlagForiegnerIdentityCard, false);
            } else {
                this.setVisibilityToField(fieldOfReferenceCNIENumber, false);
                this.setVisibilityToField(fieldOfNationality, true);
                this.setVisibilityToField(fieldOfFlagForiegnerIdentityCard, true);
            }
            verifyOneOfRules = true;
        });
        return verifyOneOfRules;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   set visibility of Citizen-Fields (as groupment) input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setIsShownForiegnerIdentityCardInFormIfValuesInFormChange(): void {
        const residenceStatusValueInForm = (this.leftToRightUserForm.get('residenceStatus')) ? this.leftToRightUserForm.get('residenceStatus').value : null;
        const flagForiegnerIdentityCardValueInForm = (this.leftToRightUserForm.get('resOuPass')) ? this.leftToRightUserForm.get('resOuPass').value : null;
        if (
            residenceStatusValueInForm && flagForiegnerIdentityCardValueInForm
            && (
                this.oldResidenceStatusValueInFormForShowingForiegnerIdentityCardFields != residenceStatusValueInForm
                || this.oldFlagForiegnerIdentityCardValueInFormForShowingForiegnerIdentityCardFields != flagForiegnerIdentityCardValueInForm
            )
        ) {
            this.oldResidenceStatusValueInFormForShowingForiegnerIdentityCardFields = residenceStatusValueInForm;
            this.oldFlagForiegnerIdentityCardValueInFormForShowingForiegnerIdentityCardFields = flagForiegnerIdentityCardValueInForm;
            this.setIsShownForiegnerIdentityCardInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm, flagForiegnerIdentityCardValueInForm);
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownForiegnerIdentityCardInFormIfValuesInFormChange()
     */
    setIsShownForiegnerIdentityCardInFormIfFieldsFoundedAndConditionsAreMet(residenceStatusValueInForm, flagForiegnerIdentityCardValueInForm): void {
        const resultSearchFieldOfPassportNumber = this.uiFields.filter(field => field.id === 'passportNumber');
        const resultSearchFieldOfReferenceResidencyNumber = this.uiFields.filter(field => field.id === 'referenceResidencyNumber');
        // const resultSearchFieldOfPlaceOfBirth = this.uiFields.filter(field => field.id === 'placeOfBirth');
        const fieldsFounded = (resultSearchFieldOfPassportNumber.length > 0)
            && (resultSearchFieldOfReferenceResidencyNumber.length > 0);
        if (fieldsFounded) {
            const fieldOfPassportNumber = resultSearchFieldOfPassportNumber[0];
            const fieldOfReferenceResidencyNumber = resultSearchFieldOfReferenceResidencyNumber[0];
            const verifyOneOfRules = this.setIsShownForiegnerIdentityCardFieldsInputsInFormIfConditionsAreMet(
                fieldOfPassportNumber,
                fieldOfReferenceResidencyNumber,
                residenceStatusValueInForm,
                flagForiegnerIdentityCardValueInForm
            );
            if (!verifyOneOfRules) {
                this.setVisibilityToField(fieldOfPassportNumber, false);
                this.setVisibilityToField(fieldOfReferenceResidencyNumber, false);
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownForiegnerIdentityCardInFormIfFieldsFoundedAndConditionsAreMet(...)
     */
    setIsShownForiegnerIdentityCardFieldsInputsInFormIfConditionsAreMet(
        fieldOfPassportNumber,
        fieldOfReferenceResidencyNumber,
        residenceStatusValueInForm,
        flagForiegnerIdentityCardValueInForm
    ): boolean {
        let verifyOneOfRules = false;
        this.foriegnerIdentityCardConditionsToShow.forEach(conditionRow => {
            if (!verifyOneOfRules) {
                if (
                    residenceStatusValueInForm === conditionRow.residenceStatus
                    && flagForiegnerIdentityCardValueInForm === conditionRow.resOuPass
                    && conditionRow.fieldToShow === 'referenceResidencyNumber'
                ) {
                    this.setVisibilityToField(fieldOfReferenceResidencyNumber, true);
                    this.setVisibilityToField(fieldOfPassportNumber, false);
                    verifyOneOfRules = true;
                } else if (
                    residenceStatusValueInForm === conditionRow.residenceStatus
                    && flagForiegnerIdentityCardValueInForm === conditionRow.resOuPass
                    && conditionRow.fieldToShow === 'passportNumber'
                ) {
                    this.setVisibilityToField(fieldOfReferenceResidencyNumber, false);
                    this.setVisibilityToField(fieldOfPassportNumber, true);
                    verifyOneOfRules = true;
                }
            }
        });
        return verifyOneOfRules;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   set visibility of Citizen-Fields (as groupment) input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setIsShownPlaceOfBirthInputsInFormIfValuesInFormChange(): void {
        const flagbValueInForm = (this.leftToRightUserForm.get('flagb')) ? this.leftToRightUserForm.get('flagb').value : null;
        if (flagbValueInForm && (this.oldflagbValueInFormForShowingPlaceOfBirth != flagbValueInForm)) {
            this.oldflagbValueInFormForShowingPlaceOfBirth = flagbValueInForm;
            this.setIsShownPlaceOfBirthInputsInFormIfFieldsFoundedAndConditionsAreMet(flagbValueInForm);
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownPlaceOfBirthInputsInFormIfValuesInFormChange()
     */
    setIsShownPlaceOfBirthInputsInFormIfFieldsFoundedAndConditionsAreMet(flagbValueInForm): void {
        const resultSearchFieldOfCountries = this.uiFields.filter(field => field.id === 'listCountry');
        const resultSearchFieldOfPlaceOfBirth = this.uiFields.filter(field => field.id === 'placeOfBirth');
        const fieldsFounded = (resultSearchFieldOfCountries.length > 0) && (resultSearchFieldOfPlaceOfBirth.length > 0);
        if (fieldsFounded) {
            const fieldOfCountries = resultSearchFieldOfCountries[0];
            const fieldOfPlaceOfBirt = resultSearchFieldOfPlaceOfBirth[0];
            const verifyOneOfRules = this.setIsShownPlaceOfBirthInputsInFormIfConditionsAreMet(
                fieldOfCountries,
                fieldOfPlaceOfBirt,
                flagbValueInForm
            );
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownPlaceOfBirthInputsInFormIfFieldsFoundedAndConditionsAreMet(...)
     */
    setIsShownPlaceOfBirthInputsInFormIfConditionsAreMet(fieldOfCountries, fieldOfPlaceOfBirt, flagbValueInForm) {
        let verifyOneOfRules = false;
        this.placeOfBirthConditionsToShow.forEach(conditionRow => {
            if (flagbValueInForm === conditionRow.flagb) {
                this.setVisibilityToField(fieldOfCountries, false);
                this.setVisibilityToField(fieldOfPlaceOfBirt, true);
            } else {
                this.setVisibilityToField(fieldOfCountries, true);
                this.setVisibilityToField(fieldOfPlaceOfBirt, false);
            }
            verifyOneOfRules = true;
        });
        return verifyOneOfRules;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    /*
    * FEATURE @HighMinarets :
    *   set visibility of Guardian-Fields (as groupment) input in formular if concerned values changed,
    *   and if fields in reference-master-data (uiFields) are founded and recovered,
    *   and if conditions in reference-master-data are met.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setIsShownGuardianFieldsInputsInFormIfValuesInFormChange(): void {
        const ageInForm = this.currentAge;
        if (ageInForm === '0' || ageInForm) {
            if (this.oldAgeValueInFormForShowingGuardianFields != ageInForm) {
                this.oldAgeValueInFormForShowingGuardianFields = ageInForm;
                this.setIsShownGuardianFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(ageInForm);
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownGuardianFieldsInputsInFormIfValuesInFormChange()
     */
    setIsShownGuardianFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(ageInForm): void {
        const resultSearchFieldOfParentOrGuardianFirstname = this.uiFields.filter(field => field.id === 'parentOrGuardianfirstName');
        const resultSearchFieldOfParentOrGuardianLastname = this.uiFields.filter(field => field.id === 'parentOrGuardianlastName');
        const resultSearchFieldOfParentOrGuardianUIN = this.uiFields.filter(field => field.id === 'parentOrGuardianUIN');
        const resultSearchFieldOfParentOrGuardianCNIE = this.uiFields.filter(field => field.id === 'parentOrGuardianCNIE');
        const resultSearchFieldOfParentOrGuardianRID = this.uiFields.filter(field => field.id === 'parentOrGuardianRID');
        const resultSearchFieldOfRelationWithChild = this.uiFields.filter(field => field.id === 'relationWithChild');
        const fieldsFounded = (resultSearchFieldOfParentOrGuardianFirstname.length > 0)
            && (resultSearchFieldOfParentOrGuardianLastname.length > 0)
            && (resultSearchFieldOfParentOrGuardianUIN.length > 0)
            && (resultSearchFieldOfRelationWithChild.length > 0)
            && (resultSearchFieldOfParentOrGuardianRID.length > 0)
            && (resultSearchFieldOfParentOrGuardianCNIE.length > 0);
        if (fieldsFounded) {
            const fieldOfParentOrGuardianFirstname = resultSearchFieldOfParentOrGuardianFirstname[0];
            const fieldOfParentOrGuardianLastname = resultSearchFieldOfParentOrGuardianLastname[0];
            const fieldOfParentOrGuardianUIN = resultSearchFieldOfParentOrGuardianUIN[0];
            const fieldOfRelationWithChild = resultSearchFieldOfRelationWithChild[0];
            const fieldOfParentOrGuardianCNIE = resultSearchFieldOfParentOrGuardianCNIE[0];
            const fieldOfParentOrGuardianRID = resultSearchFieldOfParentOrGuardianRID[0];
            const verifyOneOfRules = this.setIsShownGuardianFieldsInputsInFormIfConditionsAreMet(
                fieldOfParentOrGuardianFirstname,
                fieldOfParentOrGuardianLastname,
                fieldOfParentOrGuardianUIN,
                fieldOfParentOrGuardianCNIE,
                fieldOfParentOrGuardianRID,
                fieldOfRelationWithChild,
                ageInForm
            );
            if (!verifyOneOfRules) {
                this.setVisibilityToField(fieldOfParentOrGuardianFirstname, false);
                this.setVisibilityToField(fieldOfParentOrGuardianLastname, false);
                this.setVisibilityToField(fieldOfParentOrGuardianUIN, false);
                this.setVisibilityToField(fieldOfParentOrGuardianCNIE, false);
                this.setVisibilityToField(fieldOfParentOrGuardianRID, false);
                this.setVisibilityToField(fieldOfRelationWithChild, false);
            }
        }
    }

    /**
     * TODO @Youssef : à documenter !
     *
     * @see this.setIsShownGuardianFieldsInputsInFormIfFieldsFoundedAndConditionsAreMet(...)
     */
    setIsShownGuardianFieldsInputsInFormIfConditionsAreMet(
        fieldOfParentOrGuardianFirstname,
        fieldOfParentOrGuardianLastname,
        fieldOfParentOrGuardianUIN,
        fieldOfParentOrGuardianCNIE,
        fieldOfParentOrGuardianRID,
        fieldOfRelationWithChild,
        ageInForm
    ): boolean {
        let verifyOneOfRules = false;
        this.guardianConditionsToShow.forEach(conditionRow => {
            const verifiedAgeMin = (conditionRow.ageMin == null || conditionRow.ageMin == undefined) || (ageInForm >= conditionRow.ageMin);
            const verifiedAgeMax = (conditionRow.ageMax == null || conditionRow.ageMax == undefined) || (ageInForm <= conditionRow.ageMax);
            if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'parentOrGuardianfirstName') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfParentOrGuardianFirstname, true);
            } else if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'parentOrGuardianlastName') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfParentOrGuardianLastname, true);
            } else if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'parentOrGuardianUIN') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfParentOrGuardianUIN, true);
            } else if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'parentOrGuardianCNIE') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfParentOrGuardianCNIE, true);
            } else if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'parentOrGuardianRID') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfParentOrGuardianRID, true);
            } else if (verifiedAgeMin && verifiedAgeMax && conditionRow.fieldToShow === 'relationWithChild') {
                verifyOneOfRules = true;
                this.setVisibilityToField(fieldOfRelationWithChild, true);
            }
        });
        return verifyOneOfRules;
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   after setting visibility and Requeredness with custom <HighMinarets> rules.
    *   set not requred to all non-visible fields.
    */

    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter !
     */
    setRequirednessToAllFields(): void {
        const RESIDANT_STATUS_FIELD_ID = 'residenceStatus';
        const RESIDANT_STATUS_VALUE_OF_RESIDENT_CITIZEN = 'NFR';
        const NOT_REQUIRED_FIELDS_IN_TRANS_USER_FORM_IF_APPLICANT_IS_NOT_RESIDANT = ['lastName', 'firstName', 'parentOrGuardianfirstName', 'parentOrGuardianlastName', 'addressLine1'];
        this.uiFields.forEach(field => {
            if (field.visible && field.required && field.validators !== null && field.validators.length > 0 && this.leftToRightUserForm.get(field.id)) {
                this.leftToRightUserForm.get(field.id).setValidators([
                    Validators.required,
                    Validators.pattern(field.validators[0].validator),
                ]);
                this.rightToLeftUserForm.get(field.id).setValidators([
                    Validators.required,
                    Validators.pattern(field.validators[0].validator),
                ]);
            } else if (field.visible && field.validators !== null && field.validators.length > 0 && this.leftToRightUserForm.get(field.id)) {
                this.leftToRightUserForm.get(field.id).setValidators([
                    Validators.pattern(field.validators[0].validator),
                ]);
                this.rightToLeftUserForm.get(field.id).setValidators([
                    Validators.pattern(field.validators[0].validator),
                ]);
            } else if (field.visible && (field.required) && this.leftToRightUserForm.get(field.id)) {
                this.leftToRightUserForm.get(field.id).setValidators([Validators.required]);
                this.rightToLeftUserForm.get(field.id).setValidators([Validators.required]);
            } else if (this.leftToRightUserForm.get(field.id)) {
                this.leftToRightUserForm.get(field.id).setValidators(null);
                this.leftToRightUserForm.get(field.id).setErrors(null);
                this.rightToLeftUserForm.get(field.id).setValidators(null);
                this.rightToLeftUserForm.get(field.id).setErrors(null);
            }
            // TODO @Youssef : à rectifier la condition !!!
            if (field.visible && field.checksum) {
                this.leftToRightUserForm.controls[`${field.id}`].setValidators([this.validateVerhoeffChecksumValidatorFn()]);
                if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                    this.rightToLeftUserForm.controls[`${field.id}`].setValidators([this.validateVerhoeffChecksumValidatorFn()]);
                }
            }
            if (NOT_REQUIRED_FIELDS_IN_TRANS_USER_FORM_IF_APPLICANT_IS_NOT_RESIDANT.indexOf(field.id) >= 0) {
                if (this.leftToRightUserForm && this.leftToRightUserForm.get(RESIDANT_STATUS_FIELD_ID) && (RESIDANT_STATUS_VALUE_OF_RESIDENT_CITIZEN != this.leftToRightUserForm.get(RESIDANT_STATUS_FIELD_ID).value)) {
                    this.rightToLeftUserForm.get(field.id).setValidators(null);
                    this.rightToLeftUserForm.get(field.id).setErrors(null);
                } else if (this.rightToLeftUserForm && this.rightToLeftUserForm.get(field.id)) {
                    this.rightToLeftUserForm.get(field.id).updateValueAndValidity();
                }
            }
        });
    }

    setIsErrorInUiFieldsGroups() {
        for (let i = 0; i < this.uiFieldsGroups.length; i++) {
            this.uiFieldsGroupsErrorStatus[this.uiFieldsGroups[i]] = this.getIsErrorInUiFieldsGroup(this.uiFieldsGroups[i]);
        }
    }

    private getIsErrorInUiFieldsGroup(group: string): boolean {
        const fields = this.getFieldsOfGroup(group);
        for (let i = 0; i < fields.length; i++) {
            const isCorrectGuardienIdentity = Boolean(
                ((fields[i].id === 'parentOrGuardianRID' || fields[i].id === 'parentOrGuardianUIN') && this.verifyAndSetErrornesToGuardienIdentity())
                || (fields[i].id !== 'parentOrGuardianRID' && fields[i].id !== 'parentOrGuardianUIN')
            );
            const isErrorInField = Boolean(
                (this.leftToRightUserForm && this.leftToRightUserForm.get(fields[i].id) && this.leftToRightUserForm.get(fields[i].id).invalid)
                || (this.rightToLeftUserForm && this.rightToLeftUserForm.get(fields[i].id) && this.rightToLeftUserForm.get(fields[i].id).invalid)
                || !isCorrectGuardienIdentity
            );
            if (isErrorInField) {
                return true
            }
        }
        return false;
    }

    setInvalidFieldsInAllGroups() {
        this.invalidFields = [];
        this.uiFieldsGroups.forEach(group => {
            this.setInvalidFieldsInGroup(group);
        });
    }

    private setInvalidFieldsInGroup(group: string) {
        this.getFieldsOfGroup(group).forEach(field => {
            if (this.leftToRightUserForm && this.leftToRightUserForm.get(field.id) && this.leftToRightUserForm.get(field.id).invalid) {
                this.invalidFields.push(field.labelName[this.primaryLeftToRightLanguage]);
            }
            if (this.rightToLeftUserForm && this.rightToLeftUserForm.get(field.id) && this.rightToLeftUserForm.get(field.id).invalid) {
                this.invalidFields.push(field.labelName[this.secondaryRightToLeftLanguage]);
            }
        });
    }


    setInitIsErrorInUiFieldsGroups() {
        this.uiFieldsGroups.forEach(group => {
            this.uiFieldsGroupsErrorStatus[group] = false;
        });
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   TODO @Youssef : à documenter
    */

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * TODO @Youssef : à documenter
     * @param group
     */
    getFieldsOfGroup(group): any[] {
        return this.uiFields.filter(field => field.group === group && field.visible);
    }

    getValidationErrorPrimaryLanguageMessage(labelName: string): string {
        return this.demographicPrimaryLeftToRightLanguageLabels['errorMessages']['validationErrorMessage'].replace('{field}', labelName);
    }

    getRequiredErrorPrimaryLanguageMessage(labelName: string): string {
        return this.demographicPrimaryLeftToRightLanguageLabels['errorMessages']['requiredErrorMessage'].replace('{field}', labelName);
    }


    getValidationErrorSecondaryLanguageMessage(labelName: string): string {
        return this.demographicSecondaryRightToLeftLanguagelabels['errorMessages']['validationErrorMessage'].replace('الحقل', labelName);
    }

    getRequiredErrorSecondaryLanguageMessage(labelName: string): string {
        return this.demographicSecondaryRightToLeftLanguagelabels['errorMessages']['requiredErrorMessage'].replace('الحقل', labelName);
    }

    private getYesterdayDate(): string {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = (yesterday.getMonth() + 1 >= 10) ? (yesterday.getMonth() + 1) : `0${yesterday.getMonth() + 1}`;
        const day = (yesterday.getDate() >= 10) ? (yesterday.getDate()) : `0${yesterday.getDate()}`;
        return `${year}-${month}-${day}`;
    }

    onChangeRadioValue(fieldId: string) {
        this.rightToLeftUserForm.get(fieldId).setValue(this.leftToRightUserForm.get(fieldId).value);
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    * FEATURE @HighMinarets :
    *   Validateur Check-Sum with Verhoeff Algorithm.
    */

    // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////


    private validateVerhoeffChecksumValidatorFn(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const isNotSameCivilRegistryNumberAsParentOrGuardianUIN = (this.leftToRightUserForm.get('civilRegistryNumber').value !== this.leftToRightUserForm.get('parentOrGuardianUIN').value);
            return (control.value && this.validateVerhoeffChecksum(control.value) && isNotSameCivilRegistryNumberAsParentOrGuardianUIN) ? null : {checksum: {value: control.value}};
        };
    }

    /**
     * Validates that an entered number is Verhoeff checksum compliant. Make sure
     * the check digit is the last one.
     *
     * @param num The numeric string data for Verhoeff checksum compliance check.
     * @return true if the provided number is Verhoeff checksum compliant.
     */
    private validateVerhoeffChecksum(num: string): boolean {
        if (num.length != 10 || num.charAt(0) === '1') {
            return false;
        }
        try {
            const d = [
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
                [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
                [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
                [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
                [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
                [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
                [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
                [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
                [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
            ];
            const p = [
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
                [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
                [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
                [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
                [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
                [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
                [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
            ];
            var c = 0;
            var invertedArray = this.convertToInversedArrayOfNumbers(num);
            for (var i = 0; i < invertedArray.length; i++) {
                c = d[c][p[i % 8][invertedArray[i]]];
            }
            return c === 0;
        } catch (e) {
            return false;
        }
    }

    /**
     * converts string or number to an array and inverts it
     */
    private convertToInversedArrayOfNumbers(array): Array<number> {
        if (Object.prototype.toString.call(array) == '[object Number]') {
            array = String(array);
        }
        if (Object.prototype.toString.call(array) == '[object String]') {
            array = array.split('').map(Number);
        }
        return array.reverse();
    }


    // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    getAvailableYearsForBirthday() {
        const availableYearsForBirthday = [];
        const thisYear = new Date().getFullYear();
        for (let i = thisYear; i >= 1900; i--) {
            availableYearsForBirthday.push(`${i}`);
        }
        return availableYearsForBirthday;
    }

    getAvailableMonthForBirthday() {
        const availableMonthForBirthday = [];
        availableMonthForBirthday.push(' ');
        const initMonth = 1;
        const thisYear = new Date().getFullYear();
        const selectedYear = Number(this.year);
        const thisMonth = new Date().getMonth() + 1;
        const maxMonth = (thisYear === selectedYear) ? thisMonth : 12;
        for (let i = initMonth; i <= maxMonth; i++) {
            availableMonthForBirthday.push((i < 10) ? `0${i}` : `${i}`);
        }
        return availableMonthForBirthday;
    }

    getAvailableDayForBirthday() {
        const availableDayForBirthday = [];
        availableDayForBirthday.push(' ');
        const initDay = 1;
        const thisYear = new Date().getFullYear();
        const selectedYear = Number(this.year);
        const thisMonth = new Date().getMonth() + 1;
        const selectedMonth = Number(this.month);
        const thisDay = new Date().getDate();
        var lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const maxDay = (thisYear === selectedYear && thisMonth === selectedMonth) ? thisDay : lastDayOfMonth;
        for (let i = initDay; i <= maxDay; i++) {
            availableDayForBirthday.push((i < 10) ? `0${i}` : `${i}`);
        }
        return availableDayForBirthday;
    }

    // onYearOfBirthDropdowChangeHandler() {
    //     this.year = this.userForm.get('yearOfBirth').value;
    //     this.transUserForm.get('yearOfBirth').setValue(this.year);
    //     this.onDOBChange();
    // }
    //
    // onMonthOfBirthDropdowChangeHandler() {
    //     this.month = this.userForm.get('monthOfBirth').value;
    //     this.transUserForm.get('monthOfBirth').setValue(this.month);
    //     this.onDOBChange();
    // }
    //
    // onDayOfBirthDropdowChangeHandler() {
    //     this.date = this.userForm.get('dayOfBirth').value;
    //     this.transUserForm.get('dayOfBirth').setValue(this.date);
    //     this.onDOBChange();
    // }

    setFieldsOfBirthDateFromReactiveForm() {
        if (this.leftToRightUserForm && this.leftToRightUserForm.get('yearOfBirth') && this.leftToRightUserForm.get('monthOfBirth') && this.leftToRightUserForm.get('dayOfBirth')) {
            this.year = this.leftToRightUserForm.get('yearOfBirth').value;
            this.rightToLeftUserForm.get('yearOfBirth').setValue(this.year);
            this.month = this.leftToRightUserForm.get('monthOfBirth').value;
            if (!this.month || (this.month.replace(' ', '') === '')) {
                this.leftToRightUserForm.get('dayOfBirth').setValue(null);
            }
            this.rightToLeftUserForm.get('monthOfBirth').setValue(this.month);
            this.date = this.leftToRightUserForm.get('dayOfBirth').value;
            this.rightToLeftUserForm.get('dayOfBirth').setValue(this.date);
            const selectedMonth = (this.month && !this.month.replace(' ', '')) ? this.month : '01';
            const selectedDay = (this.date && !this.date.replace(' ', '')) ? this.date : '01';
            this.leftToRightUserForm.controls[`dateOfBirth`].setValue(
                `${this.year}-${selectedMonth}-${selectedDay}`
            );
            if (this.primaryLeftToRightLanguage !== this.secondaryRightToLeftLanguage) {
                this.rightToLeftUserForm.controls[`dateOfBirth`].setValue(
                    `${this.year}-${selectedMonth}-${selectedDay}`
                );
            }
            this.onDOBChange();
        }
    }

    private verifyAndSetErrornesToGuardienIdentity(): boolean {
        const isVisibleGuardienIdentity = Boolean(
            this.uiFields.filter(field => field.id === 'parentOrGuardianRID')[0].visible
            && this.uiFields.filter(field => field.id === 'parentOrGuardianUIN')[0].visible
        );
        const isInformedGuardienIdentity = Boolean(
            this.leftToRightUserForm.get('parentOrGuardianRID').value || this.leftToRightUserForm.get('parentOrGuardianUIN').value
        );
        const isCorrectGuardienIdentity = (isVisibleGuardienIdentity && isInformedGuardienIdentity) || (!isVisibleGuardienIdentity);
        if (isVisibleGuardienIdentity && !isCorrectGuardienIdentity) {
            this.leftToRightUserForm.get('parentOrGuardianRID').setErrors({'error': true});
            this.leftToRightUserForm.get('parentOrGuardianUIN').setErrors({'error': true});
            this.rightToLeftUserForm.get('parentOrGuardianRID').setErrors({'error': true});
            this.rightToLeftUserForm.get('parentOrGuardianUIN').setErrors({'error': true});
        } else {
            this.leftToRightUserForm.get('parentOrGuardianRID').setErrors(null);
            this.leftToRightUserForm.get('parentOrGuardianUIN').setErrors(null);
            this.rightToLeftUserForm.get('parentOrGuardianRID').setErrors(null);
            this.rightToLeftUserForm.get('parentOrGuardianUIN').setErrors(null);
        }
        return isCorrectGuardienIdentity;
    }



    getOriginalPrimaryDirection() {
        return (this.primaryLanguage === 'ara') ? 'rtl' : 'ltr';
    }

    getPrimaryDirection() {
        return (this.primaryLeftToRightLanguage === 'ara') ? 'rtl' : 'ltr';
    }

    getSecondaryDirection() {
        return (this.primaryLeftToRightLanguage === 'ara') ? 'ltr' : 'rtl';
    }

}
