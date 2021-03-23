import {Injectable} from '@angular/core';
import {UnloadDeactivateGuardService} from '../unload-guard/unload-deactivate-guard.service';
import {MatDialog} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export abstract class BookingDeactivateGuardService extends UnloadDeactivateGuardService {
    constructor(dialog: MatDialog) {
        super(dialog);
    }

    abstract get canDeactivateFlag(): boolean;

    canDeactivate(): boolean {
        if (!this.canDeactivateFlag) return true;
        else return false;
    }
}
