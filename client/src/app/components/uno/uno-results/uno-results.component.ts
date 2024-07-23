import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { NotificationService } from '@app/services/notification.service';
import { SocketUnoService } from '@app/services/socket-uno.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-uno-results',
    templateUrl: './uno-results.component.html',
    styleUrls: ['./uno-results.component.scss'],
})
export class UnoResultsComponent implements OnInit {
    winnerName: string = '';
    questionIcon = faQuestionCircle;
    winners: string[] = [];
    constructor(
        private socket: SocketUnoService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WinnerName, (winnerName: string) => {
            this.winnerName = winnerName;
        });
        this.socket.on(ReceveEvents.Winners, (winners: string[]) => {
            this.winners = winners;
        });
    }

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken();
        this.router.navigate(['/home']);
    }

    async unoRules() {
        const dialogRef: MatDialogRef<UnoRulesComponent> = this.dialog.open(UnoRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
