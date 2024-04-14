import { Component } from '@angular/core';
import { DEFAULT_PAGE } from '@app/consts/game.const';
import { GameService } from '@app/services/game.service';

@Component({
    selector: 'app-main-area',
    templateUrl: './main-area.component.html',
    styleUrls: ['./main-area.component.scss'],
})
export class MainAreaComponent {
    selectedComponent: string = DEFAULT_PAGE;

    constructor(private gameService: GameService) {}

    createTable(gameType: string) {
        // TODO : empecher si deja en game
        this.gameService.createTable(gameType).subscribe();
    }
}
