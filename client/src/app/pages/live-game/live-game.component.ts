import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { Card } from '@app/interfaces/card';
import { Table31 } from '@app/interfaces/game31';
import { Player31 } from '@app/interfaces/player';
import { NotificationService } from '@app/services/notification.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-live-game',
    templateUrl: './live-game.component.html',
    styleUrls: ['./live-game.component.scss'],
})
export class LiveGameComponent implements OnInit, OnDestroy {
    tableId: string;
    table31: Table31 = DEFAULT_TABLE31;
    cards: Card[] = [];
    selfPosition: number; // TODO : changer le nombre de cartes actuelles avec
    returnedCard: Card = {
        color: 'null',
        value: 0,
    };
    constructor(
        private socket: SocketService,
        private route: ActivatedRoute,
        private notification: NotificationService,
    ) {}

    ngOnInit() {
        this.route.paramMap.subscribe((params) => {
            const tableId = params.get('tableId');
            if (tableId) this.tableId = tableId;
        });

        this.socket.on(ReceveEvents.ConnectionConfirmation, (message: string) => {
            this.notification.notify(message);
            // this.socket.send(SendEvents.GetCards);
        });

        this.socket.on(ReceveEvents.Error, (error: string) => {
            this.notification.notify(error);
        });

        this.socket.on(ReceveEvents.GameInformation, (currentTable: Table31) => {
            this.table31 = currentTable;
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.table31.turn = newTurn;
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: Player31) => {
            this.table31.players.push(newPlayer);
        });

        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            console.log(newCards);
            this.cards = newCards;
        });

        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            console.log(newCard);
            this.cards.push(newCard);
        });

        this.socket.on(ReceveEvents.NewReturnedCard, (returnedCard: Card) => {
            console.log(returnedCard);
            this.returnedCard = returnedCard;
        });

        this.socket.on('deck', (deck: Card) => {
            console.log(deck);
        });

        this.socket.connect(this.tableId);
    }

    ngOnDestroy() {
        this.socket.disconnect();
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
}
