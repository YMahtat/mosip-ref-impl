import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DEFAULT_PAGE_SIZE, MOSIP_ENDPOINT_URI} from '../../app.constants';
import {UpdateCenterDto} from '../models/update-center-dto.model';
import {CreateCenterDto} from '../models/create-center-dto.model';

@Injectable({
    providedIn: 'root'
})
export class CenterClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getRegistrationCentersDetails(primaryLanguageCode: string, pageNumber: number, centerId?: string): Observable<any> {
        let filters: any = [];
        if (centerId) {
            filters = [{columnName: 'id', type: 'equals', value: centerId}];
        }
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.centersSearchService}`,
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

    createCenter(centerToCreate: CreateCenterDto): Observable<any> {
        const request = {
            id: 'string',
            metadata: null,
            request: centerToCreate,
        };
        return this.httpClient.post(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.centerServices}`,
            request
        );
    }

    updateCenter(centerToUpdate: UpdateCenterDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            request: centerToUpdate,
        };
        return this.httpClient.put(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.centerServices}`,
            request
        );
    }

}
