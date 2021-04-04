import {Component, OnDestroy, OnInit} from "@angular/core";
import * as html2pdf from "html2pdf.js";
import {MatDialog} from "@angular/material";
import {BookingService} from "../../booking/booking.service";
import {DialougComponent} from "src/app/shared/dialoug/dialoug.component";
import {TranslateService} from "@ngx-translate/core";
import {DataStorageService} from "src/app/core/services/data-storage.service";
import {NotificationDtoModel} from "src/app/shared/models/notification-model/notification-dto.model";
import Utils from "src/app/app.util";
import * as appConstants from "../../../app.constants";
import {CONFIG_KEYS, DEFAULT_LTR_LANGUAGE_CODE, DEFAULT_RTL_LANGUAGE_CODE, IDS} from "../../../app.constants";
import {RequestModel} from "src/app/shared/models/request-model/RequestModel";
import LanguageFactory from "src/assets/i18n";
import {Subscription} from "rxjs";
import {ConfigService} from "src/app/core/services/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NameList} from "src/app/shared/models/demographic-model/name-list.modal";
import {UserModel} from "src/app/shared/models/demographic-model/user.modal";
import {CodeValueModal} from "../../../shared/models/demographic-model/code.value.modal";

@Component({
    selector: "app-acknowledgement",
    templateUrl: "./acknowledgement.component.html",
    styleUrls: ["./acknowledgement.component.css"],
})
export class AcknowledgementComponent implements OnInit, OnDestroy {

    primaryLanguage = localStorage.getItem("langCode");
    primaryLeftTorRightLanguage = DEFAULT_LTR_LANGUAGE_CODE;
    secondaryLanguage = localStorage.getItem("secondaryLangCode");
    secondaryRightToLeftLanguage = DEFAULT_RTL_LANGUAGE_CODE;

    primaryLeftToRightLanguageLabels: any;
    secondaryRightToLeftLanguageLabels: any;

    identityData;
    locationHeirarchy;
    primaryLeftTorRightLanguageDropDownFields = {};
    secondaryRightToLeftLanguageDropDownLables = {};
    usersInfo = [];
    secondaryRightToLeftLanguageLanguageRegistrationCenter: any;
    guidelines = [];
    opt = {};
    fileBlob: Blob;
    showSpinner: boolean = true;
    notificationRequest = new FormData();
    bookingDataPrimary = "";
    bookingDataSecondary = "";
    subscriptions: Subscription[] = [];
    notificationTypes: string[];
    preRegId: any;
    createdDateTime;
    updatedDateTime;
    nameList: NameList = {
        preRegId: "",
        firstName: "",
        firstNameSecondaryLang: "",
        lastName: "",
        lastNameSecondaryLang: "",
        regDto: "",
        status: "",
        registrationCenter: "",
        bookingData: "",
        postalCode: "",
        emailId: undefined,
        phoneNumber: undefined,
    };
    regCenterId;
    lastName = "";
    applicantContactDetails = [];

    constructor(
        private bookingService: BookingService,
        private dialog: MatDialog,
        private translate: TranslateService,
        private dataStorageService: DataStorageService,
        private configService: ConfigService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) {
        this.translate.use(localStorage.getItem("langCode"));
    }

    async ngOnInit() {
        this.locationHeirarchy = localStorage.getItem("locationHierarchy");
        await this.getIdentityJsonFormat();
        if (this.router.url.includes("multiappointment")) {
            this.preRegId = [
                ...JSON.parse(localStorage.getItem("multiappointment")),
            ];
        } else {
            this.activatedRoute.params.subscribe((param) => {
                this.preRegId = [param["appId"]];
            });
        }
        this.lastName = this.configService.getConfigByKey(
            appConstants.CONFIG_KEYS.preregistartion_identity_name
        );
        await this.getUserInfo(this.preRegId);
        await this.getRegCenterDetails();
        let notificationTypes = this.configService
            .getConfigByKey(appConstants.CONFIG_KEYS.mosip_notification_type)
            .split("|");
        this.notificationTypes = notificationTypes.map((item) =>
            item.toUpperCase()
        );
        this.opt = {
            margin: [0, 0, 0, 0],
            filename: this.usersInfo[0].preRegId + ".pdf",
            image: {type: "jpeg", quality: 1},
            html2canvas: {scale: 2},
            pageBreak: {mode: 'css'},
            jsPDF: {orientation: 'portrait', unit: 'in', format: 'letter', compressPDF: true},
        };

        await this.apiCalls();

        if (this.bookingService.getSendNotification()) {
            this.bookingService.resetSendNotification();
            this.automaticNotification();
        }
    }


