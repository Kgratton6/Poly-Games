import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Table31 } from '@app/interfaces/game31';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { TokenService } from '@app/services/token.service';

@Component({
    selector: 'app-tables-list',
    templateUrl: './tables-list.component.html',
    styleUrls: ['./tables-list.component.scss'],
})
export class TablesListComponent implements OnInit {
    tables31: Table31[] = [];

    constructor(
        private gameService: GameService,
        private router: Router,
        private token: TokenService,
        protected notification: NotificationService,
    ) {}

    ngOnInit(): void {
        this.gameService.getTables('thirty-one').subscribe((tables: Table31[]) => {
            this.tables31 = tables;
        });
    }

    join31(tableId: string) {
        const game = this.token.getGameToken();
        if (game) {
            const gameExists = this.tables31.find((table) => table.tableId === game.tableId);
            if (gameExists) this.notification.notify('you are already in game.');
            else this.router.navigate(['live-game/thirty-one', tableId]);
        } else {
            this.router.navigate(['live-game/thirty-one', tableId]);
        }
    }
}
