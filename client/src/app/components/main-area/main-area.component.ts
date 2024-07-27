import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BlackJackRulesComponent } from '@app/components/black-jack/black-jack-rules/black-jack-rules.component';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { DEFAULT_PAGE } from '@app/consts/game.const';
import { BlackJackService } from '@app/services/black-jack.service';
import { GameService } from '@app/services/game.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-main-area',
    templateUrl: './main-area.component.html',
    styleUrls: ['./main-area.component.scss'],
})
export class MainAreaComponent {
    selectedComponent: string = DEFAULT_PAGE;

    constructor(
        private gameService: GameService,
        private readonly dialog: MatDialog,
        private blackjack: BlackJackService,
    ) {}

    createTable(gameType: string) {
        this.gameService.createTable(gameType).subscribe();
    }

    createBlackJack() {
        this.blackjack.createTable();
    }

    async thirtyOneRules() {
        const dialogRef: MatDialogRef<ThirtyOneRulesComponent> = this.dialog.open(ThirtyOneRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
    async unoRules() {
        const dialogRef: MatDialogRef<UnoRulesComponent> = this.dialog.open(UnoRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
    async blackJackRules() {
        const dialogRef: MatDialogRef<BlackJackRulesComponent> = this.dialog.open(BlackJackRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