    getIdentityJsonFormat() {
        this.dataStorageService.getIdentityJson().subscribe((response) => {
            this.identityData = response["response"]["idSchema"];
            this.locationHeirarchy = [...response["response"]["idSchema"]["locationHierarchy"],];
        });
    }

    getUserInfo(preRegId) {
        let self = this;
        return new Promise((resolve) => {
            preRegId.forEach(async (prid: any, index) => {
                await this.getUserDetails(prid).then(async (user) => {
                    const nameList: NameList = {
                        preRegId: "",
                        firstName: "",
                        firstNameSecondaryLang: "",
                        lastName: "",
                        gender: undefined,
                        lastNameSecondaryLang: "",
                        regDto: "",
                        status: "",
                        registrationCenter: "",
                        bookingData: "",
                        postalCode: "",
                        emailId: undefined,
                        phoneNumber: undefined,
                        nationality: "",
                        nationalitySecondaryLang: "",
                        region: "",
                        regionSecondaryLang: "",
                        province: "",
                        provinceSecondaryLang: "",
                        city: "",
                        citySecondaryLang: "",
                        zone: "",
                        zoneSecondaryLang: "",
                        adresseLine: "",
                        adresseLineSecondaryLang: "",
                        placeOfBirth: "",
                        placeOfBirthSecondaryLang: "",
                        birthCertificateNumber: "",
                        civilRegistryNumber: "",
                        firstNameGuardian: "",
                        firstNameGuardianSecondaryLang: "",
                        lastNameGuardian: "",
                        lastNameGuardianSecondaryLang: "",
                        relationWithChild: "",
                        relationWithChildSecondaryLang: "",
                        parentOrGuardianUIN: "",
                    };
                    nameList.preRegId = user["request"].preRegistrationId;
                    nameList.status = user["request"].statusCode;
                    nameList.createdDateTime = user["request"]["createdDateTime"];
                    this.createdDateTime = user["request"]["createdDateTime"];
                    this.updatedDateTime = user["request"]["updatedDateTime"];
                    nameList.lastName = user["request"].demographicDetails.identity["lastName"][0].value;
                    if (user["request"].demographicDetails.identity["lastName"][1])
                        nameList.lastNameSecondaryLang = user["request"].demographicDetails.identity["lastName"][1].value;
                    nameList.firstName = user["request"].demographicDetails.identity["firstName"][0].value;
                    if (user["request"].demographicDetails.identity["firstName"][1])
                        nameList.firstNameSecondaryLang = user["request"].demographicDetails.identity["firstName"][1].value;
                    nameList.gender = user["request"].demographicDetails.identity["gender"][0].value;
                    nameList.yearOfBirth = user["request"].demographicDetails.identity["yearOfBirth"];
                    nameList.monthOfBirth = user["request"].demographicDetails.identity["monthOfBirth"];
                    nameList.dayOfBirth = user["request"].demographicDetails.identity["dayOfBirth"];
                    nameList.emailId = user["request"].demographicDetails.identity["email"];
                    nameList.passportNumber = user["request"].demographicDetails.identity["passportNumber"];
                    nameList.parentOrGuardianRID = user["request"].demographicDetails.identity["parentOrGuardianRID"];
                    nameList.parentOrGuardianCNIE = user["request"].demographicDetails.identity["parentOrGuardianCNIE"];
                    if (user["request"].demographicDetails.identity["birthCertificateNumber"]) {
                        nameList.birthCertificateNumber = user["request"].demographicDetails.identity["birthCertificateNumber"];
                    }
                    if (user["request"].demographicDetails.identity["civilRegistryNumber"]) {
                        nameList.civilRegistryNumber = user["request"].demographicDetails.identity["civilRegistryNumber"];
                    }
                    nameList.phoneNumber = user["request"].demographicDetails.identity["phone"];
                    if (user["request"].demographicDetails.identity["nationality"] && user["request"].demographicDetails.identity["nationality"].length > 0) {
                        this.recoverDynamicFieldValues('nationality', this.primaryLeftTorRightLanguage).then(() => {
                            nameList.nationality = this.primaryLeftTorRightLanguageDropDownFields['nationality'].filter(nationality => nationality.valueCode === user["request"].demographicDetails.identity["nationality"][0].value)[0].valueName;
                        });
                        this.recoverDynamicFieldValues('nationality', this.secondaryRightToLeftLanguage).then(() => {
                            nameList.nationalitySecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['nationality'].filter(nationality => nationality.valueCode === user["request"].demographicDetails.identity["nationality"][1].value)[0].valueName;
                        });
                    }
                    this.dropdownApiCall(this.configService.getConfig()[CONFIG_KEYS.mosip_country_code], 'region').then(() => {
                        nameList.region = this.primaryLeftTorRightLanguageDropDownFields['region'].filter(region => region.valueCode === user["request"].demographicDetails.identity["region"][0].value)[0].valueName;
                        nameList.regionSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['region'].filter(region => region.valueCode === user["request"].demographicDetails.identity["region"][0].value)[0].valueName;
                    });
                    this.dropdownApiCall(user["request"].demographicDetails.identity["region"][0].value, 'province').then(() => {
                        nameList.province = this.primaryLeftTorRightLanguageDropDownFields['province'].filter(province => province.valueCode === user["request"].demographicDetails.identity["province"][0].value)[0].valueName;
                        nameList.provinceSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['province'].filter(province => province.valueCode === user["request"].demographicDetails.identity["province"][0].value)[0].valueName;
                    });
                    this.dropdownApiCall(user["request"].demographicDetails.identity["province"][0].value, 'city').then(() => {
                        nameList.city = this.primaryLeftTorRightLanguageDropDownFields['city'].filter(city => city.valueCode === user["request"].demographicDetails.identity["city"][0].value)[0].valueName;
                        nameList.citySecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['city'].filter(city => city.valueCode === user["request"].demographicDetails.identity["city"][0].value)[0].valueName;
                    });
                    this.dropdownApiCall(user["request"].demographicDetails.identity["province"][0].value, 'city').then(() => {
                        nameList.city = this.primaryLeftTorRightLanguageDropDownFields['city'].filter(city => city.valueCode === user["request"].demographicDetails.identity["city"][0].value)[0].valueName;
                        nameList.citySecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['city'].filter(city => city.valueCode === user["request"].demographicDetails.identity["city"][0].value)[0].valueName;
                    });
                    this.dropdownApiCall(user["request"].demographicDetails.identity["city"][0].value, 'zone').then(() => {
                        nameList.zone = this.primaryLeftTorRightLanguageDropDownFields['zone'].filter(zone => zone.valueCode === user["request"].demographicDetails.identity["zone"][0].value)[0].valueName;
                        nameList.zoneSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['zone'].filter(zone => zone.valueCode === user["request"].demographicDetails.identity["zone"][0].value)[0].valueName;
                    });
                    this.dropdownApiCall(`COM${user["request"].demographicDetails.identity["province"][0].value}`, 'commun').then(() => {
                        nameList.commun = this.primaryLeftTorRightLanguageDropDownFields['commun'].filter(commun => commun.valueCode === user["request"].demographicDetails.identity["commun"][0].value)[0].valueName;
                        nameList.communSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['commun'].filter(commun => commun.valueCode === user["request"].demographicDetails.identity["commun"][0].value)[0].valueName;
                    });
                    nameList.adresseLine = user["request"].demographicDetails.identity["addressLine1"][0].value;
                    if (user["request"].demographicDetails.identity["addressLine1"][1])
                        nameList.adresseLineSecondaryLang = user["request"].demographicDetails.identity["addressLine1"][1].value;
                    this.recoverDynamicFieldValues('placeOfBirth', this.primaryLeftTorRightLanguage).then(() => {
                        nameList.placeOfBirth = this.primaryLeftTorRightLanguageDropDownFields['placeOfBirth'].filter(placeOfBirth => placeOfBirth.valueCode === user["request"].demographicDetails.identity["placeOfBirth"][0].value)[0].valueName;
                    });
                    this.recoverDynamicFieldValues('placeOfBirth', this.secondaryRightToLeftLanguage).then(() => {
                        nameList.placeOfBirthSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['placeOfBirth'].filter(placeOfBirth => placeOfBirth.valueCode === user["request"].demographicDetails.identity["placeOfBirth"][1].value)[0].valueName;
                    });
                    if (user["request"].demographicDetails.identity["parentOrGuardianfirstName"]) {
                        nameList.firstNameGuardian = user["request"].demographicDetails.identity["parentOrGuardianfirstName"][0].value;
                        if (user["request"].demographicDetails.identity["parentOrGuardianfirstName"][1])
                            nameList.firstNameGuardianSecondaryLang = user["request"].demographicDetails.identity["parentOrGuardianfirstName"][1].value;
                    }
                    if (user["request"].demographicDetails.identity["parentOrGuardianlastName"]) {
                        nameList.lastNameGuardian = user["request"].demographicDetails.identity["parentOrGuardianlastName"][0].value;
                        if (user["request"].demographicDetails.identity["parentOrGuardianlastName"][1])
                            nameList.lastNameGuardianSecondaryLang = user["request"].demographicDetails.identity["parentOrGuardianlastName"][1].value;
                    }
                    if (user["request"].demographicDetails.identity["relationWithChild"]) {
                        this.recoverDynamicFieldValues('relationWithChild', this.primaryLeftTorRightLanguage).then(() => {
                            nameList.relationWithChild = this.primaryLeftTorRightLanguageDropDownFields['relationWithChild'].filter(relationWithChild => relationWithChild.valueCode === user["request"].demographicDetails.identity["relationWithChild"][0].value)[0].valueName;
                        });
                        this.recoverDynamicFieldValues('relationWithChild', this.secondaryRightToLeftLanguage).then(() => {
                            nameList.relationWithChildSecondaryLang = this.secondaryRightToLeftLanguageDropDownLables['relationWithChild'].filter(relationWithChild => relationWithChild.valueCode === user["request"].demographicDetails.identity["relationWithChild"][1].value)[0].valueName;
                        });
                    }
                    nameList.parentOrGuardianUIN = user["request"].demographicDetails.identity.parentOrGuardianUIN;
                    nameList.postalCode = user["request"].demographicDetails.identity.postalCode;
                    nameList.registrationCenter = "";
                    this.applicantContactDetails[1] = user["request"].demographicDetails.identity.phone;
                    this.applicantContactDetails[0] = user["request"].demographicDetails.identity.email;
                    nameList.dateOfBirth = user["request"].demographicDetails.identity["dateOfBirth"];
                    nameList.referenceCNIENumber = user["request"].demographicDetails.identity["referenceCNIENumber"];
                    nameList.residenceStatus = user["request"].demographicDetails.identity["residenceStatus"][0].value;
                    await this.getAppointmentDetails(nameList.preRegId).then(
                        (appointmentDetails) => {
                            nameList.regDto = appointmentDetails;
                        }
                    );
                    this.usersInfo.push(nameList);
                });
                if (index === preRegId.length - 1) {
                    resolve(true);
                }
            });
        });
    }

