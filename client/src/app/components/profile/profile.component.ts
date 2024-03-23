import { Component, Input } from '@angular/core';
import { User } from '@app/interfaces/user';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    @Input() profile: User = {
        firstName: 'null',
        lastName: 'null',
        username: 'null',
        email: 'null',
        icon: 'spade',
        isOnline: false,
    };
}
