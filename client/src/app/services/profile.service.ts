import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AUTH_TOKEN } from '@app/consts/profile.const';
import { User } from '@app/interfaces/user';
import { CommunicationService } from '@app/services/communication.service';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    constructor(private communicationService: CommunicationService) {}

    fetchProfile() {
        return this.communicationService.getProfile(localStorage.getItem(AUTH_TOKEN) || '').pipe(
            map((response: HttpResponse<string>) => {
                const body = JSON.parse(response.body as string);
                return body;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    fetchUsers() {
        return this.communicationService.getUsers().pipe(
            map((users: User[]) => {
                return users;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    fetchUser(username: string) {
        return this.communicationService.getUser(username).pipe(
            map((user: User) => {
                return user;
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