    getUserDetails(prid) {
        return new Promise((resolve) => {
            this.dataStorageService.getUser(prid.toString()).subscribe((response) => {
                if (response[appConstants.RESPONSE] !== null) {
                    resolve(
                        new UserModel(
                            prid.toString(),
                            response[appConstants.RESPONSE],
                            undefined,
                            []
                        )
                    );
                }
            });
        });
    }

    // getUserInfo(preRegId) {
    //   preRegId.forEach(prid => {
    //     return new Promise((resolve)=> {
    //       this.dataStorageService.getUser(prid).subscribe(
    //         response => {
    //         if(response[appConstants.RESPONSE]!== null){
    //           this.nameList.preRegId = response[appConstants.RESPONSE].preRegistrationId;
    //           this.nameList.status = response[appConstants.RESPONSE].statusCode;
    //           this.nameList.fullName = response[appConstants.RESPONSE].demographicDetails.identity.fullName[0].value;
    //           this.nameList.fullNameSecondaryLang =
    //           response[appConstants.RESPONSE].demographicDetails.identity.fullName[1].value;
    //           this.nameList.postalCode = response[appConstants.RESPONSE].demographicDetails.identity.postalCode;
    //           this.nameList.registrationCenter = '';
    //         }
    //         resolve(true);
    //         });
    //     });

