import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { ANIMATION_DELAY, MAX_N_PLAYERS, MY_PLAYER_POSITION } from '@app/consts/game.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { Table31 } from '@app/interfaces/game31';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
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
    movementNeeded = 0;

    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.GameInformation, (currentTable: Table31) => {
            this.table31 = currentTable;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the Host');
                this.isHost = true;
            }
            this.updateSlots();
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.table31.turn = newTurn;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            this.cards = newCards;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.cards.push(newCard);
            this.drawCardAnimation();
        });
        this.socket.on(ReceveEvents.NewReturnedCard, (returnedCard: Card) => {
            if (returnedCard.color !== 'null') {
                if (
                    this.dump.length > 1 &&
                    returnedCard.value === this.dump[this.dump.length - 2].value &&
                    returnedCard.color === this.dump[this.dump.length - 2].color
                ) {
                    this.drawDumpAnimation();
                } else {
                    this.dumpCardAnimation();
                    this.dump.push(returnedCard);
                }
            } else {
                this.dump = [];
            }
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
            this.table31.players = players;
            if (this.table31.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the new host.');
                this.isHost = true;
            }
            this.updateSlots();
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

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken(); // TODO : doent delete the token
        this.router.navigate(['/home']);
    }

    updateSlots() {
        const tempArray: { player: Player31 | null; isHost: boolean }[] = Array.from({ length: MAX_N_PLAYERS }, (_, i) => ({
            player: this.table31.players[i] || null,
            isHost: i === 0 && this.table31.players[0]?.username === this.yourPlayer.username,
        }));

        const yourPlayerIndex = tempArray.findIndex((slot) => slot.player?.username === this.yourPlayer.username);
        this.movementNeeded = MY_PLAYER_POSITION - (yourPlayerIndex % MAX_N_PLAYERS);

        for (let i = 0; i < tempArray.length; i++) {
            const newIndex = (i + this.movementNeeded) % tempArray.length;
            this.slots[newIndex] = tempArray[i];
        }
        [this.slots[0], this.slots[2]] = [this.slots[2], this.slots[0]];
    }

    dumpCardAnimation() {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.animationOffset = -(this.movementNeeded - 4 + this.table31.turn);
        setTimeout(() => {
            const returnedCardElement = document.querySelector('.center-image.dump-stack-card.current-returned');
            if (returnedCardElement) {
                returnedCardElement.classList.add('dumping-card');
                setTimeout(() => {
                    returnedCardElement.classList.remove('dumping-card');
                }, ANIMATION_DELAY);
            }
        }, 0);
    }

    drawDumpAnimation() {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        this.animationOffset = -(this.movementNeeded - 4 + this.table31.turn);
        if (this.animationOffset !== 0) {
            setTimeout(() => {
                const returnedCardElement = document.querySelector('.center-image.dump-stack-card.current-returned');
                if (returnedCardElement) {
                    returnedCardElement.classList.add('drawing-dump');
                    setTimeout(() => {
                        returnedCardElement.classList.remove('drawing-dump');
                        this.dump.pop();
                    }, ANIMATION_DELAY);
                }
            }, 0);
        } else {
            this.dump.pop();
        }
    }

    drawCardAnimation() {
        setTimeout(() => {
            const cardElements = document.querySelectorAll('.card');
            const newCardElement = cardElements[cardElements.length - 1];
            newCardElement.classList.add('new-card');
            setTimeout(() => {
                newCardElement.classList.remove('new-card');
            }, ANIMATION_DELAY);
        }, 0);
    }
}
