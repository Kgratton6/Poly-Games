import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ThirtyOneRulesComponent } from '@app/components/thirty-one/thirty-one-rules/thirty-one-rules.component';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameVisualsService } from '@app/services/game-visuals.service';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'app-thirty-one-waiting',
    templateUrl: './thirty-one-waiting.component.html',
    styleUrls: ['./thirty-one-waiting.component.scss'],
})
export class ThirtyOneWaitingComponent implements OnInit {
    @Input() yourPlayer: User = DEFAULT_USER;
    tableId: string;
    players: Player31[] = [];
    slots: { player: Player31 | null; isHost: boolean }[] = [];
    isHost = false;
    questionIcon = faQuestionCircle;

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected gameService: GameService,
        protected token: TokenService,
        private router: Router,
        private gameVisuals: GameVisualsService,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WaitingInformation, (players: Player31[]) => {
            this.players = players;
            this.slots = this.gameVisuals.updateSlots(this.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: Player31) => {
            this.players.push(newPlayer);
            this.slots = this.gameVisuals.updateSlots(this.players, this.yourPlayer);
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
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

    async thirtyOneRules() {
        const dialogRef: MatDialogRef<ThirtyOneRulesComponent> = this.dialog.open(ThirtyOneRulesComponent, { panelClass: 'custom-dialog-container' });
        await lastValueFrom(dialogRef.afterClosed());
    }
}
