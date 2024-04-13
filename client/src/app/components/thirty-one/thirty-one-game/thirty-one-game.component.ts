import { Component, OnInit } from '@angular/core';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { NO_CARD } from '@app/consts/game.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { Card } from '@app/interfaces/card';
import { Table31 } from '@app/interfaces/game31';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';

@Component({
    selector: 'app-thirty-one-game',
    templateUrl: './thirty-one-game.component.html',
    styleUrls: ['./thirty-one-game.component.scss'],
})
export class ThirtyOneGameComponent implements OnInit {
    tableId: string;
    table31: Table31 = DEFAULT_TABLE31;
    cards: Card[] = [];
    selfPosition: number;
    returnedCard: Card = NO_CARD;
    constructor(private socket: SocketThirtyOneService) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.GameInformation, (currentTable: Table31) => {
            console.log('je recoit les game info', currentTable);
            this.table31 = currentTable;
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.table31.turn = newTurn;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            console.log('je recoit les cards', newCards);
            this.cards = newCards;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.cards.push(newCard);
        });
        this.socket.on(ReceveEvents.NewReturnedCard, (returnedCard: Card) => {
            console.log('je recoit une returned card', returnedCard);
            this.returnedCard = returnedCard;
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
