export const API_VERSION = '1.0';

export const DEFAULT_PRIMARY_LANGUAGE_CODE = 'fra';

export const LANGUAGES = ['ara', 'eng', 'fra'];

export const LANGUAGES_MAPPING = {
    eng: {
        langCode: 'eng',
        langName: 'Français',
        direction: 'ltr'
    },
    ara: {
        langCode: 'ara',
        langName: 'عربى',
        direction: 'rtl'
    },
    fra: {
        langCode: 'eng',
        langName: 'Français',
        direction: 'ltr'
    }
};

export const WEEK_DAYS = {
    eng: [
        {name: 'Monday', code: 'mon'},
        {name: 'Tuesday', code: 'tue'},
        {name: 'Wednesday', code: 'wed'},
        {name: 'Thursday', code: 'thu'},
        {name: 'Friday', code: 'fri'},
        {name: 'Saturday', code: 'sat'},
        {name: 'Sunday', code: 'sun'}
    ],
    fra: [
        {name: 'Lundi', code: 'mon'},
        {name: 'Mardi', code: 'tue'},
        {name: 'Mercredi', code: 'wed'},
        {name: 'Jeudi', code: 'thu'},
        {name: 'Vendredi', code: 'fri'},
        {name: 'samedi', code: 'sat'},
        {name: 'dimanche', code: 'sun'}
    ],
    ara: [
        {name: 'الإثنين', code: 'mon'},
        {name: 'الثلاثاء', code: 'tue'},
        {name: 'الأربعاء', code: 'wed'},
        {name: 'الخميس', code: 'thu'},
        {name: 'يوم الجمعة', code: 'fri'},
        {name: 'يوم السبت', code: 'sat'},
        {name: 'الأحد', code: 'sun'}
    ]
};

export const DEFAULT_PAGE_SIZE = 50;

export const PROCESSING_TIME_START = 15;
export const PROCESSING_TIME_END = 45;
export const PROCESSING_TIME_INTERVAL = 5;
export const TIME_SLOTS_INTERVAL = 30;


export const ROUTES = {
    HOME: 'home',
    CENTERS: 'centers',
    MACHINES: 'machines',
    DEVICES: 'devices',
    MISPS: 'misps',
    AUTH_PARTNERS: 'auth-partners',
    PARTNERS_REQUESTS: 'partners-srequests',
    SUB_ROUTES: {
        VIEW_ALL: 'view-all',
        CREATE: 'create',
        VIEW: 'view'
    },
};

export const MOSIP_URI = {
    login: 'admin/login/'
};

export const MASTERDATA_DOMAIN = `masterdata`;

export const MOSIP_ENDPOINT_URI = {
    connectedUserAuthentificationDetails: 'authmanager/authorize/admin/validateToken',
    connectedUserAuthentificationZone: 'masterdata/zones/zonename',
    masterdataLocationService: 'masterdata/locations/immediatechildren/{locationCode}/{langCode}',
    masterdataTypeService: 'masterdata/{type}/filtervalues',
    masterdataZoneService: 'masterdata/zones/leafs/{langCode}',
    masterdataHolidaysZoneService: 'masterdata/locations/level/{langCode}',
    centersSearchService: `masterdata/registrationcenters/search`,
    centerServices: `masterdata/registrationcenters`,
    machinesSearchService: 'masterdata/machines/search',
    machineServices: `masterdata/machines`,
    devicesSearchService: 'masterdata/devices/search',
    deviceServices: `masterdata/devices`,
    mispsService: 'partnermanagement/v1/misps/misps',
    singleMispService: 'partnermanagement/v1/misps/misps/mispId/{mispId}',
    mispUpdateService: 'partnermanagement/v1/misps/misps/{mispId}',
    mispLicences: 'partnermanagement/v1/misps/misps/{mispId}/licenseKey',
    authPartners: 'partnermanagement/v1/pmpartners/pmpartners',
    authPartnersServices: 'partnermanagement/v1/partners/partners',
    authPartnersDetailsServices: 'partnermanagement/v1/partners/partners/{partnerID}',
    authService: 'partnermanagement/v1/pmpartners/pmpartners/{partnerID}',
    authPartnersApiKeys: 'partnermanagement/v1/partners/partners/{partnerId}/partnerAPIKeyRequests',
    partnersRequests: 'partnermanagement/v1/pmpartners/pmpartners/PartnerAPIKeyRequests',
    partnersRequestsServices: 'partnermanagement/v1/partners/partners/{partnerId}/partnerAPIKeyRequests',
    singlePartnersRequestServices: 'partnermanagement/v1/partners/partners/{partnerId}/partnerAPIKeyRequests'
};
