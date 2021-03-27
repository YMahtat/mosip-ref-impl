import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MOSIP_ENDPOINT_URI} from '../../app.constants';
import {AuthPartnerDto} from '../models/auth-partner-dto.model';
import {UdpateAuthPartnerStatusDto} from '../models/udpate-auth-partner-status-dto.model';

@Injectable({
    providedIn: 'root'
})
export class AuthPartnerClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getRegistrationAuthPartnersDetails(): Observable<any> {
        return this.httpClient.get(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.authPartners}`);
    }

    getAuthPartnerDetailsById(partnerId: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.authPartnerDetailsServices.replace('{partnerID}', partnerId)}`
        );
    }

    createAuthPartner(authPartnerToCreate: AuthPartnerDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            version: null,
            request: authPartnerToCreate,
            requesttime: new Date().toISOString(),
        };
        console.log(JSON.stringify(request));
        return this.httpClient.post(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.authPartnersServices}`, request);
    }

    updateAuthPartner(authPartnerToUpdate: AuthPartnerDto): Observable<any> {
        if (authPartnerToUpdate && authPartnerToUpdate.partnerId) {
            const request = {
                id: null,
                metadata: null,
                version: null,
                request: authPartnerToUpdate,
                requesttime: new Date().toISOString(),
            };
            console.log(JSON.stringify(request));
            return this.httpClient.put(
                `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.singleAuthPartnerServices.replace('{partnerID}', authPartnerToUpdate.partnerId)}`,
                request
            );
        } else {
            return throwError('empty authPartnerToUpdate or empty partnerId !');
        }
    }

    getRegistrationAuthPartnersApiKeysDetails(partnerId: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.authPartnersApiKeys.replace('{partnerId}', partnerId)}`
        );
    }

    updateAuthPartnerStatus(updateAuthPartnerStatusRequest: UdpateAuthPartnerStatusDto): Observable<any> {
        if (updateAuthPartnerStatusRequest && updateAuthPartnerStatusRequest.partnerId) {
            const request = {
                id: null,
                metadata: null,
                version: null,
                request: updateAuthPartnerStatusRequest,
                requesttime: new Date().toISOString(),
            };
            return this.httpClient.patch(
                `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.authService.replace('{partnerID}', updateAuthPartnerStatusRequest.partnerId)}`,
                request
            );
        } else {
            return throwError('empty updateAuthPartnerStatusRequest or empty partnerId !');
        }
    }
}
