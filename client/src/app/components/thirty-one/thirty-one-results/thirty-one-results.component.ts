import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';

@Component({
    selector: 'app-thirty-one-results',
    templateUrl: './thirty-one-results.component.html',
    styleUrls: ['./thirty-one-results.component.scss'],
})
export class ThirtyOneResultsComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    winnerCards: Card[] = [];
    winnerName: string = '';
    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WinnerCards, (winnerCards: Card[]) => {
            this.winnerCards = winnerCards;
        });
        this.socket.on(ReceveEvents.WinnerName, (winnerName: string) => {
            this.winnerName = winnerName;
        });
    }

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken(); // TODO : doent delete the token
        this.router.navigate(['/home']);
    }
}
