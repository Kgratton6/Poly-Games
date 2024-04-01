import { Injectable } from '@angular/core';
import { AUTH_TOKEN } from '@app/consts/profile.const';

@Injectable({
    providedIn: 'root',
})
export class TokenService {
    getUserToken(): string {
        return localStorage.getItem(AUTH_TOKEN) || '';
    }

    deleteUserToken(): void {
        localStorage.removeItem(AUTH_TOKEN);
    }

    setUserToken(token: string): void {
        if (token) {
            localStorage.setItem(AUTH_TOKEN, token);
        }
    }
}
