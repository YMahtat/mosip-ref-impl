import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RequestModel} from '../models/request.model';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MOSIP_ENDPOINT_URI} from '../../app.constants';

@Injectable({
    providedIn: 'root'
})
export class MasterdataClientService {

    constructor(
        private httpClient: HttpClient) {
    }

    getLocationImmediateChildrens(locationCode: string, langCode: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.masterdataLocationService.replace('{locationCode}', locationCode).replace('{langCode}', langCode)}`,
        );
    }

    getFilteredMaterDataTypes(
        type: string,
        data: RequestModel
    ): Observable<any> {
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.masterdataTypeService.replace('{type}', type)}`,
            data
        );
    }

    getZone(langCode: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.masterdataZoneService.replace('{langCode}', langCode)}`
        );
    }

    getHolidaysZone(langCode: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.masterdataHolidaysZoneService.replace('{langCode}', langCode)}`
        );
    }

}
