import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Observable, catchError, map, of, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private logedIn: boolean = false;

    constructor(private communicationService: CommunicationService) {}

    isLoggedIn(): Observable<boolean> {
        if (this.logedIn) {
            return of(true);
        }

        return this.communicationService.isLoggedIn().pipe(
            map(() => {
                this.logedIn = true;
                return true;
            }),
            catchError(() => of(false)),
        );
    }

    login(email: string, password: string) {
        return this.communicationService.login(email, password).pipe(
            map(() => {
                console.log('je change le login state');
                this.logedIn = true;
                return true;
            }),
            catchError((error) => {
                console.log("je trasnfere l'error");
                return throwError(() => error);
            }),
        );
    }

    logout() {
        return this.communicationService.logout().pipe(
            map(() => {
                this.logedIn = false;
            }),
        );
    }
}
