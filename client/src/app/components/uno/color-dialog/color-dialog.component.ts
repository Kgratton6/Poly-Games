import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-color-dialog',
    templateUrl: './color-dialog.component.html',
    styleUrls: ['./color-dialog.component.scss'],
})
export class ColorDialogComponent {
    constructor(public dialogRef: MatDialogRef<ColorDialogComponent>) {}

    selectColor(color: string): void {
        this.dialogRef.close(color);
    }
}
