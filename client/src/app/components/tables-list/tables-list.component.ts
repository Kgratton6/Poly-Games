import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { Table31, TableUno } from '@app/interfaces/game31';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-tables-list',
    templateUrl: './tables-list.component.html',
    styleUrls: ['./tables-list.component.scss'],
})
export class TablesListComponent implements OnInit {
    tables31: Table31[] = [];
    tablesUno: TableUno[] = [];

    constructor(
        private gameService: GameService,
        private router: Router,
        protected notification: NotificationService,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.gameService.getTables('thirty-one').subscribe((tables: Table31[]) => {
            this.tables31 = tables;
        });
        this.gameService.getTables('uno').subscribe((tables: TableUno[]) => {
            this.tablesUno = tables;
        });
    }

    join(gameType: string, tableId: string) {
        this.router.navigate([`live-game/${gameType}`, tableId]);
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
