import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { ProfileService } from '@app/services/profile.service';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
    user: User = {
        firstName: 'null',
        lastName: 'null',
        username: 'null',
        email: 'null',
        icon: 'spade',
        isOnline: false,
    };

    constructor(
        private profileService: ProfileService,
        private readonly notification: NotificationService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        const username = this.route.snapshot.paramMap.get('username');
        this.profileService.fetchUser(username || '').subscribe({
            next: (user) => {
                this.user = user;
            },
            error: (error) => {
                this.notification.notify('Fetching user failed : ' + error.message);
            },
        });
    }
}
