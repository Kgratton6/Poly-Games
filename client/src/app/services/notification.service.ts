import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private notificationQueue: string[] = [];
    private isNotifying: boolean = false;

    constructor(private snackBar: MatSnackBar) {}

    notify(text: string) {
        if (!this.notificationQueue.includes(text)) {
            this.notificationQueue.push(text);
        }
        if (!this.isNotifying) {
            this.showNextNotification();
        }
    }

    private showNextNotification() {
        if (this.notificationQueue.length === 0) {
            this.isNotifying = false;
            return;
        }

        const text = this.notificationQueue.shift();
        this.isNotifying = true;

        const snackBarRef = this.snackBar.open(text || '', 'Close', {
            duration: 1000,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });

        snackBarRef.afterDismissed().subscribe(() => {
            this.isNotifying = false;
            this.showNextNotification();
        });
    }
}
