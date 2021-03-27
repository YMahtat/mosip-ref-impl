import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MOSIP_ENDPOINT_URI} from '../../app.constants';
import {MispDto} from '../models/misp-dto.model';
import {UdpateMispStatusDto} from '../models/udpate-misp-status-dto.model';

@Injectable({
    providedIn: 'root'
})
export class MispClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getRegistrationMISPsDetails(): Observable<any> {
        return this.httpClient.get(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispsService}`);
    }

    getRegistrationMISPDetailById(mispId: string): Observable<any> {
        return this.httpClient.get(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.singleMispService.replace('{mispId}', mispId)}`);
    }

    getRegistrationMISPLicencesDetails(mispId: string): Observable<any> {
        return this.httpClient.get(
            `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispLicences.replace('{mispId}', mispId)}`
        );
    }

    createMisp(mispRequest: MispDto): Observable<any> {
        const request = {
            id: null,
            metadata: null,
            version: null,
            request: mispRequest,
            requesttime: new Date().toISOString(),
        };
        console.log(JSON.stringify(request));
        return this.httpClient.post(`${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispsService}`, request);
    }

    updateMisp(mispRequest: MispDto): Observable<any> {
        console.log(JSON.stringify(mispRequest));
        if (mispRequest && mispRequest.mispId) {
            const request = {
                id: null,
                metadata: null,
                version: null,
                request: mispRequest,
                requesttime: new Date().toISOString(),
            };
            console.log(JSON.stringify(request));
            return this.httpClient.put(
                `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispUpdateService.replace('{mispId}', mispRequest.mispId)}`,
                request
            );
        } else {
            return throwError('empty mispRequest or empty mispId !');
        }
    }

    updateMispStatus(udpateMispStatusRequest: UdpateMispStatusDto): Observable<any> {
        if (udpateMispStatusRequest && udpateMispStatusRequest.mispId) {
            const request = {
                id: null,
                metadata: null,
                version: null,
                request: udpateMispStatusRequest,
                requesttime: new Date().toISOString(),
            };
            console.log(JSON.stringify(request));
            return this.httpClient.patch(
                `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispUpdateService.replace('{mispId}', udpateMispStatusRequest.mispId)}`,
                request
            );
        } else {
            return throwError('empty udpateMispStatusRequest or empty mispId !');
        }
    }

    updateMispApprovalStatus(udpateMispApprovalStatusRequest: UdpateMispStatusDto): Observable<any> {
        if (udpateMispApprovalStatusRequest && udpateMispApprovalStatusRequest.mispId) {
            const request = {
                id: null,
                metadata: null,
                version: null,
                request: udpateMispApprovalStatusRequest,
                requesttime: new Date().toISOString(),
            };
            console.log(JSON.stringify(request));
            return this.httpClient.patch(
                `${environment.baseBasicUrl}/${MOSIP_ENDPOINT_URI.mispUpdateApprovalStatusService.replace('{mispId}', udpateMispApprovalStatusRequest.mispId)}`,
                request
            );
        } else {
            return throwError('empty udpateMispApprovalStatusRequest or empty mispId !');
        }
    }

}
