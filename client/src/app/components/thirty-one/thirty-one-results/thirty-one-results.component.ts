import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-thirty-one-results',
    templateUrl: './thirty-one-results.component.html',
    styleUrls: ['./thirty-one-results.component.scss'],
})
export class ThirtyOneResultsComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    winnerCards: Card[] = [];
    winnerName: string = '';
    questionIcon = faQuestionCircle;
    cards: Card[] = [];
    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WinnerCards, (winnerCards: Card[]) => {
            this.winnerCards = winnerCards;
        });
        this.socket.on(ReceveEvents.WinnerName, (winnerName: string) => {
            this.winnerName = winnerName;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            this.cards = newCards;
        });
    }

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken();
        this.router.navigate(['/home']);
    }

    async thirtyOneRules() {
        const dialogRef: MatDialogRef<ThirtyOneRulesComponent> = this.dialog.open(ThirtyOneRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
