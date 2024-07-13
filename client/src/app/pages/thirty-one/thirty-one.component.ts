import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GameState, ReceveEvents, SendEvents } from '@app/consts/events.const';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';
import { UsersDataService } from '@app/services/users-data.service';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-thirty-one',
    templateUrl: './thirty-one.component.html',
    styleUrls: ['./thirty-one.component.scss'],
})
export class ThirtyOneComponent implements OnInit, OnDestroy {
    tableId: string;
    gameState: GameState;
    yourPlayer: User = DEFAULT_USER;
    messageForm = new FormGroup({
        message: new FormControl(''),
    });
    sendIcon = faPaperPlane;

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        private route: ActivatedRoute,
        private router: Router,
        private token: TokenService,
        protected userDataService: UsersDataService,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.ConnectionConfirmation, (message: string) => {
            this.notification.notify(message);
        });
        this.socket.on(ReceveEvents.Error, (error: string) => {
            this.notification.notify(error);
        });
        this.socket.on(ReceveEvents.QuickedOut, (message: string) => {
            this.notification.notify(message);
            this.token.deleteGameToken();
            this.router.navigate(['/home']);
        });
        this.socket.on(ReceveEvents.NewGameState, (gameState: GameState) => {
            this.gameState = gameState;
            this.socket.send(SendEvents.GetStateInfo);
        });
        this.socket.on(ReceveEvents.PlayerLeft, (username: string) => {
            this.notification.notify(`${username} has left.`);
        });

        this.userDataService.getProfile().subscribe({
            next: (profile) => {
                this.yourPlayer = profile;
            },
        });

        this.route.paramMap.subscribe((params) => {
            const tableId = params.get('tableId');
            if (tableId) {
                this.tableId = tableId;
                this.token.setGameToken(tableId, 'thirty-one');
            }
        });
        this.socket.connect(this.tableId);
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }

    sendMessage() {
        console.log(this.messageForm.value.message);
    }
}
