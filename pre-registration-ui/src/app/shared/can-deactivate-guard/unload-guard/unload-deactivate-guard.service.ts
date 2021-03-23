import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export abstract class UnloadDeactivateGuardService {
    constructor(public dialog: MatDialog) {
    }

    abstract canDeactivate(): boolean;

    // @HostListener('window:beforeunload', ['$event'])
    // unloadNotification($event: any) {
    //   if (!this.canDeactivate()) {
    //     $event.returnValue = true;
    //   }
    // }
}