    //   });
    // }

    getAppointmentDetails(preRegId) {
        return new Promise((resolve) => {
            this.dataStorageService
                .getAppointmentDetails(preRegId)
                .subscribe((response) => {
                    this.regCenterId =
                        response[appConstants.RESPONSE].registration_center_id;
                    resolve(response[appConstants.RESPONSE]);
                });
        });
    }

    getRegCenterDetails() {
        return new Promise((resolve) => {
            this.dataStorageService
                .getRegistrationCentersById(this.regCenterId, this.primaryLeftTorRightLanguage)
                .subscribe((response) => {
                    if (response[appConstants.RESPONSE]) {
                        for (let i = 0; i < this.usersInfo.length; i++) {
                            this.usersInfo[i].registrationCenter =
                                response[appConstants.RESPONSE].registrationCenters[0];
                        }

                        resolve(true);
                    }
                });
        });
    }

    async apiCalls() {
        return new Promise(async (resolve, reject) => {
            if (!this.usersInfo[0].registrationCenter) {
                await this.getRegistrationCenterInPrimaryLanguage(
                    this.usersInfo[0].regDto.registration_center_id,
                    localStorage.getItem("langCode")
                );
                await this.getRegistrationCenterInSecondaryLanguage(
                    this.usersInfo[0].regDto.registration_center_id,
                    this.secondaryRightToLeftLanguage
                );
            } else {
                await this.getRegistrationCenterInSecondaryLanguage(
                    this.usersInfo[0].registrationCenter.id,
                    this.secondaryRightToLeftLanguage
                );
            }
            this.formatDateTime();
            await this.qrCodeForUser();
            const factoryPrimaryLanguage = new LanguageFactory(this.primaryLeftTorRightLanguage);
            const responsePrimaryLanguage = factoryPrimaryLanguage.getCurrentlanguage();
            this.primaryLeftToRightLanguageLabels = responsePrimaryLanguage["acknowledgement"];
            let factorySecondaryLanguage = new LanguageFactory(this.secondaryRightToLeftLanguage);
            let responseSecondaryLanguage = factorySecondaryLanguage.getCurrentlanguage();
            this.secondaryRightToLeftLanguageLabels = responseSecondaryLanguage["acknowledgement"];

            await this.getTemplate();
            this.showSpinner = false;
            resolve(true);
        });
    }

