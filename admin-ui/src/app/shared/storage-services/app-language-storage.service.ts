import {Injectable} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';

@Injectable({
    providedIn: 'root'
})
export class AppLanguageStorageService {

    constructor(
        private localStorageService: LocalStorageService
    ) {
    }

    setAppPrimaryLanguageCode(languageCode: string): void {
        this.localStorageService.store('languageCode', languageCode);
    }

    getAppprimaryLanguageCode(): string {
        return this.localStorageService.retrieve('languageCode');
    }

}
