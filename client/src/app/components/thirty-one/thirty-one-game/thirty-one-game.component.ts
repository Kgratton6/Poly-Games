import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { MY_PLAYER_POSITION } from '@app/consts/game.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { Table31 } from '@app/interfaces/game31';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameVisualsService } from '@app/services/game-visuals.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';

@Component({
    selector: 'app-thirty-one-game',
    templateUrl: './thirty-one-game.component.html',
    styleUrls: ['./thirty-one-game.component.scss'],
})
export class ThirtyOneGameComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    table31: Table31 = DEFAULT_TABLE31;
    slots: { player: Player31 | null; isHost: boolean }[] = [];
    cards: Card[] = [];
    dump: Card[] = [];
    isHost = false;
    animationOffset = 0;

    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
        private gameVisuals: GameVisualsService,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.GameInformation, (currentTable: Table31) => {
            this.table31 = currentTable;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the Host');
                this.isHost = true;
            }
            this.slots = this.gameVisuals.updateSlots(this.table31.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
            this.table31.players = players;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the host.');
                this.isHost = true;
            }
            this.slots = this.gameVisuals.updateSlots(this.table31.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.table31.turn = newTurn;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            this.cards = newCards;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.cards.push(newCard);
            this.gameVisuals.drawCardAnimation();
        });

        // TODO : simplifier avec : qui a draw quoi
        this.socket.on(ReceveEvents.NewReturnedCard, (returnedCard: Card) => {
            if (returnedCard.color !== 'null') {
                if (
                    this.dump.length > 1 &&
                    returnedCard.value === this.dump[this.dump.length - 2].value &&
                    returnedCard.color === this.dump[this.dump.length - 2].color
                ) {
                    this.updateAnimationOffset();
                    this.gameVisuals.drawDumpAnimation(this.dump, this.table31.turn);
                } else {
                    this.updateAnimationOffset();
                    this.gameVisuals.dumpCardAnimation();
                    this.dump.push(returnedCard);
                }
            } else {
                this.dump = [];
            }
        });
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

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken();
        this.router.navigate(['/home']);
    }

    updateAnimationOffset() {
        this.animationOffset = -(this.gameVisuals.getPlayerMovement() - MY_PLAYER_POSITION + this.table31.turn);
    }

    getCardIndices(nCards: number): number[] {
        return Array.from({ length: nCards }, (_, index) => index - (nCards - 1) / 2);
    }
}
