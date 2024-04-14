import { Component, Input, OnInit } from '@angular/core';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { NO_CARD } from '@app/consts/game.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { Table31 } from '@app/interfaces/game31';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';

@Component({
    selector: 'app-thirty-one-game',
    templateUrl: './thirty-one-game.component.html',
    styleUrls: ['./thirty-one-game.component.scss'],
})
export class ThirtyOneGameComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    table31: Table31 = DEFAULT_TABLE31;
    cards: Card[] = [];
    returnedCard: Card = NO_CARD;
    isHost = false;
    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.GameInformation, (currentTable: Table31) => {
            this.table31 = currentTable;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the Host');
                this.isHost = true;
            }
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.table31.turn = newTurn;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            this.cards = newCards;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.cards.push(newCard);
        });
        this.socket.on(ReceveEvents.NewReturnedCard, (returnedCard: Card) => {
            this.returnedCard = returnedCard;
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
            this.table31.players = players;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the new host.');
                this.isHost = true;
            }
        });
    }

    play() {
        this.socket.send(SendEvents.Play);
    }

    drawDeck() {
        this.socket.send(SendEvents.DrawDeck);
    }

    drawDump() {
        this.socket.send(SendEvents.DrawDump);
    }

    dumpCard(cardToDump: number) {
        this.socket.send(SendEvents.DumpCard, cardToDump.toString());
    }

    finishGame() {
        this.socket.send(SendEvents.FinishGame);
    }
}
