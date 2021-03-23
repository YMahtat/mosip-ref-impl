import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MOSIP_ENDPOINT_URI} from '../../app.constants';
import {PartnerRequestDto} from '../models/partner-request-dto.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerRequestClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getRegistrationRequestsDetails(): Observable<any> {
        return this.httpClient.get(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.partnersRequests}`);
    }

    getRegistrationRequestDetailById(requestId: string): Observable<any> {
        // TODO @Youssef : à implémenter !
        return of(null);
    }

    createRequest(requestToCreate: PartnerRequestDto): Observable<any> {
        const request = {
            id: 'null',
            metadata: null,
            version: null,
            request: requestToCreate,
            requesttime: new Date().toISOString(),
        };
        console.log(JSON.stringify(request));
        return this.httpClient.post(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.partnersRequests}`, request);
    }

    updateRequest(requestToUpdate: PartnerRequestDto): Observable<any> {
        // TODO @Youssef : à implémenter !
        return of(null);
    }

}
