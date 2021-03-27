import {Injectable} from '@angular/core';
// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import {CookieService} from 'ngx-cookie-service';
import {environment} from '../../../environments/environment';
import {DEFAULT_PRIMARY_LANGUAGE_CODE, MOSIP_URI} from '../../app.constants';
import {AuthUserClientService} from '../../shared/rest-api-client-services/auth-user-client.service';
import {UserDetailsDto} from '../../shared/models/user-details-dto.model';
import {AuthUserDetailsEmitterService} from '../../shared/emitters/auth-user-details-emitter.service';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthentificationService {

    private primaryLanguageCode: string;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private authUserClientService: AuthUserClientService,
        private authUserDetailsEmitterService: AuthUserDetailsEmitterService,
        private cookieService: CookieService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
    }

    setUserAuthentificationDetailsFromAuthManger(): Promise<void> {
        this.primaryLanguageCode = this.appLanguageStorageService.getAppprimaryLanguageCode();
        return new Promise<void>((resolve, reject) => {
            this.authUserClientService.getConnectedUserAuthentificationDetails().subscribe(
                result => {
                    const authUserDetailsResultResponse = (result && result.response) ? result.response : {};
                    const authUserDetails = new UserDetailsDto(
                        authUserDetailsResultResponse.userId,
                        authUserDetailsResultResponse.email,
                        authUserDetailsResultResponse.role,
                        null,
                        authUserDetailsResultResponse.token
                    );
                    this.authUserDetailsEmitterService.saveAuthUserDetails(authUserDetails);
                    this.authUserClientService.getConnectedUserAuthentificationZone(
                        authUserDetailsResultResponse.userId,
                        this.primaryLanguageCode
                    ).subscribe(
                        zoneResult => {
                            const zoneResultResponse = (zoneResult && zoneResult.response) ? zoneResult.response : {};
                            authUserDetails.setZone(zoneResultResponse.zoneName);
                            this.authUserDetailsEmitterService.saveAuthUserDetails(authUserDetails);
                            resolve();
                        },
                        error => {
                            console.error(error);
                            reject();
                        }
                    );
                },
                error => {
                    console.error(error);
                    reject();
                }
            );
        });
    }

    redirectToLoginPageByConservingRoutingContext(url: string): void {
        const stateParam = uuidv4();
        this.cookieService.set('state', stateParam, undefined, '/');
        // console.log('returning false login redirect' + stateParam);
        window.location.href = `${environment.realBaseUrl}/${MOSIP_URI.login}` + btoa(url);
    }

}
