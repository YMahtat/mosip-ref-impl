import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {AuthentificationService} from '../services/authentification.service';

@Injectable()
export class ResponseHttpInterceptor implements HttpInterceptor {

    constructor(
        private authRedirectionService: AuthentificationService
    ) {
    }


    /**
     * l'interception ici est utiliser pour capturer les eventuelles erreurs HTTP, et les redirigés vers la page d'erreur,
     * tout en ouverant un pop-up indiquant l'erreur et le timestamp code.
     * @param req : requête HTTP intercepté
     * @param next : retour de la requête HTTP intercepté
     * @return : retourne l'erreur HTTP intércépté, en cas d'erreur HTTP ! (càd, les code 5XX et 4XX)
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(catchError((err: HttpErrorResponse) => {
            console.log(err); // tracer dans les logs l'erreur.
            if (err.status === 401 || err.status === 403) {
                this.authRedirectionService.redirectToLoginPageByConservingRoutingContext(window.location.href);
            }
            const error = err.message || err.statusText;
            return throwError(error);
        }));
    }

}
