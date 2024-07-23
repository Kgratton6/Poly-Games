import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UnoRulesComponent } from '@app/components/uno/uno-rules/uno-rules.component';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { PlayerUno } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameVisualsService } from '@app/services/game-visuals.service';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketUnoService } from '@app/services/socket-uno.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-uno-waiting',
    templateUrl: './uno-waiting.component.html',
    styleUrls: ['./uno-waiting.component.scss'],
})
export class UnoWaitingComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    tableId: string;
    players: PlayerUno[] = [];
    slots: { player: PlayerUno | null; isHost: boolean }[] = [];
    isHost = false;
    questionIcon = faQuestionCircle;

    constructor(
        protected socket: SocketUnoService,
        protected notification: NotificationService,
        protected gameService: GameService,
        protected token: TokenService,
        private router: Router,
        private gameVisuals: GameVisualsService,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WaitingInformation, (players: PlayerUno[]) => {
            this.players = players;
            this.slots = this.gameVisuals.updateSlots(this.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: PlayerUno) => {
            this.players.push(newPlayer);
            this.slots = this.gameVisuals.updateSlots(this.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.Players, (players: PlayerUno[]) => {
            this.players = players;
            if (this.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the host.');
                this.isHost = true;
            }
            this.slots = this.gameVisuals.updateSlots(this.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.Host, () => {
            this.isHost = true;
        });
    }

    startGame() {
        this.socket.send(SendEvents.StartGame);
    }

    quitGame() {
        this.socket.send(SendEvents.QuitGame);
        this.token.deleteGameToken();
        this.router.navigate(['/home']);
    }

    async unoRules() {
        const dialogRef: MatDialogRef<UnoRulesComponent> = this.dialog.open(UnoRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
