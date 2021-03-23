import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import LanguageFactory from "../../../assets/i18n";
import {DialougComponent} from "../dialoug/dialoug.component";
import {AuthService} from "../../auth/auth.service";
import {MatDialog} from "@angular/material";

@Component({
    selector: 'app-heading-row',
    templateUrl: './heading-row.component.html',
    styleUrls: ['./heading-row.component.css']
})
export class HeadingRowComponent implements OnInit {

    @Input() title: string;
    @Input() extraTitle: string;

    constructor(
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router
    ) {
    }

    ngOnInit() {
        if (!this.title) {
            this.title = " ";
        }
    }

    onClickHomeBtnHandler() {
        this.router.navigate([localStorage.getItem('langCode'), "dashboard"]);
    }

    async onClickLogoutBtnHandler() {
        let factory = new LanguageFactory(localStorage.getItem('langCode'));
        let response = factory.getCurrentlanguage();
        const secondaryLanguagelabels = response['login']['logout_msg'];
        const yesButtonTextLabels = (response['login']['logout_yesButtonText']) ? response['login']['logout_yesButtonText'] : 'YES';
        const noButtonTextLabels = (response['login']['logout_noButtonText']) ? response['login']['logout_noButtonText'] : 'NO';
        const data = {
            case: 'CONFIRMATION',
            message: secondaryLanguagelabels,
            yesButtonText: yesButtonTextLabels,
            noButtonText: noButtonTextLabels
        };
        this.dialog.open(DialougComponent, {
            width: '350px',
            data: data
        }).afterClosed().subscribe(response => {
                if (response && response !== noButtonTextLabels) {
                    localStorage.removeItem('loggedOutLang');
                    localStorage.removeItem('loggedOut');
                    this.authService.onLogout();
                }

            }
        );
    }

}
