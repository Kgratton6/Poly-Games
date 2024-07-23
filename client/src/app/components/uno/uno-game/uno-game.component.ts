import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ColorDialogComponent } from '@app/components/uno/color-dialog/color-dialog.component';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { CHANGE_COLOR, DRAW_2, DRAW_4, MY_PLAYER_POSITION, SKIP_TURN } from '@app/consts/game.const';
import { DEFAULT_TABLE31 } from '@app/consts/player.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Card } from '@app/interfaces/card';
import { TableUno } from '@app/interfaces/game31';
import { PlayerUno } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameVisualsService } from '@app/services/game-visuals.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketUnoService } from '@app/services/socket-uno.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-uno-game',
    templateUrl: './uno-game.component.html',
    styleUrls: ['./uno-game.component.scss'],
})
export class UnoGameComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    tableUno: TableUno = DEFAULT_TABLE31;
    slots: { player: PlayerUno | null; isHost: boolean }[] = [];
    cards: Card[] = [];
    dump: Card[] = [];
    isHost = false;
    animationOffset = 0;
    questionIcon = faQuestionCircle;
    isPlayerUno = false;
    unoPlayer = '';

    constructor(
        private socket: SocketUnoService,
        protected notification: NotificationService,
        protected token: TokenService,
        private router: Router,
        private gameVisuals: GameVisualsService,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.GameInformation, (currentTable: TableUno) => {
            this.tableUno = currentTable;
            if (this.tableUno.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the Host');
                this.isHost = true;
            }
            this.slots = this.gameVisuals.updateSlotsUno(this.tableUno.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.Players, (players: PlayerUno[]) => {
            this.tableUno.players = players;
            if (this.tableUno.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the host.');
                this.isHost = true;
            }
            this.slots = this.gameVisuals.updateSlotsUno(this.tableUno.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.NewTurn, (newTurn: number) => {
            this.tableUno.turn = newTurn;
        });
        this.socket.on(ReceveEvents.Cards, (newCards: Card[]) => {
            this.cards = newCards;
        });
        this.socket.on(ReceveEvents.Dump, (newDump: Card[]) => {
            this.dump = newDump;
        });
        this.socket.on(ReceveEvents.Uno, (playerName: string) => {
            this.isPlayerUno = true;
            this.unoPlayer = playerName;
        });
        this.socket.on(ReceveEvents.NewCard, (newCard: Card) => {
            this.cards.push(newCard);
            this.gameVisuals.drawCardAnimation();
        });
        this.socket.on(ReceveEvents.DrawDeck, () => {
            if (this.tableUno.players[this.tableUno.turn].username !== this.yourPlayer.username) {
                this.updateAnimationOffset();
                this.gameVisuals.drawDeckAnimation();
                this.tableUno.players[this.tableUno.turn].nCards++;
            }
        });
        this.socket.on(ReceveEvents.DumpCard, (dumpedCard: Card) => {
            this.updateAnimationOffset();
            this.gameVisuals.dumpCardAnimation();
            this.dump.push(dumpedCard);
            this.tableUno.players[this.tableUno.turn].nCards--;

            if (this.tableUno.players[(this.tableUno.turn + 1) % this.tableUno.players.length].username === this.yourPlayer.username) {
                this.handleSpecial(dumpedCard.value);
            }
        });
    }

    drawCard() {
        this.socket.send(SendEvents.DrawCard);
    }

    dumpCard(cardToDump: number) {
        const toDumpCard = this.cards[cardToDump];
        if (toDumpCard.value === CHANGE_COLOR || toDumpCard.value === DRAW_4) {
            const dialogRef = this.dialog.open(ColorDialogComponent);
            dialogRef.afterClosed().subscribe((result) => {
                if (result) this.socket.send(SendEvents.DumpCard, { card: cardToDump, color: result });
            });
        } else this.socket.send(SendEvents.DumpCard, { card: cardToDump, color: 'no color' });
    }

    dontDump() {
        this.socket.send(SendEvents.DontDump);
    }

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken();
        this.router.navigate(['/home']);
    }

    handleSpecial(specialValue: number) {
        switch (specialValue) {
            case SKIP_TURN: {
                this.notification.notify('Your turn got skipped!');
                break;
            }
            case DRAW_2: {
                this.notification.notify('You have to draw cards!');
                break;
            }
            case DRAW_4: {
                this.notification.notify('You have to draw cards!');
                break;
            }
        }
    }

    updateAnimationOffset() {
        this.animationOffset = -(this.gameVisuals.getPlayerMovement() - MY_PLAYER_POSITION + this.tableUno.turn);
    }

    getCardIndices(nCards: number): number[] {
        return Array.from({ length: nCards }, (_, index) => index - (nCards - 1) / 2);
    }

    async unoRules() {
        const dialogRef: MatDialogRef<UnoRulesComponent> = this.dialog.open(UnoRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
