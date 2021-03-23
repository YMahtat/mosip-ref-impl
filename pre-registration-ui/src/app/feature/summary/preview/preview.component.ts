import {Component, OnInit} from "@angular/core";
import {DataStorageService} from "src/app/core/services/data-storage.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UserModel} from "src/app/shared/models/demographic-model/user.modal";
import {RegistrationService} from "src/app/core/services/registration.service";
import {TranslateService} from "@ngx-translate/core";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import LanguageFactory from "src/assets/i18n";
import {ConfigService} from "src/app/core/services/config.service";
import {CodeValueModal} from "src/app/shared/models/demographic-model/code.value.modal";
import {CONFIG_KEYS} from "../../../app.constants";

@Component({
    selector: "app-preview",
    templateUrl: "./preview.component.html",
    styleUrls: ["./preview.component.css"],
})
export class PreviewComponent implements OnInit {
    previewData: any;
    demographiclabels: any;
    secondaryLanguageDemographiclabels: any;
    secondaryLanguagelabels: any;
    primaryLanguage;
    secondaryLanguage;
    dateOfBirthPrimary: string = "";
    dateOfBirthSecondary: string = "";
    user: UserModel;
    preRegId: string;
    files: any;
    documentTypes = [];
    documentMapObject = [];
    sameAs = "";
    residentTypeMapping = {
        primary: {},
        secondary: {},
    };
    primaryLocations;
    secondaryLocations;
    residenceStatus: any;
    genders: any;

    identityData = [];
    idSchemaData;
    uiFields = [];
    uiFieldsGroups = [];
    locationHeirarchy = [];
    dynamicFields = [];
    primarydropDownFields = {};
    secondaryDropDownFields = {};

    constructor(
        private dataStorageService: DataStorageService,
        private router: Router,
        private registrationService: RegistrationService,
        private translate: TranslateService,
        private activatedRoute: ActivatedRoute,
        private configService: ConfigService
    ) {
        this.translate.use(localStorage.getItem("langCode"));
        localStorage.setItem("modifyDocument", "false");
    }

    async ngOnInit() {
        this.primaryLanguage = localStorage.getItem("langCode");
        this.secondaryLanguage = localStorage.getItem("secondaryLangCode");
        this.activatedRoute.params.subscribe((param) => {
            this.preRegId = param["appId"];
        });
        await this.getIdentityJsonFormat();
        await this.getResidentDetails();
        await this.getGenderDetails();
        await this.getUserInfo();
//     await this.convertLocationCodeToLocationName();
        await this.getUserFiles();
        await this.getDocumentCategories();
        this.calculateAge();
        this.previewData.primaryAddress = this.combineAddress(0);
        //this.previewData.secondaryAddress = this.combineAddress(1);
        this.formatDob(this.previewData.dateOfBirth);
        this.getPrimaryLanguageLabels();
        this.getSecondaryLanguageLabels();
        this.files = this.user.files ? this.user.files : [];
        this.documentsMapping();
    }

    async getIdentityJsonFormat() {
        return new Promise((resolve, reject) => {
            this.dataStorageService.getIdentityJson().subscribe((response) => {
                this.idSchemaData = response["response"]["idSchema"];
                this.identityData = response["response"]["idSchema"]["identity"];
                this.locationHeirarchy = [
                    ...response["response"]["idSchema"]["locationHierarchy"],
                ];
                this.identityData.forEach((obj) => {
                    if (
                        obj.inputRequired === true &&
                        obj.controlType !== null &&
                        !(obj.controlType === "fileupload")
                    ) {
                        // obj.preview = true; // TODO @Youssef : à enlever
                        this.uiFields.push(obj);
                    }
                });
                this.dynamicFields = this.uiFields.filter(
                    (fields) =>
                        fields.controlType === "dropdown" && fields.fieldType === "dynamic"
                );
                this.getIntialDropDownArrays();
                this.setDynamicFieldValues();
                this.uiFieldsGroups = Array.from(new Set(this.uiFields.map(field => field.group)));
                resolve(true);
            });
        });
    }

