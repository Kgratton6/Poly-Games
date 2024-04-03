import { Injectable } from '@angular/core';
import { AUTH_TOKEN, TABLE_TOKEN } from '@app/consts/profile.const';

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

    getTableToken(): string {
        return localStorage.getItem(TABLE_TOKEN) || '';
    }

    deleteTableToken(): void {
        localStorage.removeItem(TABLE_TOKEN);
    }

    setTableToken(token: string): void {
        if (token) {
            localStorage.setItem(TABLE_TOKEN, token);
        }
    }
}
