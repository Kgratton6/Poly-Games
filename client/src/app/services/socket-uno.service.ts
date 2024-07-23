/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
import { TokenService } from './token.service';

@Injectable({
    providedIn: 'root',
})
export class SocketUnoService {
    private socket: WebSocket;
    private isSocketAlive = false;
    private readonly socketUrl: string = environment.socketUrl;
    private eventHandlers: { [key: string]: (data: any) => void } = {};

    constructor(
        private notification: NotificationService,
        private token: TokenService,
    ) {}
    connect(tableId?: string) {
        if (!this.isSocketAlive && tableId) {
            this.socket = new WebSocket(`${this.socketUrl}/uno/${tableId}/${this.token.getUserToken()}`);
            this.isSocketAlive = true;

            this.socket.onmessage = (event) => {
                const message: Message = JSON.parse(event.data);
                this.handleMessage(message);
            };

            this.socket.onerror = (event) => {
                this.notification.notify('Server error : ' + event);
            };
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.isSocketAlive = false;
        }
    }

    send(event: string, data?: any) {
        const message = JSON.stringify({ event, data });
        this.socket.send(message);
    }

    on(eventType: string, action: (data: any) => void): void {
        this.eventHandlers[eventType] = action;
    }

    private handleMessage(message: Message) {
        const event = message.event;
        const data = message.data;
        const handler = this.eventHandlers[event];

        if (handler) {
            handler(data);
        } else {
            this.notification.notify(`No handler registered the event : ${event}`);
        }
    }
}
