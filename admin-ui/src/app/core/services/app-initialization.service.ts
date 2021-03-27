import {Injectable} from '@angular/core';
import {AuthentificationService} from './authentification.service';
import {AppPopUpDialogUtilityService} from '../../shared/utilities/app-pop-up-dialog-utility.service';

@Injectable({
    providedIn: 'root'
})
export class AppInitializationService {

    constructor(
        private authentificationService: AuthentificationService,
        private appPopUpDialogUtilityService: AppPopUpDialogUtilityService
    ) {
    }

    loadInitialization(): Promise<void> {
        const appLoadingMatDialogRef = this.appPopUpDialogUtilityService.openAppLoadingPopUp();
        return new Promise<void>((resolve, reject) => {
            this.authentificationService.setUserAuthentificationDetailsFromAuthManger().then(() => {
                resolve();
            }).catch(() => {
                reject();
            }).finally(() => {
                appLoadingMatDialogRef.close();
            });
        });
    }

}
