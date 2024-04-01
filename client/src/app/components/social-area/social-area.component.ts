import { Component, OnInit } from '@angular/core';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { UsersDataService } from '@app/services/users-data.service';

@Component({
    selector: 'app-social-area',
    templateUrl: './social-area.component.html',
    styleUrls: ['./social-area.component.scss'],
})
export class SocialAreaComponent implements OnInit {
    profile: User = DEFAULT_USER;
    users: User[] = [];
    filteredUsers: User[] = [];

    constructor(
        private profileService: UsersDataService,
        private readonly notification: NotificationService,
    ) {}

    ngOnInit(): void {
        this.profileService.getProfile().subscribe({
            next: (profile) => {
                this.profile = profile;

                this.profileService.getUsers().subscribe({
                    next: (users) => {
                        this.users = users.filter((user) => user.username !== this.profile.username);
                        this.filteredUsers = this.users;
                    },
                    error: (error) => {
                        this.notification.notify(error);
                    },
                });
            },
            error: (error) => {
                this.notification.notify(error);
            },
        });
    }

    onSearch(searchValue: string | null) {
        if (searchValue && searchValue.trim() !== '') {
            this.filteredUsers = this.users.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
                    user.username.toLowerCase().includes(searchValue.toLowerCase()),
            );
        } else {
            this.filteredUsers = this.users;
        }
    }
}
