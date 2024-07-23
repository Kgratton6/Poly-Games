import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { DEFAULT_PAGE } from '@app/consts/game.const';
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
    ) {}

    createTable(gameType: string) {
        this.gameService.createTable(gameType).subscribe();
    }

    async thirtyOneRules() {
        const dialogRef: MatDialogRef<ThirtyOneRulesComponent> = this.dialog.open(ThirtyOneRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
    async unoRules() {
        const dialogRef: MatDialogRef<UnoRulesComponent> = this.dialog.open(UnoRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
