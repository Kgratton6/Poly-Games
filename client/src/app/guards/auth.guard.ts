import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { NotificationService } from '@app/services/notification.service';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router: Router,
        private notification: NotificationService,
    ) {}

    canActivate(): Observable<boolean> {
        return this.authService.isLoggedIn().pipe(
            tap((isLogged) => {
                if (!isLogged) {
                    this.notification.notify('You need to login to see this page');
                    this.router.navigate(['/login']);
                }
            }),
        );
    }
}
