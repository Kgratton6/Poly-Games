import { Component, Input } from '@angular/core';
import { DEFAULT_USER } from '@app/consts/profile.const';
import { User } from '@app/interfaces/user';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
    @Input() profile: User = DEFAULT_USER;
}
