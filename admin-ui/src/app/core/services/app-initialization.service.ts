import {Injectable} from '@angular/core';
import {AuthentificationService} from '../auth-service/authentification.service';
import {MatDialog} from '@angular/material/dialog';
import {AppLoadingComponent} from '../../shared/components/app-loading/app-loading.component';

@Injectable({
    providedIn: 'root'
})
export class AppInitializationService {

    constructor(
        private authentificationService: AuthentificationService,
        private matDialog: MatDialog
    ) {
    }

    loadInitialization(): Promise<void> {
        const appLoadingMatDialogRef = this.matDialog.open(AppLoadingComponent, { disableClose: true });
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
