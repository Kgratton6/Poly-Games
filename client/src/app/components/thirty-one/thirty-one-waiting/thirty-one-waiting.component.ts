import { Component, OnInit } from '@angular/core';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { Player31 } from '@app/interfaces/player';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';

@Component({
    selector: 'app-thirty-one-waiting',
    templateUrl: './thirty-one-waiting.component.html',
    styleUrls: ['./thirty-one-waiting.component.scss'],
})
export class ThirtyOneWaitingComponent implements OnInit {
    tableId: string;
    players: Player31[] = [];
    isHost = false;

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WaitingInformation, (players: Player31[]) => {
            this.players = players;
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: Player31) => {
            this.players.push(newPlayer);
        });
        this.socket.on(ReceveEvents.Host, (host: string) => {
            this.notification.notify(host);
            this.isHost = true;
        });
    }

    startGame() {
        this.socket.send(SendEvents.StartGame);
    }
}