    async qrCodeForUser() {
        return new Promise((resolve, reject) => {
            this.usersInfo.forEach(async (user) => {
                await this.generateQRCode(user);
                if (this.usersInfo.indexOf(user) === this.usersInfo.length - 1) {
                    resolve(true);
                }
            });
        });
    }

    formatDateTime() {
        for (let i = 0; i < this.usersInfo.length; i++) {
            if (!this.usersInfo[i].bookingData) {
                this.usersInfo[i].bookingDataPrimary = Utils.getBookingDateTime(
                    this.usersInfo[i].regDto.appointment_date,
                    this.usersInfo[i].regDto.time_slot_from,
                    localStorage.getItem("langCode")
                );
                this.usersInfo[i].bookingTimePrimary = Utils.formatTime(
                    this.usersInfo[i].regDto.time_slot_from
                );
                this.usersInfo[i].bookingDataSecondary = Utils.getBookingDateTime(
                    this.usersInfo[i].regDto.appointment_date,
                    this.usersInfo[i].regDto.time_slot_from,
                    localStorage.getItem("secondaryLangCode")
                );
                this.usersInfo[i].bookingTimeSecondary = Utils.formatTime(
                    this.usersInfo[i].regDto.time_slot_from
                );
            } else {
                const date = this.usersInfo[i].bookingData.split(",");
                this.usersInfo[i].bookingDataPrimary = Utils.getBookingDateTime(
                    date[0],
                    date[1],
                    localStorage.getItem("langCode")
                );
                this.usersInfo[i].bookingTimePrimary = Utils.formatTime(date[1]);
                this.usersInfo[i].bookingDataSecondary = Utils.getBookingDateTime(
                    date[0],
                    date[1],
                    localStorage.getItem("secondaryLangCode")
                );
                this.usersInfo[i].bookingTimeSecondary = Utils.formatTime(date[1]);
            }
        }
    }

    automaticNotification() {
        setTimeout(() => {
            this.sendNotification(this.applicantContactDetails, false);
        }, 500);
    }

    async getRegistrationCenterInSecondaryLanguage(
        centerId: string,
        langCode: string
    ) {
        return new Promise((resolve, reject) => {
            const subs = this.dataStorageService
                .getRegistrationCenterByIdAndLangCode(centerId, langCode)
                .subscribe((response) => {
                    this.secondaryRightToLeftLanguageLanguageRegistrationCenter =
                        response["response"]["registrationCenters"][0];
                    resolve(true);
                });
            this.subscriptions.push(subs);
        });
    }

    async getRegistrationCenterInPrimaryLanguage(
        centerId: string,
        langCode: string
    ) {
        return new Promise((resolve, reject) => {
            const subs = this.dataStorageService
                .getRegistrationCenterByIdAndLangCode(centerId, langCode)
                .subscribe((response) => {
                    this.usersInfo[0].registrationCenter =
                        response["response"]["registrationCenters"][0];
                    resolve(true);
                });
            this.subscriptions.push(subs);
        });
    }

