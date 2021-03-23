import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {AppLanguageStorageService} from '../../shared/storage-services/app-language-storage.service';
import {DEFAULT_PRIMARY_LANGUAGE_CODE} from '../../app.constants';
import {AuthUserDetailsEmitterService} from '../../shared/emitters/auth-user-details-emitter.service';

@Component({
    selector: 'app-user-hamburger-menu',
    templateUrl: './user-hamburger-menu.component.html',
    styleUrls: ['./user-hamburger-menu.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UserHamburgerComponent implements OnInit {

    @Input() data: any;
    roleName: string | null;
    roleNameSubstr: string | null;
    userName: string | null;

    dataList: any[];
    primaryLanguageCode: string;

    constructor(
        private appLanguageStorageService: AppLanguageStorageService,
        private authUserDetailsEmitterService: AuthUserDetailsEmitterService
    ) {
        this.primaryLanguageCode = DEFAULT_PRIMARY_LANGUAGE_CODE;
        this.roleName = '';
        this.roleNameSubstr = '';
        this.userName = '';
        this.dataList = [];
    }

    ngOnInit(): void {
        this.appLanguageStorageService.setAppPrimaryLanguageCode(this.primaryLanguageCode);
        this.authUserDetailsEmitterService.getCurrentAuthUserDetailsObservable().subscribe(userDetails => {
            this.userName = userDetails.getUsername();
            // @ts-ignore
            this.roleName = (userDetails.getRoles() && userDetails.getRoles().length > 0) ? userDetails.getRoles()[0] : undefined;
            this.roleNameSubstr = userDetails.getRolesAsString();
        });
        // if (this.data !== null && this.data.menuList) {
        //     this.dataList = this.data.menuList;
        // }
        // if (this.headerService.getUsername()) {
        //     this.userName = this.headerService.getUsername();
        // }
        // if (this.headerService.getRoles()) {
        //     this.roleNameSubstr = this.headerService.getRoles();
        //     if (this.roleNameSubstr && this.roleNameSubstr.indexOf(',') !== -1) {
        //         const roleNameSplit = this.headerService.getRoles().indexOf(',');
        //         this.roleName = this.headerService
        //             .getRoles()
        //             .substring(0, roleNameSplit);
        //     } else {
        //         this.roleName = this.headerService.getRoles();
        //     }
        // }
    }

    onClickLogoutBtnHandler(): void {
        // this.logoutService.logout();
    }
}
