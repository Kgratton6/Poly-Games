import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { MAX_N_PLAYERS, MY_PLAYER_POSITION } from '@app/consts/game.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Player31 } from '@app/interfaces/player';
import { User } from '@app/interfaces/user';
import { GameService } from '@app/services/game.service';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';

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
    // hostUsername; // TODO : avoir la position du host en tout temp ou le nomm

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        protected gameService: GameService,
        protected token: TokenService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.WaitingInformation, (players: Player31[]) => {
            this.players = players; // TODO : ajouter des informations, par juste les joueurs
            this.updateSlots();
        });
        this.socket.on(ReceveEvents.NewPlayer, (newPlayer: Player31) => {
            this.players.push(newPlayer);
            this.updateSlots();
        });
        this.socket.on(ReceveEvents.Players, (players: Player31[]) => {
            this.players = players;
            if (this.players[0].username === this.yourPlayer.username) {
                this.notification.notify('you are the new host.');
                this.isHost = true;
            }
            this.updateSlots();
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
        this.token.deleteGameToken(); // TODO : doent delete the token
        this.router.navigate(['/home']);
    }

    updateSlots() {
        const tempArray: { player: Player31 | null; isHost: boolean }[] = Array.from({ length: MAX_N_PLAYERS }, (_, i) => ({
            player: this.players[i] || null,
            isHost: i === 0 && this.players[0]?.username === this.yourPlayer.username,
        }));

        const yourPlayerIndex = tempArray.findIndex((slot) => slot.player?.username === this.yourPlayer.username);
        const movementNeded = MY_PLAYER_POSITION - (yourPlayerIndex % MAX_N_PLAYERS);

        for (let i = 0; i < tempArray.length; i++) {
            const newIndex = (i + movementNeded) % tempArray.length;
            this.slots[newIndex] = tempArray[i];
        }
        [this.slots[0], this.slots[2]] = [this.slots[2], this.slots[0]];
    }
}