    getTemplate() {
        return new Promise((resolve, reject) => {
            const subs = this.dataStorageService
                .getGuidelineTemplate("Onscreen-Acknowledgement")
                .subscribe((response) => {
                    this.guidelines = response["response"]["templates"][0].fileText.split(
                        "\n"
                    );
                    // if (!this.guidelines || this.guidelines.length <= 1) {
                    //     this.guidelines = new Array();
                    //     for (let i = 1; i <= 10; i++) {
                    //         this.guidelines.push('Directive Bidon ' + i);
                    //     }
                    // }
                    resolve(true);
                });
            this.subscriptions.push(subs);
        });
    }

    download() {
        window.scroll(0, 0);
        const element = document.getElementById("print-section");
        html2pdf(element, this.opt);
    }

    async generateBlob() {
        const element = document.getElementById("print-section");
        return await html2pdf()
            .set(this.opt)
            .from(element)
            .outputPdf("dataurlstring");
    }

    async createBlob() {
        const dataUrl = await this.generateBlob();
        // convert base64 to raw binary data held in a string
        const byteString = atob(dataUrl.split(",")[1]);

        // separate out the mime component
        const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];

        // write the bytes of the string to an ArrayBuffer
        const arrayBuffer = new ArrayBuffer(byteString.length);

