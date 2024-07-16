import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
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
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

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
    questionIcon = faQuestionCircle;
    didAlreadyDraw = true;
    lastTurnPlayer: string | undefined = undefined;

    constructor(
        private socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
        private gameVisuals: GameVisualsService,
        private readonly dialog: MatDialog,
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
        this.socket.on(ReceveEvents.Dump, (newDump: Card[]) => {
            this.dump = newDump;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.didAlreadyDraw = true;
            this.cards.push(newCard);
            this.gameVisuals.drawCardAnimation();
        });

        this.socket.on(ReceveEvents.DrawDeck, () => {
            if (this.table31.players[this.table31.turn].username !== this.yourPlayer.username) {
                this.updateAnimationOffset();
                this.gameVisuals.drawDeckAnimation();
                this.table31.players[this.table31.turn].nCards++;
            }
        });
        this.socket.on(ReceveEvents.DrawDump, () => {
            if (this.table31.players[this.table31.turn].username !== this.yourPlayer.username) {
                this.updateAnimationOffset();
                this.gameVisuals.drawDumpAnimation().then(() => {
                    this.dump.pop();
                    this.table31.players[this.table31.turn].nCards++;
                });
            } else {
                this.dump.pop();
            }
        });
        this.socket.on(ReceveEvents.DumpCard, (dumpedCard: Card) => {
            this.didAlreadyDraw = false;
            this.updateAnimationOffset();
            this.gameVisuals.dumpCardAnimation();
            this.dump.push(dumpedCard);
            this.table31.players[this.table31.turn].nCards--;
        });
        this.socket.on(ReceveEvents.LastTurn, () => {
            this.lastTurnPlayer = this.table31.players[this.table31.turn].username;
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

    finishGame() {
        this.socket.send(SendEvents.FinishGame);
    }

    updateAnimationOffset() {
        this.animationOffset = -(this.gameVisuals.getPlayerMovement() - MY_PLAYER_POSITION + this.table31.turn);
    }

    getCardIndices(nCards: number): number[] {
        return Array.from({ length: nCards }, (_, index) => index - (nCards - 1) / 2);
    }

    async thirtyOneRules() {
        const dialogRef: MatDialogRef<ThirtyOneRulesComponent> = this.dialog.open(ThirtyOneRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
