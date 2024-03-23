import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AUTH_TOKEN } from '@app/consts/profile.const';
import { CommunicationService } from '@app/services/communication.service';
import { Observable, catchError, map, of, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private communicationService: CommunicationService) {}

    getToken(): string {
        return localStorage.getItem(AUTH_TOKEN) || '';
    }

    logout() {
        const token = this.getToken();
        localStorage.removeItem(AUTH_TOKEN);
        this.communicationService.logout(token).subscribe();
    }

    log(token: string | null): void {
        if (token) {
            localStorage.setItem(AUTH_TOKEN, token);
        }
    }

    isLoggedIn(): Observable<boolean> {
        return this.communicationService.isLoggedIn(this.getToken()).pipe(
            map(() => true),
            catchError(() => of(false)),
        );
    }

    login(email: string, password: string) {
        return this.communicationService.login(email, password).pipe(
            map((response: HttpResponse<string>) => {
                if (response.status === HttpStatusCode.Ok) {
                    const body = JSON.parse(response.body as string);
                    this.log(body.token);
                    return true;
                } else {
                    return new Error('Undexpected status code');
                }
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
