import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Table31 } from '@app/interfaces/game31';
import { map } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    tokenService: unknown;
    constructor(
        private communicationService: CommunicationService,
        private router: Router,
    ) {}

    createTable(gameType: string) {
        return this.communicationService.createTable(gameType).pipe(
            map((tableId: string) => {
                this.router.navigate([`live-game/${gameType}`, tableId]);
            }),
        );
    }

    getTables(gameType: string) {
        return this.communicationService.getTables(gameType).pipe(
            map((users: Table31[]) => {
                return users;
            }),
        );
    }
}
