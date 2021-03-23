import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DEFAULT_PAGE_SIZE, MOSIP_ENDPOINT_URI} from '../../app.constants';
import {DeviceDto} from '../models/device-dto.model';

@Injectable({
    providedIn: 'root'
})
export class DeviceClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getDevices(primaryLanguageCode: string, pageNumber: number, deviceId?: string): Observable<any> {
        let filters: any = [];
        if (deviceId) {
            filters = [{columnName: 'id', type: 'equals', value: deviceId}];
        }
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.devicesSearchService}`,
            {
                id: null,
                metadata: null,
                request: {
                    languageCode: primaryLanguageCode,
                    filters,
                    pagination: {
                        pageFetch: DEFAULT_PAGE_SIZE,
                        pageStart: pageNumber
                    },
                    sort: []
                },
                requesttime: new Date().toISOString(),
                version: '1.0',
            }
        );
    }

    createDevice(deviceToCreate: DeviceDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            request: deviceToCreate,
        };
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.deviceServices}`,
            request
        );
    }

    updateDevice(deviceToUpdate: DeviceDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            request: deviceToUpdate,
        };
        return this.httpClient.put(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.deviceServices}`,
            request
        );
    }

}
