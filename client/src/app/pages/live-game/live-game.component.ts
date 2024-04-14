import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '@app/services/token.service';

@Component({
    selector: 'app-live-game',
    templateUrl: './live-game.component.html',
    styleUrls: ['./live-game.component.scss'],
})
export class LiveGameComponent implements OnInit {
    constructor(
        private token: TokenService,
        private router: Router,
    ) {}

    ngOnInit() {
        const game = this.token.getGameToken();
        if (game) {
            this.router.navigate([`live-game/${game.gameType}`, game.tableId]);
        }
    }
}
