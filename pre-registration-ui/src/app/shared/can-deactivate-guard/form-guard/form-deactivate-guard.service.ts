import {Injectable} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {UnloadDeactivateGuardService} from '../unload-guard/unload-deactivate-guard.service';
import {MatDialog} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export abstract class FormDeactivateGuardService extends UnloadDeactivateGuardService {
    flag: boolean;

    constructor(dialoug: MatDialog) {
        super(dialoug);
    }

    abstract get leftToRightUserForm(): FormGroup;

    abstract get canDeactivateFlag(): boolean;

    canDeactivate(): boolean {
        if (!this.canDeactivateFlag) {
            return true;
        } else if (this.leftToRightUserForm) {
            (<any>Object).values(this.leftToRightUserForm.controls).forEach((element: FormControl) => {
                let tempFlag = element.value !== '' ? true : false;
                if (tempFlag) {
                    if (this.leftToRightUserForm.dirty) this.flag = true;
                    else this.flag = false;
                }
            });
            return !this.flag;
        }
    }
}
