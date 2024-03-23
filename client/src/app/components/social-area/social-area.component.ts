import { Component, OnInit } from '@angular/core';
import { User } from '@app/interfaces/user';
import { NotificationService } from '@app/services/notification.service';
import { ProfileService } from '@app/services/profile.service';

@Component({
    selector: 'app-social-area',
    templateUrl: './social-area.component.html',
    styleUrls: ['./social-area.component.scss'],
})
export class SocialAreaComponent implements OnInit {
    // TODO : get les informations du service
    profile: User = {
        firstName: 'null',
        lastName: 'null',
        username: 'null',
        email: 'null',
        icon: 'spade',
        isOnline: false,
    };
    users: User[] = [];
    filteredUsers: User[] = [];

    constructor(
        private profileService: ProfileService,
        private readonly notification: NotificationService,
    ) {}

    ngOnInit(): void {
        this.profileService.fetchProfile().subscribe({
            next: (profile) => {
                this.profile = profile;

                this.profileService.fetchUsers().subscribe({
                    next: (users) => {
                        this.users = users.filter((user) => user.username !== this.profile.username);
                        this.filteredUsers = this.users;
                    },
                    error: (error) => {
                        this.notification.notify('Fetching users failed: ' + error.message);
                    },
                });
            },
            error: (error) => {
                this.notification.notify('Fetching profile failed: ' + error.message);
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
