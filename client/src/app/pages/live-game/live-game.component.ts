import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReceveEvents, SendEvents } from '@app/consts/events.const';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-live-game',
    templateUrl: './live-game.component.html',
    styleUrls: ['./live-game.component.scss'],
})
export class LiveGameComponent implements OnInit {
    constructor(
        private socket: SocketService,
        private location: Location,
    ) {}

    ngOnInit() {
        this.socket.on(ReceveEvents.ConnectionConfirmation, (message: string) => {
            console.log(message);
        });
        this.socket.on(ReceveEvents.NewMessage, (message: string) => {
            console.log(message);
        });
    }

    sendMessage() {
        this.socket.send(SendEvents.BroadcastMessage, 'hello');
    }

    sedbye() {
        this.socket.send(SendEvents.BroadcastMessage, 'bye');
    }

    sendMessageExept() {
        this.socket.send(SendEvents.BroadcastMessageExept, 'breuhh');
    }

    connect1() {
        console.log(this.location.path()); // todo : get path
        this.socket.connect('room1');
    }

    connect2() {
        console.log(this.location.path());
        this.socket.connect('room2');
    }

    disconnect() {
        this.socket.disconnect();
    }
}
