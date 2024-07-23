import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-uno-rules',
    templateUrl: './uno-rules.component.html',
    styleUrls: ['./uno-rules.component.scss'],
})
export class UnoRulesComponent {
    constructor(public dialogRef: MatDialogRef<UnoRulesComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}
