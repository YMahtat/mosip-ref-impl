import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot,} from "@angular/router";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/services/config.service";
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: "root",
})
export class DefaultLangGuardService implements CanActivate {
    constructor(
        private router: Router,
        private config: ConfigService,
        private authService: AuthService
    ) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (
            this.authService.getPrimaryLang() !== localStorage.getItem("langCode")
        ) {
            localStorage.setItem("langCode", "fra");
            this.router.navigate(['fra']);
        }
        return true;
    }
}
