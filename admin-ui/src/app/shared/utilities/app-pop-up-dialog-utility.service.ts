import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AppLoadingComponent} from '../components/app-loading/app-loading.component';
import {ComponentType} from '@angular/cdk/portal';
import {MatDialogConfig} from '@angular/material/dialog/dialog-config';

@Injectable({
    providedIn: 'root'
})
export class AppPopUpDialogUtilityService {

    constructor(
        private matDialog: MatDialog
    ) {
    }

    public openPopUpDialog(component: ComponentType<any>, optionsConfig?: MatDialogConfig<any>): MatDialogRef<any> {
        return this.matDialog.open(component, optionsConfig);
    }

    public openPopUpWithDisablingClose(component: ComponentType<any>): MatDialogRef<any> {
        return this.openPopUpDialog(component, {disableClose: true});
    }

    public openAppLoadingPopUp(): MatDialogRef<any> {
        return this.openPopUpWithDisablingClose(AppLoadingComponent);
    }

}
