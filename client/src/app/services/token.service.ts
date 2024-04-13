import { Injectable } from '@angular/core';
import { GAME_TOKEN } from '@app/consts/game.const';
import { AUTH_TOKEN } from '@app/consts/profile.const';
import { LiveGame } from '@app/interfaces/live-game';

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

    getGameToken(): LiveGame | void {
        const game = localStorage.getItem(GAME_TOKEN);
        if (game) {
            return JSON.parse(game);
        }
    }

    deleteGameToken(): void {
        localStorage.removeItem(GAME_TOKEN);
    }

    setGameToken(liveGame: LiveGame): void {
        if (liveGame) {
            localStorage.setItem(GAME_TOKEN, JSON.stringify(liveGame));
        }
    }
}