    getIntialDropDownArrays() {
        this.uiFields.forEach((control) => {
            if (control.controlType === "dropdown") {
                this.primarydropDownFields[control.id] = [];
                if (this.primaryLanguage != this.secondaryLanguage) {
                    this.secondaryDropDownFields[control.id] = [];
                }
            }
        });
    }

    getDynamicFieldValues(lang) {
        return new Promise((resolve) => {
            this.dataStorageService
                .getDynamicFieldsandValues(lang)
                .subscribe((response) => {
                    let dynamicField = response[appConstants.RESPONSE]["data"];
                    this.dynamicFields.forEach((field) => {
                        dynamicField.forEach((res) => {
                            if (
                                field.id === res.name &&
                                res.langCode === this.primaryLanguage
                            ) {
                                this.filterOnLangCode(
                                    this.primaryLanguage,
                                    res.name,
                                    res["fieldVal"]
                                );
                            }
                            if (this.primaryLanguage !== this.secondaryLanguage) {
                                if (
                                    field.id === res.name &&
                                    res.langCode === this.secondaryLanguage
                                ) {
                                    this.filterOnLangCode(
                                        this.secondaryLanguage,
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

    getUserInfo() {
        return new Promise((resolve) => {
            this.dataStorageService
                .getUser(this.preRegId.toString())
                .subscribe((response) => {
                    this.user = new UserModel(
                        this.preRegId.toString(),
                        response[appConstants.RESPONSE],
                        undefined,
                        []
                    );
                    this.previewData = this.user.request.demographicDetails.identity;
                    this.locationHeirarchy.forEach(location => {
                        if (this.locationHeirarchy.indexOf(location) >= 0) {
                            if (this.locationHeirarchy.indexOf(location) == 0) {
                                this.loadLocationData(this.configService.getConfig()[CONFIG_KEYS.mosip_country_code], location);
                            } else {
                                this.dropdownApiCall(location);
                            }
                            return '';
                        }
                    });
                    resolve(true);
                });
        });
    }

    getUserFiles() {
        return new Promise((resolve) => {
            this.dataStorageService
                .getUserDocuments(this.preRegId)
                .subscribe((response) => {
                    this.setUserFiles(response);
                    resolve(true);
                });
        });
    }

    setUserFiles(response) {
        if (!response["errors"]) {
            this.user.files = response[appConstants.RESPONSE][appConstants.METADATA];
        }
    }

    getDocumentCategories() {
        const applicantcode = localStorage.getItem("applicantType");
        return new Promise((resolve) => {
            this.dataStorageService
                .getDocumentCategories(applicantcode)
                .subscribe((response) => {
                    this.documentTypes = response[appConstants.RESPONSE].documentCategories;
                    resolve(true);
                });
        });
    }

    formatDob(dob: string) {
        dob = dob.replace(/\//g, "-");
        this.dateOfBirthPrimary = Utils.getBookingDateTime(
            dob,
            "",
            localStorage.getItem("langCode")
        );
        this.dateOfBirthSecondary = Utils.getBookingDateTime(
            dob,
            "",
            localStorage.getItem("secondaryLangCode")
        );
    }

    documentsMapping() {
        this.documentMapObject = [];
        if (this.files && this.documentTypes.length !== 0) {
            this.documentTypes.forEach((type) => {
                if (this.isToDisplayProofsType(type)) {
                    const file = this.files.filter((file) => file.docCatCode === type.code);
                    if (
                        type.code === "POA" &&
                        file.length === 0 &&
                        this.registrationService.getSameAs() !== ""
                    ) {
                        const obj = {
                            docName: this.sameAs,
                        };
                        file.push(obj);
                    }
                    const obj = {
                        code: type.code,
                        name: type.description,
                        fileName: file.length > 0 ? file[0].docName : undefined,
                    };

                    this.documentMapObject.push(obj);
                }
            });
        }
    }

//   convertLocationCodeToLocationName() {
//     this.locationHeirarchy.forEach((location) => {
//       this.getLocations(
//         this.user.request.demographicDetails.identity[location][0].value,
//         this.primaryLanguage
//       ).then(
//         (val) =>
//           (this.user.request.demographicDetails.identity[
//             location
//           ][0].value = val)
//       );
//       if (this.primaryLanguage != this.secondaryLanguage) {
//         this.getLocations(
//           this.user.request.demographicDetails.identity[location][1].value,
//           this.secondaryLanguage
//         ).then((val) => (val) =>
//           (this.user.request.demographicDetails.identity[
//             location
//           ][0].value = val)
//         );
//       }
//     });
//   }

    combineAddress(index: number) {
        const adressLine1 = this.getAdressValue(this.previewData.addressLine1 && this.previewData.addressLine1[index]);
        const adressLine2 = this.getAdressValue(this.previewData.addressLine2 && this.previewData.addressLine2[index]);
        const adressLine3 = this.getAdressValue(this.previewData.addressLine3 && this.previewData.addressLine3[index]);
        const address = adressLine1 +
            (adressLine2 ? ", " + this.previewData.addressLine2[index].value : '') +
            (adressLine3 ? ", " + adressLine3 : '');
        return address;
    }

    getAdressValue(adressLine) {
        return (adressLine && adressLine.value) ? adressLine.value : undefined;
    }


    private getPrimaryLanguageLabels() {
        let factory = new LanguageFactory(this.primaryLanguage);
        let response = factory.getCurrentlanguage();
        this.demographiclabels = response["demographic"];
    }

    getSecondaryLanguageLabels() {
        let factory = new LanguageFactory(
            localStorage.getItem("secondaryLangCode")
        );
        let response = factory.getCurrentlanguage();
        this.secondaryLanguagelabels = response["preview"];
        this.secondaryLanguageDemographiclabels = response["demographic"];
        this.residentTypeMapping.secondary = response["residentTypesMapping"];
    }

    getPrimaryLanguageData() {
        let factory = new LanguageFactory(localStorage.getItem("langCode"));
        let response = factory.getCurrentlanguage();
        this.sameAs = response["sameAs"];
        this.residentTypeMapping.primary = response["residentTypesMapping"];
    }

    calculateAge() {
        const now = new Date();
        const born = new Date(this.previewData.dateOfBirth);
        const years = Math.floor(
            (now.getTime() - born.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        this.previewData.age = years;
    }

    modifyDemographic() {
        const url = Utils.getURL(this.router.url, "demographic", 3);
        localStorage.setItem("modifyUserFromPreview", "true");
        localStorage.setItem("modifyUser", "true");
        this.router.navigateByUrl(url + `/${this.preRegId}`);
    }

    modifyDocument() {
        localStorage.setItem("modifyDocument", "true");
        this.navigateBack();
    }

    getLocations(locationCode, langCode) {
        return new Promise((resolve) => {
            this.dataStorageService
                .getLocationsHierarchyByLangCode(langCode, locationCode)
                .subscribe((response) => {
                    if (response[appConstants.RESPONSE]) {
                        const locations =
                            response[appConstants.RESPONSE]["locations"][0]["name"];
                        resolve(locations);
                    }
                });
        });
    }

    enableContinue(): boolean {
        let flag = true;
        this.documentMapObject.forEach((object) => {
            if (object.fileName === undefined) {
                if (
                    object.code === "POA" &&
                    this.registrationService.getSameAs() !== ""
                ) {
                    flag = true;
                } else {
                    flag = false;
                }
            }
        });
        return flag;
    }

    navigateDashboard() {
        localStorage.setItem("newApplicant", "true");
        localStorage.setItem("modifyUserFromPreview", "false");
        localStorage.setItem("modifyUser", "false");
        localStorage.setItem("addingUserFromPreview", "true");
        this.router.navigate([
            `${this.primaryLanguage}/pre-registration/demographic/new`,
        ]);
    }

    navigateBack() {
        const url = Utils.getURL(this.router.url, "file-upload", 3);
        this.router.navigateByUrl(url + `/${this.preRegId}`);
    }

    navigateNext() {
        let url = Utils.getURL(this.router.url, "booking", 3);
        url = url + `/${this.preRegId}/pick-center`;
        this.router.navigateByUrl(url);
    }

    // async locationData() {
    //   await this.getLocations(localStorage.getItem("langCode")).then(
    //     (value) => (this.primaryLocations = value)
    //   );
    //   this.getLocations(localStorage.getItem("secondaryLangCode")).then(
    //     (value) => (this.secondaryLocations = value)
    //   );
    // }

    private async setDynamicFieldValues() {
        await this.getDynamicFieldValues(this.primaryLanguage);
        if (this.primaryLanguage !== this.secondaryLanguage) {
            await this.getDynamicFieldValues(this.secondaryLanguage);
        }
    }

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
                        if (langCode === this.primaryLanguage) {
                            this.primarydropDownFields[field].push(codeValue);
                        } else {
                            this.secondaryDropDownFields[field].push(codeValue);
                        }
                        resolve(true);
                    }
                });
            }
        });
    }

    private getGenderDetails() {
        return new Promise((resolve) => {
            this.dataStorageService.getGenderDetails().subscribe((response) => {
                if (response[appConstants.RESPONSE]) {
                    this.genders = response[appConstants.RESPONSE][appConstants.DEMOGRAPHIC_RESPONSE_KEYS.genderTypes];
                    resolve(true);
                }
            });
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
            this.dataStorageService.getResidentDetails().subscribe((response) => {
                if (response[appConstants.RESPONSE]) {
                    this.residenceStatus =
                        response[appConstants.RESPONSE][
                            appConstants.DEMOGRAPHIC_RESPONSE_KEYS.residentTypes
                            ];
                    resolve(true);
                }
            });
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
        return this.uiFields.filter(field => field.group === group && field.preview && this.previewData[field.id]);
    }


    isToDisplayProofsType(document): boolean {
        let isToDisplay = false;
        document.documentTypes.forEach(documentType => {
            isToDisplay = isToDisplay || this.isToDisplayProof(documentType);
        });
        return isToDisplay;
    }


    isToDisplayProof(documentType): boolean {
        const codesPiecesJustificativesToBring = this.getPiecesJustificativesToBring(this.previewData);
        return codesPiecesJustificativesToBring.indexOf(documentType.code) >= 0;
    }

    getPiecesJustificativesToBring(user): string[] {
        const piecesJustificativesToBring = new Array();
        const [yyyy, mm, dd] = user.dateOfBirth.split("/");
        const birthDay = new Date(`${yyyy}-${mm}-${dd}`);
        const ageOfApplicant = this.calculateAgeFromBirthDay(birthDay);
        if (this.idSchemaData && this.idSchemaData.proofsToBring) {
            this.idSchemaData.proofsToBring.forEach(proofToBring => {
                let verifyConditions = (proofToBring.residenceStatus) ? proofToBring.residenceStatus === user.residenceStatus[0].value : true;
                verifyConditions = (proofToBring.ageMin) ? verifyConditions && ageOfApplicant >= proofToBring.ageMin : verifyConditions;
                verifyConditions = (proofToBring.ageMax) ? verifyConditions && ageOfApplicant <= proofToBring.ageMax : verifyConditions;
                verifyConditions = (proofToBring.hasCNIE === false) ? verifyConditions && !user.referenceCNIENumber : verifyConditions;
                verifyConditions = (proofToBring.hasCNIE === true) ? verifyConditions && Boolean(user.referenceCNIENumber) : verifyConditions;
                if (verifyConditions) {
                    proofToBring.proofs.forEach(proof => {
                        piecesJustificativesToBring.push(proof);
                    });
                }
            });
        }
        return piecesJustificativesToBring;
    }

    calculateAgeFromBirthDay(birthday) {
        var ageDifMs = Date.now() - birthday;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    getSelectedPrimaryLanguageValueFromDropdown(fieldCode, valueCode): string {
        if (this.primarydropDownFields && this.primarydropDownFields[fieldCode]) {
            const optionValue = (this.primarydropDownFields[fieldCode] as any[]).filter(option => option.valueCode === valueCode)[0];
            if (optionValue) {
                return optionValue.valueName;
            } else if (fieldCode === 'gender') {
                const gender = this.genders.filter(gender => gender.langCode === this.primaryLanguage && valueCode === gender.code)[0];
                return gender.genderName;
            } else if (fieldCode === 'residenceStatus') {
                const residentType = this.residenceStatus.filter(residentType => residentType.langCode === this.primaryLanguage && valueCode === residentType.code)[0];
                return residentType.name;
            } else {
                return '';
            }
        } else {
            return valueCode;
        }
    }

    getSelectedSecondaryLanguageValueFromDropdown(fieldCode, valueCode): string {
        if (this.secondaryDropDownFields && this.secondaryDropDownFields[fieldCode]) {
            const optionValue = (this.secondaryDropDownFields[fieldCode] as any[]).filter(option => option.valueCode === valueCode)[0];
            if (optionValue) {
                return optionValue.valueName;
            } else if (fieldCode === 'gender') {
                const gender = this.genders.filter(gender => gender.langCode === this.secondaryLanguage && valueCode === gender.code)[0];
                return gender.genderName;
            } else if (fieldCode === 'residenceStatus') {
                const residentType = this.residenceStatus.filter(residentType => residentType.langCode === this.secondaryLanguage && valueCode === residentType.code)[0];
                return residentType.name;
            } else {
                return '';
            }
        } else {
            return valueCode;
        }
    }


    /**
     *
     * @description this method is to make dropdown api calls
     *
     * @param controlObject is Identity Type Object
     *  ex: { id : 'region',controlType: 'dropdown' ...}
     */
    dropdownApiCall(fieldCode) {
        const indexOfFieldInLocationHeirarchy = this.locationHeirarchy.indexOf(fieldCode);
        if (indexOfFieldInLocationHeirarchy !== 0) {
            this.primarydropDownFields[fieldCode] = [];
            const location = indexOfFieldInLocationHeirarchy;
            let parentLocation = this.locationHeirarchy[location - 1];
            let locationCode = this.previewData[parentLocation][0].value;
            if (fieldCode === 'commun') {
                parentLocation = 'province';
                locationCode = `COM${this.previewData[parentLocation][0].value}`;
            }
            this.loadLocationData(locationCode, fieldCode);
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
                .getLocationImmediateHierearchy(this.primaryLanguage, locationCode)
                .subscribe(
                    (response) => {
                        if (response[appConstants.RESPONSE]) {
                            response[appConstants.RESPONSE][
                                appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                                ].forEach((element) => {
                                let codeValueModal: CodeValueModal = {
                                    valueCode: element.code,
                                    valueName: element.name,
                                    languageCode: this.primaryLanguage,
                                };
                                this.primarydropDownFields[`${fieldName}`].push(codeValueModal);
                            });
                        }
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            if (this.primaryLanguage !== this.secondaryLanguage) {
                this.dataStorageService
                    .getLocationImmediateHierearchy(this.secondaryLanguage, locationCode)
                    .subscribe(
                        (response) => {
                            if (response[appConstants.RESPONSE]) {
                                response[appConstants.RESPONSE][
                                    appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                                    ].forEach((element) => {
                                    let codeValueModal: CodeValueModal = {
                                        valueCode: element.code,
                                        valueName: element.name,
                                        languageCode: this.secondaryLanguage,
                                    };
                                    this.secondaryDropDownFields[`${fieldName}`].push(codeValueModal);
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

    getDateOfBirth() {
        const data = this.previewData;
        return (!data.monthOfBirth) ? data.yearOfBirth : (!data.dayOfBirth) ? `${data.monthOfBirth}/${data.yearOfBirth}` : `${data.dayOfBirth}/${data.monthOfBirth}/${data.yearOfBirth}`;
    }

}
