import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private snackBar: MatSnackBar) {}

    notify(text: string) {
        this.snackBar.open(text, 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
        });
    }
}
