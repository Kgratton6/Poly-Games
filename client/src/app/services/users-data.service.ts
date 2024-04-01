import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@app/interfaces/user';
import { CommunicationService } from '@app/services/communication.service';
import { catchError, map, of, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UsersDataService {
    private profile: User | null = null;
    private users: User[] | null = null;

    constructor(private communicationService: CommunicationService) {}

    getProfile() {
        if (this.profile) {
            return of(this.profile);
        }

        return this.communicationService.getProfile().pipe(
            map((response: HttpResponse<string>) => {
                const body = JSON.parse(response.body as string);
                this.profile = body;
                return body;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    getUsers() {
        if (this.users) {
            return of(this.users);
        }

        return this.communicationService.getUsers().pipe(
            map((users: User[]) => {
                this.users = users;
                return users;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    getUser(username: string) {
        const user = this.users?.find((u) => u.username === username);
        if (user) {
            return of(user);
        }

        return this.communicationService.getUser(username).pipe(
            map((u: User) => {
                return u;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    clearData() {
        this.profile = null;
        this.users = null;
    }
}
