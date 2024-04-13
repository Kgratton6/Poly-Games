import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameState, ReceveEvents, SendEvents } from '@app/consts/events.const';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';

@Component({
    selector: 'app-thirty-one',
    templateUrl: './thirty-one.component.html',
    styleUrls: ['./thirty-one.component.scss'],
})
export class ThirtyOneComponent implements OnInit, OnDestroy {
    tableId: string;
    gameState: GameState;

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        private route: ActivatedRoute,
        private router: Router,
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
            this.router.navigate(['/home']);
        });
        this.socket.on(ReceveEvents.NewGameState, (gameState: GameState) => {
            this.gameState = gameState;
            this.socket.send(SendEvents.GetStateInfo);
        });

        this.route.paramMap.subscribe((params) => {
            const tableId = params.get('tableId');
            if (tableId) this.tableId = tableId;
        });
        this.socket.connect(this.tableId);
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }
}
