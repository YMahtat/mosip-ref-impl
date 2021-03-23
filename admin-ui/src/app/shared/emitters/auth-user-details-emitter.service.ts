import {Injectable} from '@angular/core';
import {UserDetailsDto} from '../models/user-details-dto.model';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthUserDetailsEmitterService {

    public defaultAuthUserDetails: UserDetailsDto = new UserDetailsDto(null, null, null, null, null);
    public currentAuthUserDetailsBehaviorSubject = new BehaviorSubject<UserDetailsDto>(this.defaultAuthUserDetails);
    public currentAuthUserDetailsObservable = this.currentAuthUserDetailsBehaviorSubject.asObservable();

    public saveAuthUserDetails(autResponse: UserDetailsDto): void {
        this.currentAuthUserDetailsBehaviorSubject.next(autResponse);
    }

    getCurrentAuthUserDetailsObservable(): Observable<UserDetailsDto> {
        return this.currentAuthUserDetailsObservable;
    }

}
