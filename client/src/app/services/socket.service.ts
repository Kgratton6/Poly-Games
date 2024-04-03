/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NotificationService } from './notification.service';
import { TokenService } from './token.service';

interface Message {
    event: string;
    data: any;
}

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket: WebSocket;
    private readonly socketUrl: string = environment.socketUrl;
    private eventHandlers: { [key: string]: (data: any) => void } = {};

    constructor(
        private notification: NotificationService,
        private token: TokenService,
    ) {}

    isSocketAlive() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    connect(tableId: string) {
        if (!this.isSocketAlive()) {
            // this.token.setTableToken('abc');
            this.socket = new WebSocket(`${this.socketUrl}/${tableId}/${this.token.getUserToken()}`);
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
