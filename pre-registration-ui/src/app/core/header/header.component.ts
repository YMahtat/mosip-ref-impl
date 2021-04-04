import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {NavigationEnd, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog} from '@angular/material';
import {DialougComponent} from 'src/app/shared/dialoug/dialoug.component';
import {Subscription} from 'rxjs';
import LanguageFactory from 'src/assets/i18n';
import {AutoLogoutService} from "../services/auto-logout.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewChecked, OnDestroy {

    flag = false;
    subscription: Subscription;
    primaryLang: string;

    isDash: boolean;

    message = {};
    subscriptions: Subscription[] = [];

    constructor(
        public authService: AuthService,
        private translate: TranslateService,
        private autoLogout: AutoLogoutService,
        private router: Router,
        private dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {
        this.translate.use(localStorage.getItem('langCode'));
    }

    ngOnInit() {
        const subs = this.autoLogout.currentMessageAutoLogout.subscribe(
            (message) => (this.message = message)
        );
        this.subscriptions.push(subs);
        if (!this.message["timerFired"]) {
            this.autoLogout.getValues(this.primaryLang);
            this.autoLogout.setValues();
            this.autoLogout.keepWatching();
        } else {
            this.autoLogout.getValues(this.primaryLang);
            this.autoLogout.continueWatching();
        }
        this.router.events.forEach((event) => {
            if (event instanceof NavigationEnd) {
                event.urlAfterRedirects == "/eng" ? this.isDash = false : this.isDash = true;
            }
        });
    }

    ngAfterViewChecked(): void {
        this.primaryLang = localStorage.getItem('langCode');
        this.cdr.detectChanges();
    }


    onLogoClick() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate([localStorage.getItem('langCode'), 'dashboard']);
        } else {
            this.router.navigate(['/']);
        }
    }

    onHome() {
        this.router.navigate([localStorage.getItem('langCode'), "dashboard"]);
    }

    async doLogout() {
        await this.showMessage();
    }

    showMessage() {
        let factory = new LanguageFactory(localStorage.getItem('langCode'));
        let response = factory.getCurrentlanguage();
        const secondaryLanguagelabels = response['login']['logout_msg'];
        const data = {
            case: 'MESSAGE',
            message: secondaryLanguagelabels
        };
        this.dialog
            .open(DialougComponent, {
                width: '350px',
                data: data
            })
            .afterClosed()
            .subscribe(response => {
                    if (response) {
                        localStorage.removeItem('loggedOutLang');
                        localStorage.removeItem('loggedOut');
                        this.authService.onLogout();
                    }

                }
            );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    isRtlLanguage(): boolean {
        return this.primaryLang === 'ara';
    }

    getPrimaryDirection() {
        return (this.primaryLang === 'ara') ? 'rtl' : 'ltr';
    }

}
