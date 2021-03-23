import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {MOSIP_ENDPOINT_URI} from '../../app.constants';

@Injectable({
    providedIn: 'root'
})
export class AuthUserClientService {

    constructor(
        private httpClient: HttpClient
    ) {
    }

    getConnectedUserAuthentificationDetails(): Observable<any> {
        return this.httpClient.get(`${environment.baseUrl}/${MOSIP_ENDPOINT_URI.connectedUserAuthentificationDetails}`);
    }

    getConnectedUserAuthentificationZone(userId: string, langCode: string): Observable<any> {
        let params = new HttpParams();
        params = params.append('userID', userId);
        params = params.append('langCode', langCode);
        return this.httpClient.get(
            `${environment.baseUrl}/${MOSIP_ENDPOINT_URI.connectedUserAuthentificationZone}`,
            {params}
        );
    }

}
