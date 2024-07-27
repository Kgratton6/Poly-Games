import { Component, OnInit } from '@angular/core';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { Text } from '@app/interfaces/text';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { SocketThirtyOneService } from '@app/services/socket-thirty-one.service';
import { TokenService } from '@app/services/token.service';
import { UsersDataService } from '@app/services/users-data.service';

@Component({
    selector: 'app-black-jack',
    templateUrl: './black-jack.component.html',
    styleUrls: ['./black-jack.component.scss'],
})
export class BlackJackComponent implements OnInit {
    yourPlayer: User = DEFAULT_USER;
    chats: Text[] = [];

    constructor(
        protected socket: SocketThirtyOneService,
        protected notification: NotificationService,
        private token: TokenService,
        protected userDataService: UsersDataService,
    ) {}

    ngOnInit() {
        this.userDataService.getProfile().subscribe({
            next: (profile) => {
                this.yourPlayer = profile;
            },
        });
        this.token.setGameToken('0', 'black-jack');
    }

    // newTextFromDealer(message: Text) {
    //     this.notification.notify('You are playing alone...');
    // }
}