        var _ia = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            _ia[i] = byteString.charCodeAt(i);
        }

        const dataView = new DataView(arrayBuffer);
        return await new Blob([dataView], {type: mimeString});
    }

    sendAcknowledgement() {
        const data = {
            case: "APPLICANTS",
            notificationTypes: this.notificationTypes,
            applicantEmail: undefined,
            applicantNumber: undefined

        };
        if (this.usersInfo.length == 1) { // TODO @Youssef & @khaled : new rule !!
            data.applicantEmail = this.usersInfo[0].emailId;
            data.applicantNumber = this.usersInfo[0].phoneNumber;
        }
        const subs = this.dialog
            .open(DialougComponent, {
                width: "30rem",
                data: data,
            })
            .afterClosed()
            .subscribe((applicantNumber) => {
                if (applicantNumber) {
                    this.sendNotification(applicantNumber, true);
                }
            });
        this.subscriptions.push(subs);
    }

    async generateQRCode(name) {
        const index = this.usersInfo.indexOf(name);
        if (!this.usersInfo[index].qrCodeBlob) {
            return new Promise((resolve, reject) => {
                const subs = this.dataStorageService
                    .generateQRCode(name.preRegId)
                    .subscribe((response) => {
                        this.usersInfo[index].qrCodeBlob = response["response"].qrcode;
                        resolve(true);
                    });
            });
        }
    }

    async sendNotification(applicantNumber, additionalRecipient: boolean) {
        this.fileBlob = await this.createBlob();
        this.usersInfo.forEach((user) => {
            const notificationDto = new NotificationDtoModel(
                user.lastName,
                user.preRegId,
                user.bookingData
                    ? user.bookingData.split(",")[0]
                    : user.regDto.appointment_date,
                Number(user.bookingTimePrimary.split(":")[0]) < 10
                    ? "0" + user.bookingTimePrimary
                    : user.bookingTimePrimary,
                applicantNumber && applicantNumber[1] === undefined ? null : applicantNumber[1],
                applicantNumber && applicantNumber[0] === undefined ? null : applicantNumber[0],
                additionalRecipient,
                false
            );
            const model = new RequestModel(
                appConstants.IDS.notification,
                notificationDto
            );
            this.notificationRequest.append(
                appConstants.notificationDtoKeys.notificationDto,
                JSON.stringify(model).trim()
            );
            this.notificationRequest.append(
                appConstants.notificationDtoKeys.langCode,
                localStorage.getItem("langCode")
            );
            this.notificationRequest.append(
                appConstants.notificationDtoKeys.file,
                this.fileBlob,
                `${user.preRegId}.pdf`
            );
            const subs = this.dataStorageService
                .sendNotification(this.notificationRequest)
                .subscribe((response) => {
                });
            this.subscriptions.push(subs);
            this.notificationRequest = new FormData();
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    getPreRegTimeStamp(): string {
        if (this.updatedDateTime) {
            return this.getDateTimeInRightFormFromTimestamp(this.updatedDateTime);
        } else {
            return this.getDateTimeInRightFormFromTimestamp(this.createdDateTime);
        }
    }

    getAppointmentTime(user): string {
        if (user.bookingDataPrimary && user.bookingDataPrimary.toString().indexOf('9999') < 0) {
            return `le ${user.bookingDataPrimary}, ${user.bookingTimePrimary}`;
        } else {
            return "";
        }
    }

    getDateTimeInRightFormFromTimestamp(timestamp): string {
        var dateTime = new Date(timestamp);
        var day = this.getNumberStringFromPartOfDateTime(dateTime.getDate());
        var month = this.getNumberStringFromPartOfDateTime(dateTime.getMonth() + 1);
        var year = dateTime.getFullYear() + "";
        var hour = this.getNumberStringFromPartOfDateTime(dateTime.getHours());
        var minutes = this.getNumberStringFromPartOfDateTime(dateTime.getMinutes());
        var seconds = this.getNumberStringFromPartOfDateTime(dateTime.getSeconds());
        return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
    }

    getNumberStringFromPartOfDateTime(partOfDateTime): string {
        return (partOfDateTime >= 10) ? `${partOfDateTime}` : `0${partOfDateTime}`;
    }

    getPiecesJustificativesToBringTmp(user: NameList): string[] {
        const piecesJustificativesToBring = new Array();
        const [yyyy, mm, dd] = user.dateOfBirth.split("/");
        const birthDay = new Date(`${yyyy}-${mm}-${dd}`);
        const ageOfApplicant = this.calculateAge(birthDay);
        if ("NFR" === user.residenceStatus) {
            if (ageOfApplicant >= 18) {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfCNIEMandatory);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResident);
            } else if (ageOfApplicant >= 12 && user.referenceCNIENumber) {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfCNIE);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResident);
            } else if (ageOfApplicant >= 12) {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfBirthCertificat);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResident);
            } else if (ageOfApplicant >= 5) {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfBirthCertificat);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResident);
            } else {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfBirthCertificat);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResident);
            }
        } else {
            if (ageOfApplicant >= 5) {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResidencyCard);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
            } else {
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfResidencyCard);
                piecesJustificativesToBring.push(this.primaryLeftToRightLanguageLabels.proofOfSignedPreRegForm);
            }
        }
        return piecesJustificativesToBring;
    }

    getPiecesJustificativesToBring(user: NameList): string[] {
        const piecesJustificativesToBring = new Array();
        const [yyyy, mm, dd] = user.dateOfBirth.split("/");
        const birthDay = new Date(`${yyyy}-${mm}-${dd}`);
        const ageOfApplicant = this.calculateAge(birthDay);
        if (this.identityData && this.identityData.proofsToBring) {
            this.identityData.proofsToBring.forEach(proofToBring => {
                let verifyConditions = (proofToBring.residenceStatus) ? proofToBring.residenceStatus === user.residenceStatus : true;
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

    calculateAge(birthday) {
        var ageDifMs = Date.now() - birthday;
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    returnToDashboard() {
        this.router.navigate([`${this.primaryLeftTorRightLanguage}/dashboard`]);
    }


    dropdownApiCall(locationCode, fieldId): Promise<void> {
        if (this.locationHeirarchy.includes(fieldId)) {
            return new Promise<void>((resolve, reject) => {
                this.primaryLeftTorRightLanguageDropDownFields[fieldId] = [];
                this.secondaryRightToLeftLanguageDropDownLables[fieldId] = [];
                const loadLocationDataPromise = this.loadLocationData(locationCode, fieldId);
                if (loadLocationDataPromise) {
                    loadLocationDataPromise.then(values => {
                        resolve();
                    }).catch(err => {
                        reject();
                    });
                } else {
                    reject();
                }
            });
        } else {
            return null;
        }
    }

    loadLocationData(locationCode: string, fieldName: string): Promise<void> {
        if (fieldName && fieldName.length > 0) {
            return new Promise<void>((resolve, reject) => {
                const getPrimaryLangCodeLocationImmediateHierearchyPromise = new Promise<void>((resolve1, reject1) => {
                    this.dataStorageService
                        .getLocationImmediateHierearchy(this.primaryLeftTorRightLanguage, locationCode)
                        .subscribe(
                            (response) => {
                                if (response[appConstants.RESPONSE]) {
                                    response[appConstants.RESPONSE][
                                        appConstants.DEMOGRAPHIC_RESPONSE_KEYS.locations
                                        ].forEach((element) => {
                                        let codeValueModal: CodeValueModal = {
                                            valueCode: element.code,
                                            valueName: element.name,
                                            languageCode: this.primaryLeftTorRightLanguage,
                                        };
                                        this.primaryLeftTorRightLanguageDropDownFields[`${fieldName}`].push(codeValueModal);
                                    });
                                }
                                resolve1();
                            },
                            (error) => {
                                console.log(error);
                                reject1();
                            }
                        );
                });
                const getSecondaryLangCodeLocationImmediateHierearchyPromise = new Promise<void>((resolve2, reject2) => {
                    if (this.primaryLeftTorRightLanguage !== this.secondaryRightToLeftLanguage) {
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
                                            this.secondaryRightToLeftLanguageDropDownLables[`${fieldName}`].push(
                                                codeValueModal
                                            );
                                        });
                                    }
                                    resolve2();
                                },
                                (error) => {
                                    console.log(error);
                                    reject2();
                                }
                            );
                    } else {
                        resolve2()
                    }
                });
                Promise.all([getPrimaryLangCodeLocationImmediateHierearchyPromise, getSecondaryLangCodeLocationImmediateHierearchyPromise])
                    .then(values => {
                        resolve();
                    })
                    .catch(err => {
                        reject();
                    });
            });
        } else {
            return null;
        }
    }

    recoverDynamicFieldValues(fieldId, lang): Promise<void> {
        return new Promise((resolve) => {
            this.dataStorageService
                .getDynamicFieldsandValues(lang)
                .subscribe((response) => {
                    let dynamicField = response[appConstants.RESPONSE]["data"];
                    dynamicField.forEach((res) => {
                        if (
                            fieldId === res.name &&
                            res.langCode === this.primaryLeftTorRightLanguage
                        ) {
                            this.filterOnLangCode(
                                this.primaryLeftTorRightLanguage,
                                fieldId,
                                res["fieldVal"]
                            );
                        }
                        if (this.primaryLeftTorRightLanguage !== this.secondaryRightToLeftLanguage) {
                            if (
                                fieldId === res.name &&
                                res.langCode === this.secondaryRightToLeftLanguage
                            ) {
                                this.filterOnLangCode(
                                    this.secondaryRightToLeftLanguage,
                                    fieldId,
                                    res["fieldVal"]
                                );
                            }
                        }
                    });
                    resolve();
                });
        });
    }


    private filterOnLangCode(langCode: string, field: string, entityArray: any) {
        return new Promise((resolve, reject) => {
            if (entityArray) {
                this.primaryLeftTorRightLanguageDropDownFields[field] = [];
                this.secondaryRightToLeftLanguageDropDownLables[field] = [];
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
                        if (langCode === this.primaryLeftTorRightLanguage) {
                            this.primaryLeftTorRightLanguageDropDownFields[field].push(codeValue);
                        } else {
                            this.secondaryRightToLeftLanguageDropDownLables[field].push(codeValue);
                        }
                        resolve(true);
                    }
                });
            }
        });
    }


    replaceDateTemplateInFooterMessageWithExpiryDate(message: string, createdDateTime: string) {
        return message.replace('DD/MM/YYYY', this.getExpiryDateStringValueFromCreationDate(createdDateTime));
    }

    getExpiryDateStringValueFromCreationDate(createdDateTime: string): string {
        const expirationDate = this.getExpiryDateFromCreationDate(createdDateTime);
        return `${this.shiftZeroToDateElement(expirationDate.getDate())}/${this.shiftZeroToDateElement(expirationDate.getMonth() + 1)}/${expirationDate.getFullYear()}`;
    }

    getExpiryDateFromCreationDate(createdDateTime: string): Date {
        const creationDate = new Date(createdDateTime);
        const expiryPeriodWithoutBooking = Number(this.configService.getConfigByKey(IDS.expiryPeriodWithoutBooking));
        const expirationDate = this.addDays(creationDate, expiryPeriodWithoutBooking);
        return expirationDate;
    }

    private addDays(date, days): Date {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private shiftZeroToDateElement(dateElement: number): string {
        return (dateElement < 10) ? `0${dateElement}` : `${dateElement}`;
    }

    getDateOfBirth(user: NameList): string {
        return (!user.monthOfBirth) ? user.yearOfBirth : (!user.dayOfBirth) ? `${user.monthOfBirth}/${user.yearOfBirth}` : `${user.dayOfBirth}/${user.monthOfBirth}/${user.yearOfBirth}`;
    }

}
