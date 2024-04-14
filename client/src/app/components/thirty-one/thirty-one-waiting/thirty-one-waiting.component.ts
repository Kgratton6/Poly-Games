import { Component, Input, OnInit } from '@angular/core';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';

@Component({
    selector: 'app-thirty-one-waiting',
    templateUrl: './thirty-one-waiting.component.html',
    styleUrls: ['./thirty-one-waiting.component.scss'],
})
export class ThirtyOneWaitingComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    tableId: string;
    players: Player31[] = [];
    isHost = false;

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected gameService: GameService,
        protected token: TokenService,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WaitingInformation, (players: Player31[]) => {
            this.players = players; // TODO : ajouter des informations, par juste les joueurs
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: Player31) => {
            this.players.push(newPlayer);
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
            this.players = players;
            if (this.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the new host.');
                this.isHost = true;
            }
        });
        this.socket.on(ReceveEvents.Host, () => {
            this.isHost = true;
        });
    }

    startGame() {
        this.socket.send(SendEvents.StartGame);
    }
}
