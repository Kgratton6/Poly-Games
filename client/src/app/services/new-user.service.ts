import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { User } from '@app/interfaces/user';
import { catchError, map, throwError } from 'rxjs';
import { CommunicationService } from './communication.service';

@Injectable({
    providedIn: 'root',
})
export class NewUserService {
    constructor(private communicationService: CommunicationService) {}

    getUserFromForm(form: FormGroup, chooseIcon: string): User {
        const user = form.value;
        return {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            isOnline: false,
            icon: chooseIcon,
        };
    }

    createUser(user: User, password: string) {
        return this.communicationService.createAccount(user, password).pipe(
            map(() => true),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
